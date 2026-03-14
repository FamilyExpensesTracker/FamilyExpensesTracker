<?php
// api/sync.php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/Database.php';
require_once __DIR__ . '/../lib/TokenHelper.php';
require_once __DIR__ . '/../lib/Utils.php';

function normalizeTimestampMs($value) {
    if ($value === null || $value === '') {
        return null;
    }

    if (is_numeric($value)) {
        $num = (int)$value;
        if ($num < 1000000000000) {
            // Probably seconds.
            $num *= 1000;
        }
        return $num;
    }

    if (is_string($value)) {
        $parsed = strtotime($value);
        if ($parsed !== false) {
            return $parsed * 1000;
        }
    }

    return null;
}

function isoFromMs($ms) {
    $seconds = (int)floor($ms / 1000);
    return gmdate('c', $seconds);
}

function sanitizeExpenseId($id) {
    $id = trim((string)$id);
    if ($id === '') {
        return null;
    }

    if (strlen($id) > 128) {
        $id = substr($id, 0, 128);
    }

    if (!preg_match('/^[A-Za-z0-9_-]+$/', $id)) {
        return null;
    }

    return $id;
}

function normalizeDateList($values) {
    if (!is_array($values)) {
        return [];
    }

    $seen = [];
    $normalized = [];

    foreach ($values as $value) {
        $safeValue = trim((string)$value);
        if ($safeValue === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $safeValue)) {
            continue;
        }
        if (isset($seen[$safeValue])) {
            continue;
        }

        $seen[$safeValue] = true;
        $normalized[] = $safeValue;
    }

    sort($normalized, SORT_STRING);
    return $normalized;
}

function normalizeExpenseMetadata($expense) {
    $recurrence = strtolower(trim((string)($expense['recurrence'] ?? 'none')));
    $allowedRecurrence = ['none', 'daily', 'weekly', 'monthly', 'yearly'];
    if (!in_array($recurrence, $allowedRecurrence, true)) {
        $recurrence = 'none';
    }

    $recurrenceEnd = trim((string)($expense['recurrenceEnd'] ?? ''));
    if ($recurrenceEnd !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $recurrenceEnd)) {
        $recurrenceEnd = '';
    }
    if ($recurrence === 'none') {
        $recurrenceEnd = '';
    }

    $seriesId = sanitizeExpenseId($expense['seriesId'] ?? null);
    $generatedFromId = sanitizeExpenseId($expense['generatedFromId'] ?? null);
    $occurrenceDate = trim((string)($expense['occurrenceDate'] ?? ''));
    if ($occurrenceDate !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $occurrenceDate)) {
        $occurrenceDate = '';
    }
    if ($occurrenceDate === '') {
        $occurrenceDate = trim((string)($expense['date'] ?? ''));
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $occurrenceDate)) {
            $occurrenceDate = '';
        }
    }
    $excludedDates = normalizeDateList($expense['excludedDates'] ?? []);
    $isRecurringTemplate = !empty($expense['isRecurringTemplate']) && $recurrence !== 'none';
    $isSeriesAnchorOnly = $isRecurringTemplate && !empty($expense['isSeriesAnchorOnly']);
    $isGeneratedRecurring =
        !empty($expense['isGeneratedRecurring']) ||
        (!$isRecurringTemplate && !empty($generatedFromId));

    if ($isRecurringTemplate && !$seriesId) {
        $seriesId = sanitizeExpenseId($expense['id'] ?? null);
    }

    if ($isRecurringTemplate) {
        $generatedFromId = null;
        $isGeneratedRecurring = false;
        $occurrenceDate = '';
    } else {
        $excludedDates = [];
        $isSeriesAnchorOnly = false;
    }

    if (!$generatedFromId) {
        $isGeneratedRecurring = false;
        $occurrenceDate = '';
    }

    return [
        'recurrence' => $recurrence,
        'recurrenceEnd' => $recurrenceEnd,
        'seriesId' => $seriesId ?: '',
        'generatedFromId' => $generatedFromId ?: '',
        'occurrenceDate' => $occurrenceDate,
        'excludedDates' => $excludedDates,
        'isRecurringTemplate' => $isRecurringTemplate,
        'isSeriesAnchorOnly' => $isSeriesAnchorOnly,
        'isGeneratedRecurring' => $isGeneratedRecurring,
    ];
}

function decodeExpenseMetadata($raw) {
    $decoded = [];
    if (is_string($raw) && trim($raw) !== '') {
        $parsed = json_decode($raw, true);
        if (is_array($parsed)) {
            $decoded = $parsed;
        }
    }

    return normalizeExpenseMetadata($decoded);
}

function buildExpenseResponse($row) {
    $modifiedMs = (int)($row['last_modified_ms'] ?? 0);
    $metadata = decodeExpenseMetadata($row['metadata'] ?? null);

    return [
        'id' => $row['id'],
        'amount' => (float)$row['amount'],
        'description' => $row['description'],
        'category' => $row['category'],
        'date' => $row['date'],
        'paidBy' => $row['paid_by'],
        'timestamp' => $row['timestamp'],
        'lastModifiedMs' => $modifiedMs,
        'lastModified' => isoFromMs($modifiedMs),
        'recurrence' => $metadata['recurrence'],
        'recurrenceEnd' => $metadata['recurrenceEnd'],
        'seriesId' => $metadata['seriesId'],
        'generatedFromId' => $metadata['generatedFromId'],
        'occurrenceDate' => $metadata['isGeneratedRecurring']
            ? ($metadata['occurrenceDate'] ?: $row['date'])
            : '',
        'excludedDates' => $metadata['excludedDates'],
        'isRecurringTemplate' => $metadata['isRecurringTemplate'],
        'isSeriesAnchorOnly' => $metadata['isSeriesAnchorOnly'],
        'isGeneratedRecurring' => $metadata['isGeneratedRecurring'],
    ];
}

function sanitizeSettingsPayload($settings) {
    if (!is_array($settings)) {
        return null;
    }

    $normalized = [];

    $language = strtolower(trim((string)($settings['language'] ?? '')));
    if (in_array($language, ['en', 'fr', 'ja'], true)) {
        $normalized['language'] = $language;
    }

    $currency = strtoupper(trim((string)($settings['currency'] ?? '')));
    if (in_array($currency, ['USD', 'EUR', 'JPY'], true)) {
        $normalized['currency'] = $currency;
    }

    if (array_key_exists('customCategories', $settings) && is_array($settings['customCategories'])) {
        $seen = [];
        $customCategories = [];
        foreach ($settings['customCategories'] as $category) {
            if (!is_array($category)) {
                continue;
            }

            $name = substr(trim((string)($category['name'] ?? '')), 0, 50);
            $emoji = substr(trim((string)($category['emoji'] ?? '')), 0, 8);
            if ($name === '' || isset($seen[$name])) {
                continue;
            }

            $seen[$name] = true;
            $customCategories[] = [
                'name' => $name,
                'emoji' => $emoji !== '' ? $emoji : '+',
            ];
        }

        $normalized['customCategories'] = $customCategories;
    }

    if (array_key_exists('monthlyBudgets', $settings) && is_array($settings['monthlyBudgets'])) {
        $budgets = [];
        foreach ($settings['monthlyBudgets'] as $category => $amount) {
            $safeCategory = substr(trim((string)$category), 0, 50);
            if ($safeCategory === '' || !is_numeric($amount)) {
                continue;
            }

            $safeAmount = round((float)$amount, 2);
            if (!is_finite($safeAmount) || $safeAmount <= 0) {
                continue;
            }

            $budgets[$safeCategory] = $safeAmount;
        }

        $normalized['monthlyBudgets'] = $budgets;
    }

    $lastModifiedMs = normalizeTimestampMs($settings['lastModifiedMs'] ?? ($settings['lastModified'] ?? null));
    if ($lastModifiedMs !== null) {
        $normalized['lastModifiedMs'] = max(0, (int)$lastModifiedMs);
        if ($lastModifiedMs > 0) {
            $normalized['lastModified'] = isoFromMs($lastModifiedMs);
        }
    }

    return $normalized;
}

function hasMeaningfulSettings($settings) {
    if (!is_array($settings)) {
        return false;
    }

    return
        isset($settings['language']) ||
        isset($settings['currency']) ||
        array_key_exists('customCategories', $settings) ||
        array_key_exists('monthlyBudgets', $settings);
}

function settingsLastModifiedMs($settings) {
    if (!is_array($settings)) {
        return 0;
    }

    $lastModifiedMs = normalizeTimestampMs($settings['lastModifiedMs'] ?? ($settings['lastModified'] ?? null));
    return $lastModifiedMs !== null ? max(0, (int)$lastModifiedMs) : 0;
}

function withSettingsTimestamp($settings, $ms) {
    if (!is_array($settings)) {
        return null;
    }

    $normalizedMs = max(0, (int)$ms);
    $settings['lastModifiedMs'] = $normalizedMs;
    if ($normalizedMs > 0) {
        $settings['lastModified'] = isoFromMs($normalizedMs);
    } else {
        unset($settings['lastModified']);
    }

    return $settings;
}

function saveUserSettings($conn, $userId, $settings) {
    $stmt = $conn->prepare('UPDATE users SET settings = :settings WHERE id = :id');
    $stmt->bindValue(':settings', json_encode($settings, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), SQLITE3_TEXT);
    $stmt->bindValue(':id', (int)$userId, SQLITE3_INTEGER);
    $stmt->execute();
}

$requestId = getRequestId();

try {
    $db = new Database($config);
    $conn = $db->getConnection();
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

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!preg_match('/Bearer\s+(.+)$/i', $authHeader, $matches)) {
    sendError('Missing or invalid authorization', 401, $requestId);
}

$token = trim($matches[1]);
$userId = getUserFromToken($token, $config, $conn);
if (!$userId) {
    sendError('Invalid or expired token', 401, $requestId);
}

$stmt = $conn->prepare('SELECT is_active, settings FROM users WHERE id = :id');
$stmt->bindValue(':id', (int)$userId, SQLITE3_INTEGER);
$result = $stmt->execute();
$user = $result ? $result->fetchArray(SQLITE3_ASSOC) : false;
if (!$user || (int)$user['is_active'] !== 1) {
    sendError('Account is disabled', 403, $requestId);
}

$currentSettings = null;
if (!empty($user['settings'])) {
    $decodedSettings = json_decode($user['settings'], true);
    if (is_array($decodedSettings)) {
        $currentSettings = sanitizeSettingsPayload($decodedSettings);
    }
}

if ($method === 'POST') {
    $clientExpenses = $input['expenses'] ?? [];
    $deletedIds = $input['deletedIds'] ?? [];
    $lastSyncTimeMs = normalizeTimestampMs($input['lastSyncTimeMs'] ?? ($input['lastSyncTime'] ?? null));
    $settingsPayload = sanitizeSettingsPayload($input['settings'] ?? null);

    if (!is_array($clientExpenses)) {
        sendError('Invalid expenses format', 400, $requestId);
    }

    if (!is_array($deletedIds)) {
        sendError('Invalid deletedIds format', 400, $requestId);
    }

    if (count($clientExpenses) > 10000) {
        sendError('Too many expenses in one sync request', 413, $requestId);
    }

    $nowMs = (int)round(microtime(true) * 1000);

    $conn->exec('BEGIN IMMEDIATE TRANSACTION');
    try {
        $serverChanges = [];
        $serverDeleted = [];
        $conflicts = [];

        if ($settingsPayload !== null) {
            $serverHasSettings = hasMeaningfulSettings($currentSettings);
            $clientHasSettings = hasMeaningfulSettings($settingsPayload);
            $serverSettingsMs = settingsLastModifiedMs($currentSettings);
            $clientSettingsMs = settingsLastModifiedMs($settingsPayload);

            if (!$serverHasSettings && $clientHasSettings) {
                $currentSettings = withSettingsTimestamp(
                    $settingsPayload,
                    max($clientSettingsMs, $nowMs)
                );
                saveUserSettings($conn, $userId, $currentSettings);
            } elseif ($clientHasSettings && $clientSettingsMs > $serverSettingsMs) {
                $currentSettings = withSettingsTimestamp(
                    $settingsPayload,
                    max($clientSettingsMs, $nowMs)
                );
                saveUserSettings($conn, $userId, $currentSettings);
            } elseif ($serverHasSettings && $serverSettingsMs <= 0) {
                $currentSettings = withSettingsTimestamp($currentSettings, $nowMs);
                saveUserSettings($conn, $userId, $currentSettings);
            }
        }

        if ($lastSyncTimeMs !== null) {
            $stmt = $conn->prepare('SELECT id, amount, description, category, date, paid_by, timestamp, last_modified_ms, deleted, metadata FROM expenses WHERE user_id = :user_id AND last_modified_ms > :last_sync ORDER BY last_modified_ms ASC');
            $stmt->bindValue(':user_id', (int)$userId, SQLITE3_INTEGER);
            $stmt->bindValue(':last_sync', (int)$lastSyncTimeMs, SQLITE3_INTEGER);
        } else {
            $stmt = $conn->prepare('SELECT id, amount, description, category, date, paid_by, timestamp, last_modified_ms, deleted, metadata FROM expenses WHERE user_id = :user_id AND deleted = 0 ORDER BY last_modified_ms ASC');
            $stmt->bindValue(':user_id', (int)$userId, SQLITE3_INTEGER);
        }

        $result = $stmt->execute();
        while ($result && ($row = $result->fetchArray(SQLITE3_ASSOC))) {
            if ((int)$row['deleted'] === 1) {
                $serverDeleted[] = $row['id'];
                continue;
            }

            $serverChanges[] = buildExpenseResponse($row);
        }

        if (!empty($deletedIds)) {
            $deleteStmt = $conn->prepare('UPDATE expenses SET deleted = 1, last_modified = :last_modified, last_modified_ms = :last_modified_ms WHERE user_id = :user_id AND id = :id');
            foreach ($deletedIds as $rawId) {
                $expenseId = sanitizeExpenseId($rawId);
                if (!$expenseId) {
                    continue;
                }

                $deleteStmt->bindValue(':last_modified', isoFromMs($nowMs), SQLITE3_TEXT);
                $deleteStmt->bindValue(':last_modified_ms', $nowMs, SQLITE3_INTEGER);
                $deleteStmt->bindValue(':user_id', (int)$userId, SQLITE3_INTEGER);
                $deleteStmt->bindValue(':id', $expenseId, SQLITE3_TEXT);
                $deleteStmt->execute();
            }
        }

        foreach ($clientExpenses as $expense) {
            if (!is_array($expense)) {
                continue;
            }

            $expenseId = sanitizeExpenseId($expense['id'] ?? null);
            if (!$expenseId) {
                continue;
            }

            $amount = isset($expense['amount']) ? (float)$expense['amount'] : null;
            if ($amount === null || !is_finite($amount)) {
                continue;
            }

            $description = trim((string)($expense['description'] ?? ''));
            if ($description === '') {
                continue;
            }
            $description = substr($description, 0, 500);

            $category = substr(trim((string)($expense['category'] ?? 'Other')), 0, 50);
            $paidBy = substr(trim((string)($expense['paidBy'] ?? 'Unknown')), 0, 100);

            $date = (string)($expense['date'] ?? date('Y-m-d'));
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
                $date = date('Y-m-d');
            }

            $timestamp = (string)($expense['timestamp'] ?? gmdate('c'));
            $clientModifiedMs = normalizeTimestampMs($expense['lastModifiedMs'] ?? ($expense['lastModified'] ?? $timestamp));
            if ($clientModifiedMs === null) {
                $clientModifiedMs = $nowMs;
            }

            $metadata = normalizeExpenseMetadata($expense);
            $metadataJson = json_encode($metadata, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

            $stmt = $conn->prepare('SELECT id, amount, description, category, date, paid_by, timestamp, last_modified_ms, metadata FROM expenses WHERE id = :id AND user_id = :user_id LIMIT 1');
            $stmt->bindValue(':id', $expenseId, SQLITE3_TEXT);
            $stmt->bindValue(':user_id', (int)$userId, SQLITE3_INTEGER);
            $result = $stmt->execute();
            $existing = $result ? $result->fetchArray(SQLITE3_ASSOC) : false;

            if ($existing) {
                $serverModifiedMs = (int)$existing['last_modified_ms'];
                if ($lastSyncTimeMs !== null && $serverModifiedMs > $clientModifiedMs && $serverModifiedMs > $lastSyncTimeMs) {
                    $existing['last_modified_ms'] = $serverModifiedMs;
                    $conflicts[] = [
                        'id' => $expenseId,
                        'local' => [
                            'id' => $expenseId,
                            'amount' => $amount,
                            'description' => $description,
                            'category' => $category,
                            'date' => $date,
                            'paidBy' => $paidBy,
                            'timestamp' => $timestamp,
                            'lastModifiedMs' => $clientModifiedMs,
                            'lastModified' => isoFromMs($clientModifiedMs),
                            'recurrence' => $metadata['recurrence'],
                            'recurrenceEnd' => $metadata['recurrenceEnd'],
                            'seriesId' => $metadata['seriesId'],
                            'generatedFromId' => $metadata['generatedFromId'],
                            'occurrenceDate' => $metadata['occurrenceDate'],
                            'excludedDates' => $metadata['excludedDates'],
                            'isRecurringTemplate' => $metadata['isRecurringTemplate'],
                            'isSeriesAnchorOnly' => $metadata['isSeriesAnchorOnly'],
                            'isGeneratedRecurring' => $metadata['isGeneratedRecurring'],
                        ],
                        'server' => buildExpenseResponse($existing),
                    ];
                    continue;
                }

                $effectiveModifiedMs = max($clientModifiedMs, $nowMs);
                $stmt = $conn->prepare('UPDATE expenses SET amount = :amount, description = :description, category = :category, date = :date, paid_by = :paid_by, timestamp = :timestamp, last_modified = :last_modified, last_modified_ms = :last_modified_ms, deleted = 0, metadata = :metadata WHERE id = :id AND user_id = :user_id');
                $stmt->bindValue(':amount', $amount, SQLITE3_FLOAT);
                $stmt->bindValue(':description', $description, SQLITE3_TEXT);
                $stmt->bindValue(':category', $category, SQLITE3_TEXT);
                $stmt->bindValue(':date', $date, SQLITE3_TEXT);
                $stmt->bindValue(':paid_by', $paidBy, SQLITE3_TEXT);
                $stmt->bindValue(':timestamp', $timestamp, SQLITE3_TEXT);
                $stmt->bindValue(':last_modified', isoFromMs($effectiveModifiedMs), SQLITE3_TEXT);
                $stmt->bindValue(':last_modified_ms', $effectiveModifiedMs, SQLITE3_INTEGER);
                $stmt->bindValue(':metadata', $metadataJson, SQLITE3_TEXT);
                $stmt->bindValue(':id', $expenseId, SQLITE3_TEXT);
                $stmt->bindValue(':user_id', (int)$userId, SQLITE3_INTEGER);
                $stmt->execute();
            } else {
                $effectiveModifiedMs = max($clientModifiedMs, $nowMs);
                $stmt = $conn->prepare('INSERT INTO expenses (id, user_id, amount, description, category, date, paid_by, timestamp, last_modified, last_modified_ms, deleted, metadata) VALUES (:id, :user_id, :amount, :description, :category, :date, :paid_by, :timestamp, :last_modified, :last_modified_ms, 0, :metadata)');
                $stmt->bindValue(':id', $expenseId, SQLITE3_TEXT);
                $stmt->bindValue(':user_id', (int)$userId, SQLITE3_INTEGER);
                $stmt->bindValue(':amount', $amount, SQLITE3_FLOAT);
                $stmt->bindValue(':description', $description, SQLITE3_TEXT);
                $stmt->bindValue(':category', $category, SQLITE3_TEXT);
                $stmt->bindValue(':date', $date, SQLITE3_TEXT);
                $stmt->bindValue(':paid_by', $paidBy, SQLITE3_TEXT);
                $stmt->bindValue(':timestamp', $timestamp, SQLITE3_TEXT);
                $stmt->bindValue(':last_modified', isoFromMs($effectiveModifiedMs), SQLITE3_TEXT);
                $stmt->bindValue(':last_modified_ms', $effectiveModifiedMs, SQLITE3_INTEGER);
                $stmt->bindValue(':metadata', $metadataJson, SQLITE3_TEXT);
                $stmt->execute();
            }
        }

        $conn->exec('COMMIT');

        $syncTimeMs = (int)round(microtime(true) * 1000);
        sendResponse([
            'syncTimeMs' => $syncTimeMs,
            'syncTime' => isoFromMs($syncTimeMs),
            'serverChanges' => $serverChanges,
            'serverDeleted' => array_values(array_unique($serverDeleted)),
            'conflicts' => array_values($conflicts),
            'settings' => $currentSettings,
            'synced' => count($clientExpenses),
            'deleted' => count($deletedIds),
        ]);
    } catch (Exception $e) {
        $conn->exec('ROLLBACK');
        logError('Sync error', ['requestId' => $requestId, 'error' => $e->getMessage()], $config);
        sendError('Sync failed', 500, $requestId);
    }
}

if ($method === 'GET') {
    try {
        $stmt = $conn->prepare('SELECT COUNT(*) as count, MAX(last_modified_ms) as last_modified_ms FROM expenses WHERE user_id = :user_id AND deleted = 0');
        $stmt->bindValue(':user_id', (int)$userId, SQLITE3_INTEGER);
        $result = $stmt->execute();
        $row = $result ? $result->fetchArray(SQLITE3_ASSOC) : ['count' => 0, 'last_modified_ms' => 0];

        $lastModifiedMs = (int)($row['last_modified_ms'] ?? 0);
        sendResponse([
            'expenseCount' => (int)$row['count'],
            'lastModifiedMs' => $lastModifiedMs,
            'lastModified' => $lastModifiedMs > 0 ? isoFromMs($lastModifiedMs) : null,
        ]);
    } catch (Exception $e) {
        logError('Sync status error', ['requestId' => $requestId, 'error' => $e->getMessage()], $config);
        sendError('Failed to get sync status', 500, $requestId);
    }
}

sendError('Invalid request method', 405, $requestId);
?>
