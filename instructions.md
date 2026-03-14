## Deployment Instructions (Root or Subdirectory)

1. Upload files via FTP/cPanel.

Example subdirectory deployment:
```
/public_html/expense-tracker/
  index.html
  main.js
  styles.css
  modules/
  install.php (temporary)
  api/
    auth.php
    sync.php
```

Example root deployment:
```
/public_html/
  index.html
  main.js
  styles.css
  modules/
  install.php (temporary)
  api/
    auth.php
    sync.php
```

2. Run installer once:
- Open `https://yourdomain.com/<path>/install.php`
- Confirm migration step completes
- Delete `install.php` immediately after success

3. Configure `private/config.php`:
- Set `SITE_URL`
- Configure SMTP values if email delivery is required
- Keep `ALLOWED_ORIGINS` empty for same-origin; add explicit origins only when needed

4. Verify API path from the app:
- `index.html` includes `<meta name="expense-api-base" content="./api">`
- This works for both root and subdirectory deployment

5. Troubleshooting:
- Check PHP error logs in cPanel
- Ensure SQLite3 extension is enabled
- Ensure private directories are writable and not publicly accessible

## API Smoke Test (Local)

Prerequisites:
- `php` and `php-cgi` available in `PATH`
- PHP extensions `sqlite3` and `pdo_sqlite` enabled

Run from project root:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests/e2e/run-api-smoke.ps1
```
