<?php
// lib/MigrationRunner.php - Schema migration runner

class MigrationRunner {
    private $db;
    private $migrationsPath;

    public function __construct($db, $migrationsPath) {
        $this->db = $db;
        $this->migrationsPath = rtrim($migrationsPath, '/\\');
    }

    public function runAll() {
        $this->ensureMigrationsTable();
        $applied = $this->getAppliedMigrations();
        $files = $this->getMigrationFiles();
        $appliedNow = [];

        foreach ($files as $file) {
            $name = basename($file);
            if (isset($applied[$name])) {
                continue;
            }

            $this->runSingleMigration($file);
            $this->markApplied($name);
            $appliedNow[] = $name;
        }

        return $appliedNow;
    }

    private function ensureMigrationsTable() {
        $sql = "
            CREATE TABLE IF NOT EXISTS schema_migrations (
                migration_name TEXT PRIMARY KEY,
                applied_at INTEGER NOT NULL
            )
        ";
        if (!$this->db->exec($sql)) {
            throw new RuntimeException('Failed to initialize schema_migrations table: ' . $this->db->lastErrorMsg());
        }
    }

    private function getAppliedMigrations() {
        $applied = [];
        $result = $this->db->query('SELECT migration_name FROM schema_migrations');
        while ($result && ($row = $result->fetchArray(SQLITE3_ASSOC))) {
            $applied[$row['migration_name']] = true;
        }

        return $applied;
    }

    private function getMigrationFiles() {
        if (!is_dir($this->migrationsPath)) {
            return [];
        }

        $files = glob($this->migrationsPath . '/*');
        $files = array_filter($files, function ($file) {
            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            return in_array($ext, ['sql', 'php'], true);
        });

        sort($files, SORT_STRING);
        return $files;
    }

    private function runSingleMigration($file) {
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        $this->db->exec('BEGIN IMMEDIATE TRANSACTION');

        try {
            if ($ext === 'sql') {
                $sql = file_get_contents($file);
                if ($sql === false) {
                    throw new RuntimeException('Failed to read migration file: ' . $file);
                }

                if (!$this->db->exec($sql)) {
                    throw new RuntimeException('Migration failed (' . basename($file) . '): ' . $this->db->lastErrorMsg());
                }
            } elseif ($ext === 'php') {
                $migration = require $file;
                if (!is_callable($migration)) {
                    throw new RuntimeException('PHP migration must return a callable: ' . basename($file));
                }

                call_user_func($migration, $this->db);
            } else {
                throw new RuntimeException('Unsupported migration type: ' . $file);
            }

            $this->db->exec('COMMIT');
        } catch (Exception $e) {
            $this->db->exec('ROLLBACK');
            throw $e;
        }
    }

    private function markApplied($name) {
        $stmt = $this->db->prepare('INSERT INTO schema_migrations (migration_name, applied_at) VALUES (:name, :applied_at)');
        $stmt->bindValue(':name', $name, SQLITE3_TEXT);
        $stmt->bindValue(':applied_at', time(), SQLITE3_INTEGER);

        if (!$stmt->execute()) {
            throw new RuntimeException('Failed to record migration ' . $name . ': ' . $this->db->lastErrorMsg());
        }
    }
}
?>