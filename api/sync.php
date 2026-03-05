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

$requestId = getRequestId();

try {
    $db = new Database($config);
    $conn = $db->getConnection();
} catch (Exception $e) {
    logError('Database connection failed', ['requestId' => $requestId, 'error' => $e->getMessage()], $config);
    sendError('Database connection failed', 500, $requestId);
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

$stmt = $conn->prepare('SELECT is_active FROM users WHERE id = :id');
$stmt->bindValue(':id', (int)$userId, SQLITE3_INTEGER);
$result = $stmt->execute();
$user = $result ? $result->fetchArray(SQLITE3_ASSOC) : false;
if (!$user || (int)$user['is_active'] !== 1) {
    sendError('Account is disabled', 403, $requestId);
}

if ($method === 'POST') {
    $clientExpenses = $input['expenses'] ?? [];
    $deletedIds = $input['deletedIds'] ?? [];
    $lastSyncTimeMs = normalizeTimestampMs($input['lastSyncTimeMs'] ?? ($input['lastSyncTime'] ?? null));

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

        if ($lastSyncTimeMs !== null) {
            $stmt = $conn->prepare('SELECT id, amount, description, category, date, paid_by, timestamp, last_modified_ms, deleted FROM expenses WHERE user_id = :user_id AND last_modified_ms > :last_sync ORDER BY last_modified_ms ASC');
            $stmt->bindValue(':user_id', (int)$userId, SQLITE3_INTEGER);
            $stmt->bindValue(':last_sync', (int)$lastSyncTimeMs, SQLITE3_INTEGER);
        } else {
            $stmt = $conn->prepare('SELECT id, amount, description, category, date, paid_by, timestamp, last_modified_ms, deleted FROM expenses WHERE user_id = :user_id AND deleted = 0 ORDER BY last_modified_ms ASC');
            $stmt->bindValue(':user_id', (int)$userId, SQLITE3_INTEGER);
        }

        $result = $stmt->execute();
        while ($result && ($row = $result->fetchArray(SQLITE3_ASSOC))) {
            $modifiedMs = (int)$row['last_modified_ms'];
            if ((int)$row['deleted'] === 1) {
                $serverDeleted[] = $row['id'];
                continue;
            }

            $serverChanges[] = [
                'id' => $row['id'],
                'amount' => (float)$row['amount'],
                'description' => $row['description'],
                'category' => $row['category'],
                'date' => $row['date'],
                'paidBy' => $row['paid_by'],
                'timestamp' => $row['timestamp'],
                'lastModifiedMs' => $modifiedMs,
                'lastModified' => isoFromMs($modifiedMs),
            ];
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

            $stmt = $conn->prepare('SELECT last_modified_ms FROM expenses WHERE id = :id AND user_id = :user_id LIMIT 1');
            $stmt->bindValue(':id', $expenseId, SQLITE3_TEXT);
            $stmt->bindValue(':user_id', (int)$userId, SQLITE3_INTEGER);
            $result = $stmt->execute();
            $existing = $result ? $result->fetchArray(SQLITE3_ASSOC) : false;

            if ($existing) {
                $serverModifiedMs = (int)$existing['last_modified_ms'];
                if ($lastSyncTimeMs !== null && $serverModifiedMs > $clientModifiedMs && $serverModifiedMs > $lastSyncTimeMs) {
                    $conflicts[] = $expenseId;
                    continue;
                }

                $effectiveModifiedMs = max($clientModifiedMs, $nowMs);
                $stmt = $conn->prepare('UPDATE expenses SET amount = :amount, description = :description, category = :category, date = :date, paid_by = :paid_by, timestamp = :timestamp, last_modified = :last_modified, last_modified_ms = :last_modified_ms, deleted = 0 WHERE id = :id AND user_id = :user_id');
                $stmt->bindValue(':amount', $amount, SQLITE3_FLOAT);
                $stmt->bindValue(':description', $description, SQLITE3_TEXT);
                $stmt->bindValue(':category', $category, SQLITE3_TEXT);
                $stmt->bindValue(':date', $date, SQLITE3_TEXT);
                $stmt->bindValue(':paid_by', $paidBy, SQLITE3_TEXT);
                $stmt->bindValue(':timestamp', $timestamp, SQLITE3_TEXT);
                $stmt->bindValue(':last_modified', isoFromMs($effectiveModifiedMs), SQLITE3_TEXT);
                $stmt->bindValue(':last_modified_ms', $effectiveModifiedMs, SQLITE3_INTEGER);
                $stmt->bindValue(':id', $expenseId, SQLITE3_TEXT);
                $stmt->bindValue(':user_id', (int)$userId, SQLITE3_INTEGER);
                $stmt->execute();
            } else {
                $effectiveModifiedMs = max($clientModifiedMs, $nowMs);
                $stmt = $conn->prepare('INSERT INTO expenses (id, user_id, amount, description, category, date, paid_by, timestamp, last_modified, last_modified_ms, deleted) VALUES (:id, :user_id, :amount, :description, :category, :date, :paid_by, :timestamp, :last_modified, :last_modified_ms, 0)');
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
            'conflicts' => array_values(array_unique($conflicts)),
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