
from flask import Flask, jsonify, request, send_file, session
from pathlib import Path
from contextlib import contextmanager
from datetime import timedelta
from io import BytesIO
import os
import re
import secrets
import sqlite3
from urllib.parse import quote

from PIL import Image, UnidentifiedImageError
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.exceptions import RequestEntityTooLarge

app = Flask(__name__)

DATABASE_PATH = Path(
    os.environ.get(
        "CYBERSECURITY_DATABASE_PATH",
        Path(__file__).resolve().parent / "sql_lab.db",
    )
)

app.config.update(
    SECRET_KEY=os.environ.get("CYBERSECURITY_SESSION_SECRET") or secrets.token_urlsafe(32),
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=os.environ.get("CYBERSECURITY_COOKIE_SECURE", "").lower() in {"1", "true", "yes"},
    PERMANENT_SESSION_LIFETIME=timedelta(days=14),
    MAX_CONTENT_LENGTH=2 * 1024 * 1024 + 64 * 1024,
)

if not os.environ.get("CYBERSECURITY_SESSION_SECRET"):
    app.logger.warning(
        "Using a temporary session secret. Set CYBERSECURITY_SESSION_SECRET to keep sessions across restarts."
    )

@contextmanager
def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row

    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def initialize_account_table():
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS academy_accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL COLLATE NOCASE UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        columns = {
            column["name"]
            for column in connection.execute("PRAGMA table_info(academy_accounts)")
        }
        if "profile_picture" not in columns:
            connection.execute("ALTER TABLE academy_accounts ADD COLUMN profile_picture BLOB")
        if "profile_picture_updated_at" not in columns:
            connection.execute(
                "ALTER TABLE academy_accounts ADD COLUMN profile_picture_updated_at TIMESTAMP"
            )


def account_response(account):
    picture_updated_at = account["profile_picture_updated_at"]
    return {
        "id": account["id"],
        "name": account["name"],
        "email": account["email"],
        "pictureUrl": (
            f"/api/auth/avatar?v={quote(picture_updated_at)}"
            if picture_updated_at and account["profile_picture"]
            else None
        ),
    }


def normalize_profile_picture(file_storage):
    image_data = file_storage.stream.read(2 * 1024 * 1024 + 1)
    if len(image_data) > 2 * 1024 * 1024:
        return None, "Choose an image smaller than 2 MB."

    try:
        with Image.open(BytesIO(image_data)) as image:
            if image.format not in {"JPEG", "PNG", "WEBP"}:
                return None, "Choose a JPG, PNG, or WebP image."
            if image.width > 4096 or image.height > 4096 or image.width * image.height > 12_000_000:
                return None, "Choose an image with dimensions no larger than 4096 × 4096."
            image.verify()

        with Image.open(BytesIO(image_data)) as image:
            image.load()
            image.thumbnail((512, 512))
            if image.mode not in {"RGB", "L"}:
                image = image.convert("RGB")
            elif image.mode == "L":
                image = image.convert("RGB")

            normalized = BytesIO()
            image.save(normalized, format="JPEG", quality=85, optimize=True)
            return normalized.getvalue(), None
    except (
        Image.DecompressionBombError,
        UnidentifiedImageError,
        OSError,
        ValueError,
        SyntaxError,
    ):
        return None, "The selected file is not a valid JPG, PNG, or WebP image."


def valid_email(email):
    return len(email) <= 254 and re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email) is not None


initialize_account_table()


@app.post("/api/auth/signup")
def signup():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"success": False, "message": "Enter your name, email, and password."}), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    if not all(isinstance(value, str) for value in (name, email, password)):
        return jsonify({"success": False, "message": "Enter your name, email, and password."}), 400

    name = name.strip()
    email = email.strip().lower()
    if not name or len(name) > 60:
        return jsonify({"success": False, "message": "Enter a name between 1 and 60 characters."}), 400
    if not valid_email(email):
        return jsonify({"success": False, "message": "Enter a valid email address."}), 400
    if len(password) < 8 or len(password) > 128:
        return jsonify({"success": False, "message": "Choose a password between 8 and 128 characters."}), 400

    try:
        with get_connection() as connection:
            cursor = connection.execute(
                """
                INSERT INTO academy_accounts (name, email, password_hash)
                VALUES (?, ?, ?)
                """,
                (name, email, generate_password_hash(password)),
            )
            account = connection.execute(
                "SELECT id, name, email, profile_picture, profile_picture_updated_at "
                "FROM academy_accounts WHERE id = ?",
                (cursor.lastrowid,),
            ).fetchone()
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "An account with this email already exists. Sign in instead."}), 409
    except sqlite3.Error:
        app.logger.exception("Could not create an academy account")
        return jsonify({"success": False, "message": "Account creation failed. Please try again."}), 500

    session.clear()
    session.permanent = True
    session["account_id"] = account["id"]
    return jsonify({"success": True, "user": account_response(account)}), 201


@app.post("/api/auth/login")
def login():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"success": False, "message": "Enter your email and password."}), 400

    email = data.get("email")
    password = data.get("password")
    if not isinstance(email, str) or not isinstance(password, str):
        return jsonify({"success": False, "message": "Enter your email and password."}), 400

    email = email.strip().lower()
    if not valid_email(email) or not password or len(password) > 128:
        return jsonify({"success": False, "message": "Invalid email or password."}), 401

    try:
        with get_connection() as connection:
            account = connection.execute(
                """
                SELECT id, name, email, password_hash, profile_picture, profile_picture_updated_at
                FROM academy_accounts
                WHERE email = ? COLLATE NOCASE
                """,
                (email,),
            ).fetchone()
    except sqlite3.Error:
        app.logger.exception("Could not look up an academy account")
        return jsonify({"success": False, "message": "Sign in failed. Please try again."}), 500

    if account is None or not check_password_hash(account["password_hash"], password):
        return jsonify({"success": False, "message": "Invalid email or password."}), 401

    session.clear()
    session.permanent = True
    session["account_id"] = account["id"]
    return jsonify({"success": True, "user": account_response(account)})


@app.get("/api/auth/me")
def current_account():
    account_id = session.get("account_id")
    if not account_id:
        return jsonify({"success": False, "message": "Not signed in."}), 401

    try:
        with get_connection() as connection:
            account = connection.execute(
                "SELECT id, name, email, profile_picture, profile_picture_updated_at "
                "FROM academy_accounts WHERE id = ?",
                (account_id,),
            ).fetchone()
    except sqlite3.Error:
        app.logger.exception("Could not load the current academy account")
        return jsonify({"success": False, "message": "Could not load the account."}), 500

    if account is None:
        session.clear()
        return jsonify({"success": False, "message": "Not signed in."}), 401

    return jsonify({"success": True, "user": account_response(account)})


@app.put("/api/auth/profile")
def update_profile():
    account_id = session.get("account_id")
    if not account_id:
        return jsonify({"success": False, "message": "Sign in to update your account."}), 401

    name = request.form.get("name")
    if not isinstance(name, str) or not name.strip() or len(name.strip()) > 60:
        return jsonify({"success": False, "message": "Enter a name between 1 and 60 characters."}), 400

    remove_picture = request.form.get("remove_picture") == "true"
    picture = request.files.get("picture")
    if picture and picture.filename and remove_picture:
        return jsonify({"success": False, "message": "Choose a new picture or remove the current one, not both."}), 400

    picture_data = None
    if picture and picture.filename:
        picture_data, error = normalize_profile_picture(picture)
        if error:
            return jsonify({"success": False, "message": error}), 400

    try:
        with get_connection() as connection:
            if remove_picture:
                connection.execute(
                    """
                    UPDATE academy_accounts
                    SET name = ?, profile_picture = NULL, profile_picture_updated_at = NULL
                    WHERE id = ?
                    """,
                    (name.strip(), account_id),
                )
            elif picture_data is not None:
                connection.execute(
                    """
                    UPDATE academy_accounts
                    SET name = ?, profile_picture = ?, profile_picture_updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                    """,
                    (name.strip(), picture_data, account_id),
                )
            else:
                connection.execute(
                    "UPDATE academy_accounts SET name = ? WHERE id = ?",
                    (name.strip(), account_id),
                )

            account = connection.execute(
                """
                SELECT id, name, email, profile_picture, profile_picture_updated_at
                FROM academy_accounts WHERE id = ?
                """,
                (account_id,),
            ).fetchone()
    except sqlite3.Error:
        app.logger.exception("Could not update the current academy account")
        return jsonify({"success": False, "message": "Account update failed. Please try again."}), 500

    if account is None:
        session.clear()
        return jsonify({"success": False, "message": "Sign in to update your account."}), 401

    return jsonify({"success": True, "user": account_response(account)})


@app.get("/api/auth/avatar")
def current_account_avatar():
    account_id = session.get("account_id")
    if not account_id:
        return jsonify({"success": False, "message": "Sign in to view your account picture."}), 401

    try:
        with get_connection() as connection:
            account = connection.execute(
                "SELECT profile_picture FROM academy_accounts WHERE id = ?",
                (account_id,),
            ).fetchone()
    except sqlite3.Error:
        app.logger.exception("Could not load the current academy account picture")
        return jsonify({"success": False, "message": "Could not load the account picture."}), 500

    if account is None:
        session.clear()
        return jsonify({"success": False, "message": "Sign in to view your account picture."}), 401
    if not account["profile_picture"]:
        return jsonify({"success": False, "message": "No account picture has been set."}), 404

    response = send_file(
        BytesIO(account["profile_picture"]),
        mimetype="image/jpeg",
        max_age=0,
        download_name="profile-picture.jpg",
    )
    response.headers["Cache-Control"] = "private, no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response


@app.post("/api/auth/logout")
def logout():
    session.clear()
    return jsonify({"success": True})


@app.errorhandler(RequestEntityTooLarge)
def request_entity_too_large(_error):
    return jsonify({"success": False, "message": "Choose an image smaller than 2 MB."}), 413


@app.get("/api/status")
def status():
    try:
        with get_connection() as connection:
            connection.execute("SELECT 1")

        return jsonify({
            "success": True,
            "message": "SQL Injection Security Lab backend is running",
            "database": "connected"
        })
    except sqlite3.Error:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500


@app.get("/api/users")
def get_users():
    try:
        with get_connection() as connection:
            rows = connection.execute(
                "SELECT id, username, role FROM users ORDER BY id"
            ).fetchall()

        return jsonify({
            "success": True,
            "users": [dict(row) for row in rows]
        })
    except sqlite3.Error:
        return jsonify({
            "success": False,
            "message": "Could not retrieve users"
        }), 500


@app.post("/api/login/vulnerable")
def vulnerable_login():
    data = request.get_json(silent=True) or {}

    username = data.get("username", "")
    password = data.get("password", "")

    if not isinstance(username, str) or not isinstance(password, str):
        return jsonify({"success": False, "message": "Invalid input"}), 400

    if not username or not password or len(username) > 80 or len(password) > 80:
        return jsonify({"success": False, "message": "Invalid input"}), 400

    # Intentionally unsafe SQL construction for local education.
    # The query is read-only and only checks the lab users table.
    query = (
        "SELECT id, username, role FROM users "
        f"WHERE username = '{username}' AND password = '{password}' "
        "LIMIT 1"
    )

    try:
        with get_connection() as connection:
            user = connection.execute(query).fetchone()

        if user:
            result = {
                "success": True,
                "message": "Login successful",
                "user": dict(user),
                "vulnerable": True
            }
            log_attempt(username, "vulnerable", True, "Login successful")
            return jsonify(result)

        log_attempt(username, "vulnerable", False, "Invalid credentials")
        return jsonify({
            "success": False,
            "message": "Invalid username or password",
            "vulnerable": True
        }), 401

    except sqlite3.Error:
        log_attempt(username, "vulnerable", False, "SQL query error")
        return jsonify({
            "success": False,
            "message": "SQL query failed",
            "vulnerable": True
        }), 400


@app.post("/api/login/secure")
def secure_login():
    data = request.get_json(silent=True) or {}

    username = data.get("username", "")
    password = data.get("password", "")

    if not isinstance(username, str) or not isinstance(password, str):
        return jsonify({"success": False, "message": "Invalid input"}), 400

    if not username or not password or len(username) > 80 or len(password) > 80:
        return jsonify({"success": False, "message": "Invalid input"}), 400

    try:
        with get_connection() as connection:
            user = connection.execute(
                """
                SELECT id, username, role
                FROM users
                WHERE username = ? AND password = ?
                LIMIT 1
                """,
                (username, password)
            ).fetchone()

        if user:
            log_attempt(username, "secure", True, "Login successful")
            return jsonify({
                "success": True,
                "message": "Login successful",
                "user": dict(user),
                "vulnerable": False
            })

        log_attempt(username, "secure", False, "Invalid credentials")
        return jsonify({
            "success": False,
            "message": "Invalid username or password",
            "vulnerable": False
        }), 401

    except sqlite3.Error:
        return jsonify({
            "success": False,
            "message": "Database operation failed",
            "vulnerable": False
        }), 500


def log_attempt(username, login_type, success, message):
    try:
        with get_connection() as connection:
            connection.execute(
                """
                INSERT INTO login_logs
                (username, login_type, success, message)
                VALUES (?, ?, ?, ?)
                """,
                (username, login_type, int(success), message)
            )
    except sqlite3.Error:
        app.logger.exception("Could not save login activity")


@app.get("/api/logs")
def get_logs():
    try:
        with get_connection() as connection:
            rows = connection.execute(
                """
                SELECT id, username, login_type, success, message, created_at
                FROM login_logs
                ORDER BY id DESC
                LIMIT 100
                """
            ).fetchall()

        return jsonify({
            "success": True,
            "logs": [dict(row) for row in rows]
        })
    except sqlite3.Error:
        return jsonify({
            "success": False,
            "message": "Could not retrieve logs"
        }), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
