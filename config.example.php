<?php
// config.example.php
// Copy this file into the private directory created by install.php and customize values for your deployment.

return [
    'APP_ENV' => 'production',
    'SECRET_KEY' => 'replace-with-a-strong-random-base64-key',
    'DB_PATH' => __DIR__ . '/data/expenses.db',
    'MAIL_FROM' => 'noreply@example.com',
    'MAIL_FROM_NAME' => 'Family Expense Tracker',
    'OTP_EXPIRY_MINUTES' => 10,
    'OTP_MAX_ATTEMPTS' => 5,
    'OTP_LOCKOUT_MINUTES' => 15,
    'TOKEN_EXPIRY_DAYS' => 7,
    'SITE_URL' => 'https://example.com',

    // CORS: keep empty for same-origin only. Add explicit origins for cross-origin clients.
    'ALLOWED_ORIGINS' => [],

    // Trusted reverse proxies (IP or CIDR). Leave empty unless behind a known proxy.
    'TRUSTED_PROXIES' => [],

    // Server log directory for API/auth/sync events
    'LOG_PATH' => __DIR__ . '/logs',

    // SMTP settings
    'USE_SMTP' => false,
    'SMTP_HOST' => '',
    'SMTP_PORT' => 587,
    'SMTP_USER' => '',
    'SMTP_PASS' => '',
    'SMTP_SECURE' => 'tls',
];
