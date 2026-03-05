<?php
// api/bootstrap.php - Shared bootstrap for API endpoints

require_once __DIR__ . '/../lib/AppConfig.php';
require_once __DIR__ . '/../lib/Utils.php';

try {
    $config = loadAppConfig();
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'Server configuration error'
    ]);
    exit;
}

if (!applyCorsHeaders($config)) {
    sendError('Origin not allowed', 403);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}
?>