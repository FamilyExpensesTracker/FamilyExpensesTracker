<?php
// lib/TokenHelper.php - JWT token generation, validation and revocation

function generateToken($userId, $config) {
    $now = time();
    $jti = base64UrlEncode(random_bytes(16));

    $payload = [
        'user_id' => (int)$userId,
        'jti' => $jti,
        'iat' => $now,
        'exp' => $now + ((int)$config['TOKEN_EXPIRY_DAYS'] * 24 * 60 * 60),
    ];

    return encodeJWT($payload, $config['SECRET_KEY']);
}

function getTokenPayload($token, $config, $conn = null) {
    $payload = decodeJWT($token, $config['SECRET_KEY']);

    if (!$payload || !isset($payload['user_id']) || !isset($payload['exp']) || !isset($payload['jti'])) {
        return false;
    }

    if (time() > (int)$payload['exp']) {
        return false;
    }

    if ($conn && isTokenRevoked($conn, $payload['jti'])) {
        return false;
    }

    return $payload;
}

function getUserFromToken($token, $config, $conn = null) {
    $payload = getTokenPayload($token, $config, $conn);
    if (!$payload) {
        return false;
    }

    return (int)$payload['user_id'];
}

function revokeToken($token, $config, $conn) {
    $payload = decodeJWT($token, $config['SECRET_KEY']);
    if (!$payload || !isset($payload['jti']) || !isset($payload['exp']) || !isset($payload['user_id'])) {
        return false;
    }

    $stmt = $conn->prepare('INSERT OR REPLACE INTO revoked_tokens (jti, user_id, expires_at, created_at) VALUES (:jti, :user_id, :expires_at, :created_at)');
    $stmt->bindValue(':jti', $payload['jti'], SQLITE3_TEXT);
    $stmt->bindValue(':user_id', (int)$payload['user_id'], SQLITE3_INTEGER);
    $stmt->bindValue(':expires_at', (int)$payload['exp'], SQLITE3_INTEGER);
    $stmt->bindValue(':created_at', time(), SQLITE3_INTEGER);

    return (bool)$stmt->execute();
}

function isTokenRevoked($conn, $jti) {
    $stmt = $conn->prepare('SELECT 1 FROM revoked_tokens WHERE jti = :jti LIMIT 1');
    $stmt->bindValue(':jti', $jti, SQLITE3_TEXT);
    $result = $stmt->execute();

    return $result && (bool)$result->fetchArray(SQLITE3_ASSOC);
}

function encodeJWT($payload, $secret) {
    $headerJson = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payloadJson = json_encode($payload);

    $base64UrlHeader = base64UrlEncode($headerJson);
    $base64UrlPayload = base64UrlEncode($payloadJson);

    $signature = hash_hmac('sha256', $base64UrlHeader . '.' . $base64UrlPayload, $secret, true);
    $base64UrlSignature = base64UrlEncode($signature);

    return $base64UrlHeader . '.' . $base64UrlPayload . '.' . $base64UrlSignature;
}

function decodeJWT($jwt, $secret) {
    $parts = explode('.', (string)$jwt);
    if (count($parts) !== 3) {
        return false;
    }

    list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $parts;

    $signature = base64UrlDecode($base64UrlSignature);
    if ($signature === false) {
        return false;
    }

    $expectedSignature = hash_hmac('sha256', $base64UrlHeader . '.' . $base64UrlPayload, $secret, true);
    if (!hash_equals($expectedSignature, $signature)) {
        return false;
    }

    $payload = json_decode(base64UrlDecode($base64UrlPayload), true);
    return is_array($payload) ? $payload : false;
}

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data) {
    $base64Url = strtr((string)$data, '-_', '+/');
    $padding = strlen($base64Url) % 4;

    if ($padding !== 0) {
        $base64Url .= str_repeat('=', 4 - $padding);
    }

    return base64_decode($base64Url, true);
}
?>