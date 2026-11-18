
import sqlite3
from pathlib import Path
from contextlib import contextmanager

# Database location
BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "sql_lab.db"


@contextmanager
def get_db_connection():
    """Create and safely close a database connection."""
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


def initialize_database():
    """Create database tables and sample accounts."""

    with get_db_connection() as connection:

        # Users table
        connection.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'student'
            )
        """)

        # Login activity table
        connection.execute("""
            CREATE TABLE IF NOT EXISTS login_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                login_type TEXT NOT NULL,
                success INTEGER NOT NULL,
                message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Lab settings table
        connection.execute("""
            CREATE TABLE IF NOT EXISTS lab_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                setting_name TEXT NOT NULL UNIQUE,
                setting_value TEXT NOT NULL
            )
        """)

        # Insert sample accounts only when users table is empty
        user_count = connection.execute(
            "SELECT COUNT(*) FROM users"
        ).fetchone()[0]

        if user_count == 0:
            sample_users = [
                ("admin", "admin123", "admin"),
                ("student", "student123", "student"),
                ("teacher", "teacher123", "teacher"),
            ]

            connection.executemany(
                """
                INSERT INTO users (username, password, role)
                VALUES (?, ?, ?)
                """,
                sample_users
            )

        # Default settings
        connection.execute("""
            INSERT OR IGNORE INTO lab_settings
            (setting_name, setting_value)
            VALUES ('lab_name', 'SQL Injection Security Lab')
        """)

    print(f"Database initialized: {DATABASE_PATH}")


if __name__ == "__main__":
    initialize_database()
