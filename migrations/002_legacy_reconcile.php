<?php
return function ($db) {
    $tableExists = function ($table) use ($db) {
        $stmt = $db->prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = :name");
        $stmt->bindValue(':name', $table, SQLITE3_TEXT);
        $result = $stmt->execute();
        return $result && (bool)$result->fetchArray(SQLITE3_ASSOC);
    };

    $columnExists = function ($table, $column) use ($db) {
        $result = $db->query('PRAGMA table_info(' . $table . ')');
        while ($result && ($row = $result->fetchArray(SQLITE3_ASSOC))) {
            if ($row['name'] === $column) {
                return true;
            }
        }
        return false;
    };

    $ensureColumn = function ($table, $column, $definition) use ($db, $columnExists) {
        if (!$columnExists($table, $column)) {
            if (!$db->exec('ALTER TABLE ' . $table . ' ADD COLUMN ' . $column . ' ' . $definition)) {
                throw new RuntimeException('Failed to add column ' . $table . '.' . $column . ': ' . $db->lastErrorMsg());
            }
        }
    };

    if ($tableExists('users')) {
        $ensureColumn('users', 'is_active', 'INTEGER NOT NULL DEFAULT 1');
        $ensureColumn('users', 'otp_failed_attempts', 'INTEGER NOT NULL DEFAULT 0');
        $ensureColumn('users', 'otp_locked_until', 'INTEGER NOT NULL DEFAULT 0');

        $db->exec('UPDATE users SET is_active = COALESCE(is_active, 1)');
        $db->exec('UPDATE users SET otp_failed_attempts = COALESCE(otp_failed_attempts, 0)');
        $db->exec('UPDATE users SET otp_locked_until = COALESCE(otp_locked_until, 0)');
    }

    if ($tableExists('otp_codes')) {
        $hasLegacyCode = $columnExists('otp_codes', 'code');
        $ensureColumn('otp_codes', 'code_hash', 'TEXT');
        $ensureColumn('otp_codes', 'ip_address', 'TEXT');
        $ensureColumn('otp_codes', 'attempt_count', 'INTEGER NOT NULL DEFAULT 0');
        $ensureColumn('otp_codes', 'last_attempt_at', 'INTEGER NOT NULL DEFAULT 0');

        if ($hasLegacyCode) {
            $db->exec("UPDATE otp_codes SET code_hash = '' WHERE code_hash IS NULL OR code_hash = ''");
        }

        $db->exec("UPDATE otp_codes SET code_hash = '' WHERE code_hash IS NULL");
        $db->exec('UPDATE otp_codes SET attempt_count = COALESCE(attempt_count, 0)');
        $db->exec('UPDATE otp_codes SET last_attempt_at = COALESCE(last_attempt_at, 0)');
    }

    if ($tableExists('expenses')) {
        $ensureColumn('expenses', 'last_modified', 'TEXT');
        $ensureColumn('expenses', 'last_modified_ms', 'INTEGER NOT NULL DEFAULT 0');
        $ensureColumn('expenses', 'deleted', 'INTEGER NOT NULL DEFAULT 0');

        $result = $db->query('SELECT id, timestamp, last_modified, last_modified_ms FROM expenses');
        $stmt = $db->prepare('UPDATE expenses SET last_modified = :last_modified, last_modified_ms = :last_modified_ms WHERE id = :id');

        while ($result && ($row = $result->fetchArray(SQLITE3_ASSOC))) {
            $currentMs = (int)($row['last_modified_ms'] ?? 0);
            if ($currentMs > 0) {
                continue;
            }

            $source = $row['last_modified'] ?: $row['timestamp'];
            $ts = strtotime((string)$source);
            if ($ts === false) {
                $ts = time();
            }

            $ms = $ts * 1000;
            $iso = gmdate('c', $ts);

            $stmt->bindValue(':id', $row['id'], SQLITE3_TEXT);
            $stmt->bindValue(':last_modified', $iso, SQLITE3_TEXT);
            $stmt->bindValue(':last_modified_ms', $ms, SQLITE3_INTEGER);
            $stmt->execute();
        }
    }

    if (!$tableExists('revoked_tokens')) {
        $db->exec('CREATE TABLE revoked_tokens (jti TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL)');
    }

    if (!$tableExists('rate_limits')) {
        $db->exec('CREATE TABLE rate_limits (bucket_key TEXT PRIMARY KEY, attempt_count INTEGER NOT NULL, window_start INTEGER NOT NULL, updated_at INTEGER NOT NULL)');
    }

    $db->exec('CREATE INDEX IF NOT EXISTS idx_user_expenses_modified ON expenses(user_id, last_modified_ms)');
    $db->exec('CREATE INDEX IF NOT EXISTS idx_user_expenses_deleted ON expenses(user_id, deleted, last_modified_ms)');
    $db->exec('CREATE INDEX IF NOT EXISTS idx_otp_user_expiry ON otp_codes(user_id, expires_at)');
    $db->exec('CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email, is_active)');
    $db->exec('CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires ON revoked_tokens(expires_at)');
    $db->exec('CREATE INDEX IF NOT EXISTS idx_rate_limits_updated ON rate_limits(updated_at)');
};
?>