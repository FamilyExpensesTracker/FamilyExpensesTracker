<?php
return function ($db) {
    $columnExists = function ($table, $column) use ($db) {
        $result = $db->query('PRAGMA table_info(' . $table . ')');
        while ($result && ($row = $result->fetchArray(SQLITE3_ASSOC))) {
            if ($row['name'] === $column) {
                return true;
            }
        }
        return false;
    };

    if (!$columnExists('expenses', 'metadata')) {
        if (!$db->exec('ALTER TABLE expenses ADD COLUMN metadata TEXT')) {
            throw new RuntimeException(
                'Failed to add expenses.metadata: ' . $db->lastErrorMsg()
            );
        }
    }
};
?>
