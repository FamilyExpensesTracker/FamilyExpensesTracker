<?php
// api/auth.php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/Database.php';
require_once __DIR__ . '/../lib/Mailer.php';
require_once __DIR__ . '/../lib/TokenHelper.php';
require_once __DIR__ . '/../lib/Utils.php';

$requestId = getRequestId();

try {
    $db = new Database($config);
    $conn = $db->getConnection();
    $mailer = new Mailer($config);
} catch (Exception $e) {
    logError('Database connection failed', ['requestId' => $requestId, 'error' => $e->getMessage()], $config);
    sendError('Database connection failed', 500, $requestId);
}

if (random_int(1, 100) === 1) {
    cleanupExpiredRecords($conn);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$rawInput = file_get_contents('php://input');
$input = [];

if ($rawInput !== false && trim($rawInput) !== '') {
    $input = json_decode($rawInput, true);
    if (!is_array($input)) {
        sendError('Invalid JSON payload', 400, $requestId);
    }
}

$action = $input['action'] ?? null;

if ($method === 'POST' && $action === 'request_otp') {
    $email = strtolower(trim((string)($input['email'] ?? '')));
    if (!validateEmail($email)) {
        sendError('Invalid email address', 400, $requestId);
    }

    $clientIP = getClientIP($config);
    $emailBucket = 'otp_email_' . hash('sha256', $email);

    if (!checkRateLimit($conn, 'otp_request_ip_' . $clientIP, 5, 3600)) {
        sendError('Too many requests. Please try again later.', 429, $requestId);
    }

    if (!checkRateLimit($conn, $emailBucket, 3, 600)) {
        sendError('Too many requests for this email. Please wait 10 minutes.', 429, $requestId);
    }

    try {
        $stmt = $conn->prepare('SELECT id, is_active FROM users WHERE email = :email');
        $stmt->bindValue(':email', $email, SQLITE3_TEXT);
        $result = $stmt->execute();
        $user = $result ? $result->fetchArray(SQLITE3_ASSOC) : false;

        if (!$user) {
            $stmt = $conn->prepare('INSERT INTO users (email, created_at, is_active, otp_failed_attempts, otp_locked_until) VALUES (:email, :created_at, 1, 0, 0)');
            $stmt->bindValue(':email', $email, SQLITE3_TEXT);
            $stmt->bindValue(':created_at', time(), SQLITE3_INTEGER);
            $stmt->execute();
            $userId = $conn->lastInsertRowID();
        } else {
            if ((int)$user['is_active'] !== 1) {
                sendError('Account is disabled. Please contact support.', 403, $requestId);
            }
            $userId = (int)$user['id'];
        }

        $otp = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = time() + ((int)$config['OTP_EXPIRY_MINUTES'] * 60);
        $otpHash = hash_hmac('sha256', $otp, $config['SECRET_KEY']);

        $stmt = $conn->prepare('UPDATE otp_codes SET used = 1 WHERE user_id = :user_id AND used = 0');
        $stmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
        $stmt->execute();

        $stmt = $conn->prepare('INSERT INTO otp_codes (user_id, code_hash, expires_at, used, created_at, ip_address, attempt_count, last_attempt_at) VALUES (:user_id, :code_hash, :expires_at, 0, :created_at, :ip, 0, 0)');
        $stmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
        $stmt->bindValue(':code_hash', $otpHash, SQLITE3_TEXT);
        $stmt->bindValue(':expires_at', $expiresAt, SQLITE3_INTEGER);
        $stmt->bindValue(':created_at', time(), SQLITE3_INTEGER);
        $stmt->bindValue(':ip', $clientIP, SQLITE3_TEXT);
        $stmt->execute();

        if (!$mailer->sendOTP($email, $otp)) {
            logError('OTP email send failure', ['requestId' => $requestId, 'email' => $email], $config);
            sendError('Failed to send email. Please contact administrator.', 500, $requestId);
        }

        sendResponse([
            'message' => 'OTP sent to your email',
            'expiresIn' => ((int)$config['OTP_EXPIRY_MINUTES']) * 60,
        ]);
    } catch (Exception $e) {
        logError('OTP request error', ['requestId' => $requestId, 'error' => $e->getMessage()], $config);
        sendError('An error occurred. Please try again later.', 500, $requestId);
    }
}

if ($method === 'POST' && $action === 'verify_otp') {
    $email = strtolower(trim((string)($input['email'] ?? '')));
    $otp = preg_replace('/[^0-9]/', '', (string)($input['otp'] ?? ''));

    if (!validateEmail($email) || strlen($otp) !== 6) {
        sendError('Invalid email or OTP format', 400, $requestId);
    }

    $clientIP = getClientIP($config);
    if (!checkRateLimit($conn, 'otp_verify_ip_' . $clientIP, 20, 600)) {
        sendError('Too many verification attempts. Please try again later.', 429, $requestId);
    }

    try {
        $stmt = $conn->prepare('SELECT id, email, settings, is_active, otp_failed_attempts, otp_locked_until FROM users WHERE email = :email LIMIT 1');
        $stmt->bindValue(':email', $email, SQLITE3_TEXT);
        $result = $stmt->execute();
        $user = $result ? $result->fetchArray(SQLITE3_ASSOC) : false;

        if (!$user) {
            sendError('Invalid or expired OTP', 401, $requestId);
        }

        if ((int)$user['is_active'] !== 1) {
            sendError('Account is disabled. Please contact support.', 403, $requestId);
        }

        $lockUntil = (int)($user['otp_locked_until'] ?? 0);
        if ($lockUntil > time()) {
            sendError('Too many invalid attempts. Please try again later.', 429, $requestId);
        }

        $otpHash = hash_hmac('sha256', $otp, $config['SECRET_KEY']);
        $stmt = $conn->prepare('SELECT id FROM otp_codes WHERE user_id = :user_id AND code_hash = :code_hash AND used = 0 AND expires_at > :now ORDER BY created_at DESC LIMIT 1');
        $stmt->bindValue(':user_id', (int)$user['id'], SQLITE3_INTEGER);
        $stmt->bindValue(':code_hash', $otpHash, SQLITE3_TEXT);
        $stmt->bindValue(':now', time(), SQLITE3_INTEGER);
        $result = $stmt->execute();
        $otpRow = $result ? $result->fetchArray(SQLITE3_ASSOC) : false;

        if (!$otpRow) {
            $failedAttempts = ((int)$user['otp_failed_attempts']) + 1;
            $maxAttempts = (int)$config['OTP_MAX_ATTEMPTS'];
            $lockoutSeconds = ((int)$config['OTP_LOCKOUT_MINUTES']) * 60;
            $nextLockUntil = $failedAttempts >= $maxAttempts ? (time() + $lockoutSeconds) : 0;

            $stmt = $conn->prepare('UPDATE users SET otp_failed_attempts = :failed, otp_locked_until = :locked_until WHERE id = :id');
            $stmt->bindValue(':failed', $failedAttempts, SQLITE3_INTEGER);
            $stmt->bindValue(':locked_until', $nextLockUntil, SQLITE3_INTEGER);
            $stmt->bindValue(':id', (int)$user['id'], SQLITE3_INTEGER);
            $stmt->execute();

            sendError('Invalid or expired OTP', 401, $requestId);
        }

        $stmt = $conn->prepare('UPDATE otp_codes SET used = 1, attempt_count = attempt_count + 1, last_attempt_at = :now WHERE id = :id');
        $stmt->bindValue(':now', time(), SQLITE3_INTEGER);
        $stmt->bindValue(':id', (int)$otpRow['id'], SQLITE3_INTEGER);
        $stmt->execute();

        $stmt = $conn->prepare('UPDATE users SET last_login = :now, otp_failed_attempts = 0, otp_locked_until = 0 WHERE id = :id');
        $stmt->bindValue(':now', time(), SQLITE3_INTEGER);
        $stmt->bindValue(':id', (int)$user['id'], SQLITE3_INTEGER);
        $stmt->execute();

        $token = generateToken((int)$user['id'], $config);
        $settings = null;
        if (!empty($user['settings'])) {
            $decodedSettings = json_decode($user['settings'], true);
            if (is_array($decodedSettings)) {
                $settings = $decodedSettings;
            }
        }

        sendResponse([
            'token' => $token,
            'expiresIn' => ((int)$config['TOKEN_EXPIRY_DAYS']) * 24 * 60 * 60,
            'user' => [
                'id' => (int)$user['id'],
                'email' => $user['email'],
                'settings' => $settings,
            ],
        ]);
    } catch (Exception $e) {
        logError('OTP verification error', ['requestId' => $requestId, 'error' => $e->getMessage()], $config);
        sendError('An error occurred. Please try again later.', 500, $requestId);
    }
}

if ($method === 'POST' && $action === 'logout') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(.+)$/i', $authHeader, $matches)) {
        $token = trim($matches[1]);
        try {
            revokeToken($token, $config, $conn);
        } catch (Exception $e) {
            logError('Token revoke error', ['requestId' => $requestId, 'error' => $e->getMessage()], $config);
        }
    }

    sendResponse(['message' => 'Logged out successfully']);
}

sendError('Invalid request', 400, $requestId);
?>