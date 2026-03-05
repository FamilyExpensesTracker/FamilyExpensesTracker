<?php
// lib/Utils.php - Shared helpers for request handling, security and logging

function getRequestId() {
    try {
        return bin2hex(random_bytes(8));
    } catch (Exception $e) {
        return uniqid('req_', true);
    }
}

function sendError($message, $status = 400, $requestId = null) {
    http_response_code($status);
    header('Content-Type: application/json');

    $response = [
        'success' => false,
        'error' => $message,
    ];

    if ($requestId) {
        $response['requestId'] = $requestId;
    }

    echo json_encode($response);
    exit;
}

function sendResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'data' => $data,
    ]);
    exit;
}

function sanitizeInput($input) {
    if (is_array($input)) {
        return array_map('sanitizeInput', $input);
    }

    return trim((string)$input);
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function generateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';

    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[random_int(0, $charactersLength - 1)];
    }

    return $randomString;
}

function isIpInCidr($ip, $cidr) {
    if (strpos($cidr, '/') === false) {
        return $ip === $cidr;
    }

    list($subnet, $maskBits) = explode('/', $cidr, 2);
    $maskBits = (int)$maskBits;

    $ipBin = @inet_pton($ip);
    $subnetBin = @inet_pton($subnet);
    if ($ipBin === false || $subnetBin === false || strlen($ipBin) !== strlen($subnetBin)) {
        return false;
    }

    $bytes = intdiv($maskBits, 8);
    $bits = $maskBits % 8;

    if ($bytes > 0 && substr($ipBin, 0, $bytes) !== substr($subnetBin, 0, $bytes)) {
        return false;
    }

    if ($bits === 0) {
        return true;
    }

    $mask = chr((0xFF00 >> $bits) & 0xFF);
    return ((ord($ipBin[$bytes]) & ord($mask)) === (ord($subnetBin[$bytes]) & ord($mask)));
}

function isTrustedProxyIp($ip, $trustedProxies) {
    foreach ($trustedProxies as $proxy) {
        if (isIpInCidr($ip, $proxy)) {
            return true;
        }
    }
    return false;
}

function getClientIP($config = []) {
    $remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $trustedProxies = $config['TRUSTED_PROXIES'] ?? [];

    if (!is_array($trustedProxies)) {
        $trustedProxies = [];
    }

    // Only trust forwarding headers when request came through a trusted proxy.
    if (!empty($trustedProxies) && isTrustedProxyIp($remoteAddr, $trustedProxies)) {
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ips = array_map('trim', explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']));
            foreach ($ips as $ip) {
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }

        if (!empty($_SERVER['HTTP_X_REAL_IP']) && filter_var($_SERVER['HTTP_X_REAL_IP'], FILTER_VALIDATE_IP)) {
            return $_SERVER['HTTP_X_REAL_IP'];
        }

        if (!empty($_SERVER['HTTP_CF_CONNECTING_IP']) && filter_var($_SERVER['HTTP_CF_CONNECTING_IP'], FILTER_VALIDATE_IP)) {
            return $_SERVER['HTTP_CF_CONNECTING_IP'];
        }
    }

    return filter_var($remoteAddr, FILTER_VALIDATE_IP) ? $remoteAddr : '0.0.0.0';
}

function normalizeOrigin($origin) {
    $parsed = parse_url($origin);
    if (!$parsed || empty($parsed['scheme']) || empty($parsed['host'])) {
        return null;
    }

    $scheme = strtolower($parsed['scheme']);
    $host = strtolower($parsed['host']);
    $port = isset($parsed['port']) ? ':' . $parsed['port'] : '';

    return $scheme . '://' . $host . $port;
}

function applyCorsHeaders($config) {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowedOrigins = $config['ALLOWED_ORIGINS'] ?? [];

    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');

    if (empty($origin)) {
        return true;
    }

    if (!is_array($allowedOrigins)) {
        $allowedOrigins = [];
    }

    $normalizedOrigin = normalizeOrigin($origin);

    // Always allow same-origin browser requests.
    $host = $_SERVER['HTTP_HOST'] ?? '';
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $normalizedCurrentOrigin = normalizeOrigin($scheme . '://' . $host);

    if ($normalizedOrigin && $normalizedCurrentOrigin && $normalizedOrigin === $normalizedCurrentOrigin) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        return true;
    }

    if (in_array('*', $allowedOrigins, true)) {
        header('Access-Control-Allow-Origin: *');
        return true;
    }

    $normalizedAllowed = array_filter(array_map('normalizeOrigin', $allowedOrigins));

    if ($normalizedOrigin && in_array($normalizedOrigin, $normalizedAllowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        return true;
    }

    return false;
}

function checkRateLimit($conn, $key, $maxAttempts, $windowSeconds) {
    $now = time();

    $conn->exec('BEGIN IMMEDIATE TRANSACTION');
    try {
        $stmt = $conn->prepare('SELECT attempt_count, window_start FROM rate_limits WHERE bucket_key = :key');
        $stmt->bindValue(':key', $key, SQLITE3_TEXT);
        $result = $stmt->execute();
        $row = $result ? $result->fetchArray(SQLITE3_ASSOC) : false;

        $allowed = true;

        if (!$row) {
            $stmt = $conn->prepare('INSERT INTO rate_limits (bucket_key, attempt_count, window_start, updated_at) VALUES (:key, 1, :window_start, :updated_at)');
            $stmt->bindValue(':key', $key, SQLITE3_TEXT);
            $stmt->bindValue(':window_start', $now, SQLITE3_INTEGER);
            $stmt->bindValue(':updated_at', $now, SQLITE3_INTEGER);
            $stmt->execute();
        } else {
            $attemptCount = (int)$row['attempt_count'];
            $windowStart = (int)$row['window_start'];

            if (($now - $windowStart) >= $windowSeconds) {
                $stmt = $conn->prepare('UPDATE rate_limits SET attempt_count = 1, window_start = :window_start, updated_at = :updated_at WHERE bucket_key = :key');
                $stmt->bindValue(':key', $key, SQLITE3_TEXT);
                $stmt->bindValue(':window_start', $now, SQLITE3_INTEGER);
                $stmt->bindValue(':updated_at', $now, SQLITE3_INTEGER);
                $stmt->execute();
            } elseif ($attemptCount >= $maxAttempts) {
                $allowed = false;
            } else {
                $stmt = $conn->prepare('UPDATE rate_limits SET attempt_count = attempt_count + 1, updated_at = :updated_at WHERE bucket_key = :key');
                $stmt->bindValue(':key', $key, SQLITE3_TEXT);
                $stmt->bindValue(':updated_at', $now, SQLITE3_INTEGER);
                $stmt->execute();
            }
        }

        $conn->exec('COMMIT');
        return $allowed;
    } catch (Exception $e) {
        $conn->exec('ROLLBACK');
        return false;
    }
}

function logToFile($level, $message, $context = [], $config = []) {
    $logDir = $config['LOG_PATH'] ?? (dirname(__DIR__) . '/private/logs');
    if (!is_dir($logDir)) {
        @mkdir($logDir, 0755, true);
    }

    $logFile = rtrim($logDir, '/\\') . '/' . date('Y-m-d') . '.log';
    $timestamp = date('Y-m-d H:i:s');

    $logLine = '[' . $timestamp . '] ' . strtoupper($level) . ': ' . $message;
    if (!empty($context)) {
        $logLine .= ' ' . json_encode($context);
    }
    $logLine .= "\n";

    @file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX);
}

function logError($message, $context = [], $config = []) {
    logToFile('error', $message, $context, $config);
}

function logInfo($message, $context = [], $config = []) {
    logToFile('info', $message, $context, $config);
}
?>