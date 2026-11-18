# Cybersecurity Academy

An educational, local-only React and Flask application with cybersecurity lessons, defensive practice labs, email/password learning accounts, and a SQL injection demonstration. It also includes a database explorer, activity log, and short learning modules.

> **Safety notice:** The vulnerable login endpoint is deliberately unsafe for classroom demonstration. Run this project only on your own computer with its sample database. Do not deploy it, expose it to a network, or use it to test any other application.

## Requirements

- Node.js and npm
- Python 3

## Setup

Open PowerShell in the project folder.

Install the frontend dependencies:

```powershell
npm install
```

Install the backend dependencies:

```powershell
python -m pip install -r .\backend\requirements.txt
```

The repository includes a sample SQLite database at `backend\sql_lab.db`. If you need to create or seed it, run:

```powershell
python .\backend\database.py
```

The seed accounts are for this demo only:

| Username | Password |
|---|---|
| admin | admin123 |
| student | student123 |
| teacher | teacher123 |

These are deliberately simple sample credentials, not suitable for real accounts.

## Learning accounts

Create an account with your name, email address, a password, and a password confirmation. The Flask backend stores accounts in the `academy_accounts` SQLite table and stores only Werkzeug password hashes (never plaintext passwords). Email addresses are case-insensitive. Sign-in checks the password and creates an HTTP-only, same-site session cookie; signing out clears that session.

These are local learning-demo accounts, not production accounts. The backend is bound to `127.0.0.1`; do not expose it to the internet. A public deployment needs HTTPS, a production WSGI server, a persistent secret, and additional protections such as rate limiting, email verification, and password reset.

## Run the application

Use two PowerShell terminals, both opened in the project folder.

In the first terminal, set a session secret and start the Flask API:

```powershell
$env:CYBERSECURITY_SESSION_SECRET = (python -c "import secrets; print(secrets.token_urlsafe(48))")
python .\backend\app.py
```

Keep the same secret if restarting the backend while retaining active sign-in sessions. If you omit it, the backend generates a temporary secret and all sessions expire when the process restarts. For an HTTPS deployment only, set `CYBERSECURITY_COOKIE_SECURE=true` so browsers send the session cookie over HTTPS only.

In the second terminal, start Vite:

```powershell
npm run dev
```

Open the local address printed by Vite (by default, `http://127.0.0.1:5173`). The Vite development server proxies `/api` requests to the Flask API at `http://127.0.0.1:5000`.

To stop either server, press `Ctrl+C` in its terminal.

## Classroom demonstration

1. Open **Authentication Security Lab** or **SQL Injection Simulator**.
2. In the simulator, leave **Vulnerable SQL query** selected and use the built-in SQL injection example.
3. Run the simulation and observe that the intentionally vulnerable demo may accept it.
4. Select **Secure parameterized query**, run the same example, and observe that it is rejected as invalid credentials.
5. Explain that directly mixing input into query text lets input affect SQL logic; parameterized queries keep values separate from the query structure.
6. Visit **Database Explorer** and **Activity Logs** to show the sample accounts and recorded demo attempts. Passwords are not displayed in the explorer.

Results depend on the sample database contents. The vulnerable behavior is specific to this lab's code and SQLite query; it should not be assumed to work the same way in other applications or database systems.

## Main project areas

- `src\components\` — React dashboard, login lab, simulator, database explorer, activity logs, and learning content
- `src\services\api.js` — frontend API requests
- `backend\app.py` — Flask API and the vulnerable/parameterized login examples
- `backend\database.py` — SQLite schema and sample data initialization
- `backend\sql_lab.db` — local demonstration database
- `backend\test_auth.py` — isolated tests for account signup, password hashing, sign-in, and session handling

## Account API checks

Run the backend account tests with:

```powershell
python -m unittest backend.test_auth
```

## Checks

```powershell
npm run lint
npm run build
```
