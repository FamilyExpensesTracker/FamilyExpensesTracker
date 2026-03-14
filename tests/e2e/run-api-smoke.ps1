param(
    [switch]$KeepArtifacts
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Normalize-PathForPhp([string]$Path) {
    return $Path -replace '\\', '/'
}

function Assert-CommandAvailable([string]$Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' is not available in PATH."
    }
}

function Invoke-ApiCgi {
    param(
        [Parameter(Mandatory = $true)][string]$ScriptPath,
        [Parameter(Mandatory = $true)][ValidateSet('GET', 'POST')][string]$Method,
        [object]$Payload = $null,
        [string]$Token = ''
    )

    $scriptAbsolute = (Resolve-Path $ScriptPath).Path
    $rootAbsolute = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
    $relativePath = $scriptAbsolute.Substring($rootAbsolute.Length).TrimStart('\', '/')
    $uriPath = '/' + (Normalize-PathForPhp $relativePath)

    $bodyJson = ''
    if ($null -ne $Payload) {
        if ($Payload -is [string]) {
            $bodyJson = $Payload
        } else {
            $bodyJson = $Payload | ConvertTo-Json -Depth 12 -Compress
        }
    }

    $env:REQUEST_METHOD = $Method
    $env:SCRIPT_FILENAME = $scriptAbsolute
    $env:SCRIPT_NAME = $uriPath
    $env:REQUEST_URI = $uriPath
    $env:SERVER_PROTOCOL = 'HTTP/1.1'
    $env:GATEWAY_INTERFACE = 'CGI/1.1'
    $env:SERVER_NAME = '127.0.0.1'
    $env:SERVER_PORT = '80'
    $env:HTTP_HOST = '127.0.0.1'
    $env:REMOTE_ADDR = '127.0.0.1'
    $env:REDIRECT_STATUS = '200'

    if ([string]::IsNullOrWhiteSpace($Token)) {
        Remove-Item Env:HTTP_AUTHORIZATION -ErrorAction SilentlyContinue
    } else {
        $env:HTTP_AUTHORIZATION = "Bearer $Token"
    }

    $rawOutput = ''
    if ($bodyJson -ne '') {
        $env:CONTENT_TYPE = 'application/json'
        $env:CONTENT_LENGTH = [string]([System.Text.Encoding]::UTF8.GetByteCount($bodyJson))
        $rawOutput = ($bodyJson | & php-cgi.exe 2>&1 | Out-String)
    } else {
        Remove-Item Env:CONTENT_TYPE -ErrorAction SilentlyContinue
        Remove-Item Env:CONTENT_LENGTH -ErrorAction SilentlyContinue
        $rawOutput = (& php-cgi.exe 2>&1 | Out-String)
    }

    if ($LASTEXITCODE -ne 0) {
        throw "php-cgi failed for ${uriPath}: $rawOutput"
    }

    $separator = [regex]::Match($rawOutput, "\r?\n\r?\n")
    if (-not $separator.Success) {
        throw "Unable to parse CGI response for $uriPath. Raw output: $rawOutput"
    }

    $headers = $rawOutput.Substring(0, $separator.Index)
    $bodyText = $rawOutput.Substring($separator.Index + $separator.Length).Trim()

    $statusCode = 200
    if ($headers -match '(?im)^Status:\s*(\d{3})') {
        $statusCode = [int]$Matches[1]
    }

    $jsonBody = $null
    if ($bodyText -ne '') {
        try {
            $jsonBody = $bodyText | ConvertFrom-Json
        } catch {
            throw "Response body is not valid JSON for ${uriPath}: $bodyText"
        }
    }

    return [pscustomobject]@{
        StatusCode = $statusCode
        Headers = $headers
        RawBody = $bodyText
        Json = $jsonBody
    }
}

Assert-CommandAvailable 'php'
Assert-CommandAvailable 'php-cgi'

$sqliteReady = (& php -r "echo (extension_loaded('sqlite3') && extension_loaded('pdo_sqlite')) ? '1' : '0';").Trim()
if ($sqliteReady -ne '1') {
    throw 'PHP SQLite extensions are missing. Enable both sqlite3 and pdo_sqlite before running this test.'
}

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$tmpRoot = Join-Path $projectRoot '.tmp_test_run'
if (Test-Path $tmpRoot) {
    Remove-Item -Recurse -Force $tmpRoot
}
New-Item -ItemType Directory -Path $tmpRoot | Out-Null

$dbPath = Normalize-PathForPhp (Join-Path $tmpRoot 'expenses.db')
$configPath = Join-Path $tmpRoot 'config.php'
$logPath = Normalize-PathForPhp (Join-Path $tmpRoot 'logs')
$projectRootPhp = Normalize-PathForPhp $projectRoot

$configTemplate = @'
<?php
return [
    'APP_ENV' => 'test',
    'SECRET_KEY' => 'test-secret-key-for-e2e',
    'DB_PATH' => '__DB_PATH__',
    'MAIL_FROM' => 'noreply@example.test',
    'MAIL_FROM_NAME' => 'Family Expense Tracker',
    'OTP_EXPIRY_MINUTES' => 10,
    'OTP_MAX_ATTEMPTS' => 5,
    'OTP_LOCKOUT_MINUTES' => 15,
    'TOKEN_EXPIRY_DAYS' => 7,
    'SITE_URL' => 'http://127.0.0.1',
    'ALLOWED_ORIGINS' => [],
    'TRUSTED_PROXIES' => [],
    'LOG_PATH' => '__LOG_PATH__',
    'USE_SMTP' => false,
    'SMTP_HOST' => '',
    'SMTP_PORT' => 587,
    'SMTP_USER' => '',
    'SMTP_PASS' => '',
    'SMTP_SECURE' => 'tls',
];
'@
$configBody = $configTemplate.Replace('__DB_PATH__', $dbPath).Replace('__LOG_PATH__', $logPath)
Set-Content -Path $configPath -Value $configBody -Encoding ASCII -NoNewline

$seedScriptPath = Join-Path $tmpRoot 'seed.php'
$seedTemplate = @'
<?php
require '__PROJECT_ROOT__/lib/MigrationRunner.php';

$db = new SQLite3('__DB_PATH__');
$runner = new MigrationRunner($db, '__PROJECT_ROOT__/migrations');
$applied = $runner->runAll();
echo 'MIGRATIONS=' . count($applied) . "\n";

$email = 'test@example.com';
$now = time();

$stmt = $db->prepare('INSERT INTO users (email, created_at, is_active, otp_failed_attempts, otp_locked_until) VALUES (:email, :created_at, 1, 0, 0)');
$stmt->bindValue(':email', $email, SQLITE3_TEXT);
$stmt->bindValue(':created_at', $now, SQLITE3_INTEGER);
$stmt->execute();
$userId = $db->lastInsertRowID();

$otp = '123456';
$otpHash = hash_hmac('sha256', $otp, 'test-secret-key-for-e2e');
$stmt = $db->prepare('INSERT INTO otp_codes (user_id, code_hash, expires_at, used, created_at, ip_address, attempt_count, last_attempt_at) VALUES (:user_id, :code_hash, :expires_at, 0, :created_at, :ip, 0, 0)');
$stmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
$stmt->bindValue(':code_hash', $otpHash, SQLITE3_TEXT);
$stmt->bindValue(':expires_at', $now + 600, SQLITE3_INTEGER);
$stmt->bindValue(':created_at', $now, SQLITE3_INTEGER);
$stmt->bindValue(':ip', '127.0.0.1', SQLITE3_TEXT);
$stmt->execute();

echo 'SEEDED_USER=' . $userId . "\n";
'@
$seedBody = $seedTemplate.Replace('__PROJECT_ROOT__', $projectRootPhp).Replace('__DB_PATH__', $dbPath)
Set-Content -Path $seedScriptPath -Value $seedBody -Encoding ASCII -NoNewline

$seedOutput = (& php $seedScriptPath 2>&1 | Out-String).Trim()
if ($LASTEXITCODE -ne 0) {
    throw "Database seed failed: $seedOutput"
}
Write-Output $seedOutput

$env:FAMILY_EXPENSES_CONFIG_PATH = $configPath
$allPassed = $false

try {
    $verifyResponse = Invoke-ApiCgi -ScriptPath (Join-Path $projectRoot 'api/auth.php') -Method 'POST' -Payload @{ action = 'verify_otp'; email = 'test@example.com'; otp = '123456' }
    if ($verifyResponse.StatusCode -ne 200 -or -not $verifyResponse.Json.success -or [string]::IsNullOrWhiteSpace($verifyResponse.Json.data.token)) {
        throw "verify_otp failed: status=$($verifyResponse.StatusCode), body=$($verifyResponse.RawBody)"
    }
    $token = [string]$verifyResponse.Json.data.token
    Write-Output 'PASS verify_otp'

    $clientNowMs = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    $initialSettingsMs = $clientNowMs + 1000
    $today = Get-Date -Format 'yyyy-MM-dd'
    $syncResponse = Invoke-ApiCgi -ScriptPath (Join-Path $projectRoot 'api/sync.php') -Method 'POST' -Token $token -Payload @{
        expenses = @(@{
            id = 'expense-1'
            amount = 12.5
            description = 'Milk'
            category = 'Food'
            date = $today
            paidBy = 'Alice'
            timestamp = [DateTime]::UtcNow.ToString('o')
            lastModifiedMs = $clientNowMs
            seriesId = 'series-1'
            generatedFromId = 'template-1'
            isGeneratedRecurring = $true
        })
        lastSyncTimeMs = $null
        deletedIds = @()
        settings = @{
            language = 'ja'
            currency = 'JPY'
            customCategories = @()
            monthlyBudgets = @{}
            lastModifiedMs = $initialSettingsMs
        }
    }
    if (
        $syncResponse.StatusCode -ne 200 -or
        -not $syncResponse.Json.success -or
        -not $syncResponse.Json.data.syncTimeMs -or
        $syncResponse.Json.data.settings.language -ne 'ja' -or
        $syncResponse.Json.data.settings.currency -ne 'JPY'
    ) {
        throw "sync insert failed: status=$($syncResponse.StatusCode), body=$($syncResponse.RawBody)"
    }
    $lastSyncMs = [int64]$syncResponse.Json.data.syncTimeMs
    Write-Output 'PASS sync_insert'

    $staleSettingsResponse = Invoke-ApiCgi -ScriptPath (Join-Path $projectRoot 'api/sync.php') -Method 'POST' -Token $token -Payload @{
        expenses = @()
        lastSyncTimeMs = $lastSyncMs
        deletedIds = @()
        settings = @{
            language = 'en'
            currency = 'USD'
            customCategories = @()
            monthlyBudgets = @{}
            lastModifiedMs = ($initialSettingsMs - 500)
        }
    }
    if (
        $staleSettingsResponse.StatusCode -ne 200 -or
        -not $staleSettingsResponse.Json.success -or
        $staleSettingsResponse.Json.data.settings.language -ne 'ja' -or
        $staleSettingsResponse.Json.data.settings.currency -ne 'JPY'
    ) {
        throw "stale settings should not overwrite server settings: status=$($staleSettingsResponse.StatusCode), body=$($staleSettingsResponse.RawBody)"
    }
    Write-Output 'PASS stale_settings_rejected'

    $freshSettingsResponse = Invoke-ApiCgi -ScriptPath (Join-Path $projectRoot 'api/sync.php') -Method 'POST' -Token $token -Payload @{
        expenses = @()
        lastSyncTimeMs = $lastSyncMs
        deletedIds = @()
        settings = @{
            language = 'fr'
            currency = 'EUR'
            customCategories = @()
            monthlyBudgets = @{ Food = 200 }
            lastModifiedMs = ($initialSettingsMs + 500)
        }
    }
    if (
        $freshSettingsResponse.StatusCode -ne 200 -or
        -not $freshSettingsResponse.Json.success -or
        $freshSettingsResponse.Json.data.settings.language -ne 'fr' -or
        $freshSettingsResponse.Json.data.settings.currency -ne 'EUR'
    ) {
        throw "fresh settings should update server settings: status=$($freshSettingsResponse.StatusCode), body=$($freshSettingsResponse.RawBody)"
    }
    Write-Output 'PASS fresh_settings_applied'

    $metadataResponse = Invoke-ApiCgi -ScriptPath (Join-Path $projectRoot 'api/sync.php') -Method 'POST' -Token $token -Payload @{
        expenses = @()
        lastSyncTimeMs = 0
        deletedIds = @()
        settings = @{
            language = 'fr'
            currency = 'EUR'
            customCategories = @()
            monthlyBudgets = @{ Food = 200 }
            lastModifiedMs = ($initialSettingsMs + 500)
        }
    }
    $syncedExpense = $metadataResponse.Json.data.serverChanges | Where-Object { $_.id -eq 'expense-1' } | Select-Object -First 1
    if (
        $metadataResponse.StatusCode -ne 200 -or
        -not $metadataResponse.Json.success -or
        -not $syncedExpense -or
        -not $syncedExpense.isGeneratedRecurring -or
        $syncedExpense.generatedFromId -ne 'template-1'
    ) {
        throw "generated recurring metadata was not preserved: status=$($metadataResponse.StatusCode), body=$($metadataResponse.RawBody)"
    }
    Write-Output 'PASS generated_recurring_roundtrip'

    $statusResponse = Invoke-ApiCgi -ScriptPath (Join-Path $projectRoot 'api/sync.php') -Method 'GET' -Token $token
    if ($statusResponse.StatusCode -ne 200 -or -not $statusResponse.Json.success -or [int]$statusResponse.Json.data.expenseCount -lt 1) {
        throw "sync status failed: status=$($statusResponse.StatusCode), body=$($statusResponse.RawBody)"
    }
    Write-Output 'PASS sync_status'

    $logoutResponse = Invoke-ApiCgi -ScriptPath (Join-Path $projectRoot 'api/auth.php') -Method 'POST' -Token $token -Payload @{ action = 'logout' }
    if ($logoutResponse.StatusCode -ne 200 -or -not $logoutResponse.Json.success) {
        throw "logout failed: status=$($logoutResponse.StatusCode), body=$($logoutResponse.RawBody)"
    }
    Write-Output 'PASS logout'

    $blockedResponse = Invoke-ApiCgi -ScriptPath (Join-Path $projectRoot 'api/sync.php') -Method 'POST' -Token $token -Payload @{
        expenses = @()
        lastSyncTimeMs = $lastSyncMs
        deletedIds = @()
    }
    if ($blockedResponse.StatusCode -ne 401) {
        throw "revoked token should be rejected with 401: status=$($blockedResponse.StatusCode), body=$($blockedResponse.RawBody)"
    }
    Write-Output 'PASS revoked_token_blocked'

    $allPassed = $true
    Write-Output 'E2E_RESULT=PASS'
    exit 0
} catch {
    Write-Output ('FAIL ' + $_.Exception.Message)
    Write-Output 'E2E_RESULT=FAIL'
    exit 1
} finally {
    Remove-Item Env:FAMILY_EXPENSES_CONFIG_PATH -ErrorAction SilentlyContinue
    if ($allPassed -and -not $KeepArtifacts) {
        Remove-Item -Recurse -Force $tmpRoot -ErrorAction SilentlyContinue
    }
}
