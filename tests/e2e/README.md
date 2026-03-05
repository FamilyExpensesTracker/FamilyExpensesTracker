# API Smoke Test

This folder contains a lightweight end-to-end smoke test for the PHP API.

## What it verifies

- OTP verification login (`api/auth.php`)
- Initial sync insert (`api/sync.php`)
- Sync status retrieval (`api/sync.php`)
- Logout token revocation (`api/auth.php`)
- Revoked token rejection (`api/sync.php` returns `401`)

## Prerequisites

- `php` in `PATH`
- `php-cgi` in `PATH`
- PHP extensions: `sqlite3` and `pdo_sqlite`

## Run

From the project root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests/e2e/run-api-smoke.ps1
```

Optional: keep generated test artifacts (`.tmp_test_run/`) for debugging:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests/e2e/run-api-smoke.ps1 -KeepArtifacts
```
