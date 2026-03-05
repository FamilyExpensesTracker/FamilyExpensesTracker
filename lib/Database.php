<?php
// lib/Database.php - Database connection and query management

class Database {
    private $config;
    private $db;

    public function __construct($config) {
        $this->config = $config;
        $this->connect();
    }

    private function connect() {
        if (!class_exists('SQLite3')) {
            throw new RuntimeException('SQLite3 extension is not available');
        }

        $dbPath = $this->config['DB_PATH'];
        $dbDir = dirname($dbPath);

        if (!is_dir($dbDir) && !mkdir($dbDir, 0755, true)) {
            throw new RuntimeException('Failed to create database directory: ' . $dbDir);
        }

        $this->db = new SQLite3($dbPath, SQLITE3_OPEN_READWRITE | SQLITE3_OPEN_CREATE);
        if (method_exists($this->db, 'enableExceptions')) {
            $this->db->enableExceptions(true);
        }

        $this->db->busyTimeout(5000);
        $this->db->exec('PRAGMA foreign_keys = ON');
        $this->db->exec('PRAGMA journal_mode = WAL');
        $this->db->exec('PRAGMA synchronous = NORMAL');
    }

    public function getConnection() {
        return $this->db;
    }

    public function query($sql, $params = []) {
        $stmt = $this->db->prepare($sql);
        if (!$stmt) {
            throw new RuntimeException('Failed to prepare statement: ' . $this->db->lastErrorMsg());
        }

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value, $this->getSqliteType($value));
        }

        $result = $stmt->execute();
        if ($result === false) {
            throw new RuntimeException('Failed to execute query: ' . $this->db->lastErrorMsg());
        }

        return $result;
    }

    private function getSqliteType($value) {
        if (is_int($value)) {
            return SQLITE3_INTEGER;
        }

        if (is_float($value)) {
            return SQLITE3_FLOAT;
        }

        if (is_null($value)) {
            return SQLITE3_NULL;
        }

        return SQLITE3_TEXT;
    }

    public function lastInsertRowID() {
        return $this->db->lastInsertRowID();
    }

    public function close() {
        $this->db->close();
    }
}
?>