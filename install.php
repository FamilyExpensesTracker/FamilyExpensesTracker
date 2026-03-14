<?php
// install.php - Setup and migration runner. Delete this file after successful installation.

require_once __DIR__ . '/lib/MigrationRunner.php';

// Guard: refuse to run if already configured (prevents info leak in production).
$guardPaths = [dirname(__DIR__) . '/private/config.php', __DIR__ . '/private/config.php'];
$alreadyConfigured = false;
foreach ($guardPaths as $gp) {
    if (is_file($gp)) { $alreadyConfigured = true; break; }
}
if ($alreadyConfigured) {
    http_response_code(403);
    echo '<!DOCTYPE html><html><head><title>Already Installed</title></head><body>'
       . '<h1>Already Installed</h1>'
       . '<p>Delete <code>install.php</code> from your server for security.</p>'
       . '</body></html>';
    exit;
}

$errors = [];
$success = [];

function ensureDirectory($path) {
    return is_dir($path) || @mkdir($path, 0755, true);
}

function safeHost($value) {
    $host = preg_replace('/[^A-Za-z0-9\.\-:]/', '', (string)$value);
    return $host !== '' ? $host : 'localhost';
}

function buildConfigContent($secretKey, $dbPath, $siteUrl, $mailFrom, $logPath) {
    return "<?php\n"
        . "// Auto-generated configuration file\n"
        . "// Generated on: " . date('Y-m-d H:i:s') . "\n\n"
        . "return [\n"
        . "    'APP_ENV' => 'production',\n"
        . "    'SECRET_KEY' => " . var_export($secretKey, true) . ",\n"
        . "    'DB_PATH' => " . var_export($dbPath, true) . ",\n"
        . "    'MAIL_FROM' => " . var_export($mailFrom, true) . ",\n"
        . "    'MAIL_FROM_NAME' => 'Family Expense Tracker',\n"
        . "    'OTP_EXPIRY_MINUTES' => 10,\n"
        . "    'OTP_MAX_ATTEMPTS' => 5,\n"
        . "    'OTP_LOCKOUT_MINUTES' => 15,\n"
        . "    'TOKEN_EXPIRY_DAYS' => 7,\n"
        . "    'SITE_URL' => " . var_export($siteUrl, true) . ",\n"
        . "    'ALLOWED_ORIGINS' => [],\n"
        . "    'TRUSTED_PROXIES' => [],\n"
        . "    'LOG_PATH' => " . var_export($logPath, true) . ",\n\n"
        . "    // SMTP settings\n"
        . "    'USE_SMTP' => false,\n"
        . "    'SMTP_HOST' => '',\n"
        . "    'SMTP_PORT' => 587,\n"
        . "    'SMTP_USER' => '',\n"
        . "    'SMTP_PASS' => '',\n"
        . "    'SMTP_SECURE' => 'tls',\n"
        . "];\n";
}

$publicPath = __DIR__;
$configPath = null;
$privatePath = null;

$privatePath = dirname($publicPath) . '/private';
$configPath = $privatePath . '/config.php';

if (!is_file($configPath)) {
    $configPath = null;
}

if ($configPath === null) {
    if (!ensureDirectory($privatePath)) {
        $errors[] = 'Could not create ../private outside the web root. Create it manually or set FAMILY_EXPENSES_CONFIG_PATH to a secure location.';
    } else {
        $dataPath = $privatePath . '/data';
        $logPath = $privatePath . '/logs';

        if (!ensureDirectory($dataPath)) {
            $errors[] = 'Could not create private data directory.';
        }

        if (!ensureDirectory($logPath)) {
            $errors[] = 'Could not create private logs directory.';
        }

        if (empty($errors)) {
            $secretKey = base64_encode(random_bytes(32));
            $host = safeHost($_SERVER['HTTP_HOST'] ?? 'localhost');
            $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
            $scheme = $isHttps ? 'https' : 'http';
            $siteUrl = $scheme . '://' . $host;
            $mailFrom = 'noreply@' . preg_replace('/:.*/', '', $host);
            $dbPath = $dataPath . '/expenses.db';
            $configPath = $privatePath . '/config.php';

            $configContent = buildConfigContent($secretKey, $dbPath, $siteUrl, $mailFrom, $logPath);
            if (@file_put_contents($configPath, $configContent) === false) {
                $errors[] = 'Could not create configuration file at ' . $configPath;
            } else {
                $success[] = 'Created configuration file: ' . $configPath;
            }
        }
    }
}

$config = null;
if ($configPath && is_file($configPath)) {
    $config = require $configPath;
}

if (is_array($config) && empty($errors)) {
    $dbPath = $config['DB_PATH'];
    $dbDir = dirname($dbPath);

    if (!ensureDirectory($dbDir)) {
        $errors[] = 'Could not create database directory: ' . $dbDir;
    } else {
        try {
            $db = new SQLite3($dbPath, SQLITE3_OPEN_READWRITE | SQLITE3_OPEN_CREATE);
            $db->busyTimeout(5000);
            $db->exec('PRAGMA foreign_keys = ON');

            $runner = new MigrationRunner($db, __DIR__ . '/migrations');
            $applied = $runner->runAll();

            if (count($applied) > 0) {
                $success[] = 'Applied migrations: ' . implode(', ', $applied);
            } else {
                $success[] = 'Database schema is already up to date.';
            }

            $db->close();
        } catch (Exception $e) {
            $errors[] = 'Database migration failed: ' . $e->getMessage();
        }
    }
}

$apiHtaccess = "# Restrict direct access to internal bootstrap/config files\n"
    . "<FilesMatch \"^(bootstrap\\.php|config\\.php)$\">\n"
    . "    <IfModule mod_authz_core.c>\n"
    . "        Require all denied\n"
    . "    </IfModule>\n"
    . "    <IfModule !mod_authz_core.c>\n"
    . "        Order allow,deny\n"
    . "        Deny from all\n"
    . "    </IfModule>\n"
    . "</FilesMatch>\n";

if (@file_put_contents($publicPath . '/api/.htaccess', $apiHtaccess) !== false) {
    $success[] = 'Updated API access rules (.htaccess).';
}

if ($privatePath && strpos(str_replace('\\', '/', $privatePath), str_replace('\\', '/', $publicPath)) === 0) {
    $privateHtaccess = "Deny from all\n"
        . "<IfModule mod_authz_core.c>\n"
        . "    Require all denied\n"
        . "</IfModule>\n";

    if (@file_put_contents($privatePath . '/.htaccess', $privateHtaccess) !== false) {
        $success[] = 'Updated private directory access rules (.htaccess).';
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Installation - Family Expense Tracker</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 880px; margin: 40px auto; padding: 20px; background: #f5f5f5; }
        .card { background: #fff; padding: 28px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .item { padding: 10px 12px; border-radius: 6px; margin: 8px 0; }
        .success { background: #e8f6ec; border: 1px solid #b7e1c0; color: #1f6f36; }
        .error { background: #fdeaea; border: 1px solid #f1bcbc; color: #8b1f1f; }
        .warning { background: #fff8e1; border: 1px solid #f3d88b; color: #7a5a00; padding: 12px; border-radius: 6px; margin-top: 16px; }
        code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
        a.btn { display: inline-block; text-decoration: none; background: #3a6ad6; color: #fff; padding: 10px 16px; border-radius: 6px; margin-top: 12px; }
    </style>
</head>
<body>
<div class="card">
    <h1>Family Expense Tracker Installation</h1>

    <?php if (!empty($success)): ?>
        <h2>Success</h2>
        <?php foreach ($success as $msg): ?>
            <div class="item success"><?php echo htmlspecialchars($msg, ENT_QUOTES, 'UTF-8'); ?></div>
        <?php endforeach; ?>
    <?php endif; ?>

    <?php if (!empty($errors)): ?>
        <h2>Errors</h2>
        <?php foreach ($errors as $msg): ?>
            <div class="item error"><?php echo htmlspecialchars($msg, ENT_QUOTES, 'UTF-8'); ?></div>
        <?php endforeach; ?>
    <?php endif; ?>

    <div class="warning">
        <strong>Security checklist:</strong>
        <ol>
            <li>Delete <code>install.php</code> immediately after successful setup.</li>
            <li>Review and update mail/SMTP settings in <code><?php echo htmlspecialchars((string)$configPath, ENT_QUOTES, 'UTF-8'); ?></code>.</li>
            <li>Set <code>ALLOWED_ORIGINS</code> only if you need cross-origin access.</li>
            <li>Keep the private directory outside the public web root.</li>
        </ol>
    </div>

    <?php if (empty($errors)): ?>
        <a class="btn" href="index.html">Open application</a>
    <?php endif; ?>
</div>
</body>
</html>
