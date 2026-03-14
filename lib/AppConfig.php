<?php
// lib/AppConfig.php - Centralized application configuration loader

function appProjectRoot() {
    return dirname(__DIR__);
}

function appNormalizePath($path) {
    if (!is_string($path) || $path === '') {
        return '';
    }

    $resolved = realpath($path);
    $normalized = str_replace('\\', '/', $resolved !== false ? $resolved : $path);
    return rtrim($normalized, '/');
}

function appDocumentRoot() {
    return appNormalizePath((string)($_SERVER['DOCUMENT_ROOT'] ?? ''));
}

function appPrivateRoot() {
    $projectRoot = appNormalizePath(appProjectRoot());
    $documentRoot = appDocumentRoot();

    if ($projectRoot !== '' && $documentRoot !== '' && strpos($projectRoot . '/', $documentRoot . '/') === 0) {
        return dirname($documentRoot) . '/private';
    }

    return dirname(appProjectRoot()) . '/private';
}

function appPublicPrivateRoot() {
    return appProjectRoot() . '/private';
}

function appConfigCandidates() {
    $envConfigPath = getenv('FAMILY_EXPENSES_CONFIG_PATH');

    $candidates = [];
    if (!empty($envConfigPath)) {
        $candidates[] = $envConfigPath;
    }

    // Default to a private directory outside the public app root.
    $candidates[] = appPrivateRoot() . '/config.php';

    // Legacy public-root private/ support requires explicit opt-in.
    if (getenv('FAMILY_EXPENSES_ALLOW_PUBLIC_PRIVATE') === '1') {
        $candidates[] = appPublicPrivateRoot() . '/config.php';
    }

    return array_values(array_unique($candidates));
}

function appDefaultDataPath() {
    return appPrivateRoot() . '/data/expenses.db';
}

function appDefaultLogPath() {
    return appPrivateRoot() . '/logs';
}

function appDevConfig() {
    return [
        'APP_ENV' => 'development',
        'SECRET_KEY' => 'dev-only-secret-change-me',
        'DB_PATH' => appDefaultDataPath(),
        'MAIL_FROM' => 'noreply@example.com',
        'MAIL_FROM_NAME' => 'Family Expense Tracker',
        'OTP_EXPIRY_MINUTES' => 10,
        'OTP_MAX_ATTEMPTS' => 5,
        'OTP_LOCKOUT_MINUTES' => 15,
        'TOKEN_EXPIRY_DAYS' => 7,
        'SITE_URL' => 'http://localhost',
        'ALLOWED_ORIGINS' => ['http://localhost', 'http://127.0.0.1'],
        'TRUSTED_PROXIES' => [],
        'LOG_PATH' => appDefaultLogPath(),
        'USE_SMTP' => false,
        'SMTP_HOST' => '',
        'SMTP_PORT' => 587,
        'SMTP_USER' => '',
        'SMTP_PASS' => '',
        'SMTP_SECURE' => 'tls',
    ];
}

function normalizeAppConfig($config) {
    if (!is_array($config)) {
        throw new RuntimeException('Invalid configuration format');
    }

    $defaults = [
        'APP_ENV' => 'production',
        'OTP_EXPIRY_MINUTES' => 10,
        'OTP_MAX_ATTEMPTS' => 5,
        'OTP_LOCKOUT_MINUTES' => 15,
        'TOKEN_EXPIRY_DAYS' => 7,
        'ALLOWED_ORIGINS' => [],
        'TRUSTED_PROXIES' => [],
        'LOG_PATH' => appDefaultLogPath(),
        'USE_SMTP' => false,
        'SMTP_HOST' => '',
        'SMTP_PORT' => 587,
        'SMTP_USER' => '',
        'SMTP_PASS' => '',
        'SMTP_SECURE' => 'tls',
    ];

    $config = array_merge($defaults, $config);

    if (empty($config['SECRET_KEY'])) {
        throw new RuntimeException('SECRET_KEY is missing in configuration');
    }

    if (empty($config['DB_PATH'])) {
        $config['DB_PATH'] = appDefaultDataPath();
    }

    if (!is_array($config['ALLOWED_ORIGINS'])) {
        $config['ALLOWED_ORIGINS'] = [];
    }

    if (!is_array($config['TRUSTED_PROXIES'])) {
        $config['TRUSTED_PROXIES'] = [];
    }

    return $config;
}

function loadAppConfig() {
    foreach (appConfigCandidates() as $path) {
        if (is_file($path)) {
            $config = require $path;
            return normalizeAppConfig($config);
        }
    }

    if (getenv('FAMILY_EXPENSES_ALLOW_INSECURE_DEV') === '1') {
        return normalizeAppConfig(appDevConfig());
    }

    throw new RuntimeException(
        'Configuration file not found. Run install.php, move any legacy public-root config into the private directory created by the installer, or set FAMILY_EXPENSES_CONFIG_PATH. Set FAMILY_EXPENSES_ALLOW_PUBLIC_PRIVATE=1 only for legacy public-root private/ setups.'
    );
}
?>
