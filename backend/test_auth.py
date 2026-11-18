import os
import tempfile
import unittest
from io import BytesIO
from pathlib import Path

from PIL import Image
from werkzeug.security import check_password_hash

_test_database_directory = tempfile.TemporaryDirectory()
os.environ["CYBERSECURITY_DATABASE_PATH"] = str(
    Path(_test_database_directory.name) / "accounts-test.db"
)

from . import app as auth_app


class AccountAuthenticationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        auth_app.app.config.update(TESTING=True, SECRET_KEY="test-session-secret")

    def setUp(self):
        self.client = auth_app.app.test_client()

    def test_signup_hashes_password_and_restores_session(self):
        response = self.client.post(
            "/api/auth/signup",
            json={
                "name": "Test Learner",
                "email": "Learner@Example.com",
                "password": "a-unique-test-password",
            },
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json["user"]["email"], "learner@example.com")
        self.assertNotIn("password_hash", response.json["user"])
        session_cookie = response.headers["Set-Cookie"]
        self.assertIn("HttpOnly", session_cookie)
        self.assertIn("SameSite=Lax", session_cookie)
        with auth_app.get_connection() as connection:
            row = connection.execute(
                "SELECT password_hash FROM academy_accounts WHERE email = ?",
                ("learner@example.com",),
            ).fetchone()
        self.assertNotEqual(row["password_hash"], "a-unique-test-password")
        self.assertTrue(check_password_hash(row["password_hash"], "a-unique-test-password"))
        self.assertTrue(self.client.get("/api/auth/me").json["success"])

    def test_signup_rejects_duplicate_email_and_short_password(self):
        account = {
            "name": "Test Learner",
            "email": "duplicate@example.com",
            "password": "a-unique-test-password",
        }
        self.assertEqual(self.client.post("/api/auth/signup", json=account).status_code, 201)
        self.client.post("/api/auth/logout")

        duplicate = self.client.post("/api/auth/signup", json=account)
        self.assertEqual(duplicate.status_code, 409)

        account["email"] = "short-password@example.com"
        account["password"] = "short"
        short_password = self.client.post("/api/auth/signup", json=account)
        self.assertEqual(short_password.status_code, 400)

    def test_login_requires_correct_password_and_logout_clears_session(self):
        self.client.post(
            "/api/auth/signup",
            json={
                "name": "Test Learner",
                "email": "login@example.com",
                "password": "a-unique-test-password",
            },
        )
        self.client.post("/api/auth/logout")

        wrong_password = self.client.post(
            "/api/auth/login",
            json={"email": "login@example.com", "password": "wrong-password"},
        )
        self.assertEqual(wrong_password.status_code, 401)

        correct_password = self.client.post(
            "/api/auth/login",
            json={"email": "LOGIN@example.com", "password": "a-unique-test-password"},
        )
        self.assertEqual(correct_password.status_code, 200)
        self.assertTrue(self.client.get("/api/auth/me").json["success"])

        self.assertEqual(self.client.post("/api/auth/logout").status_code, 200)
        self.assertEqual(self.client.get("/api/auth/me").status_code, 401)

    def test_profile_update_saves_name_and_normalized_picture(self):
        self.client.post(
            "/api/auth/signup",
            json={
                "name": "Test Learner",
                "email": "profile@example.com",
                "password": "a-unique-test-password",
            },
        )
        image_buffer = BytesIO()
        Image.new("RGB", (24, 16), color=(40, 120, 180)).save(image_buffer, format="PNG")

        response = self.client.put(
            "/api/auth/profile",
            data={
                "name": "Updated Learner",
                "picture": (BytesIO(image_buffer.getvalue()), "profile.png", "image/png"),
            },
            content_type="multipart/form-data",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["user"]["name"], "Updated Learner")
        self.assertTrue(response.json["user"]["pictureUrl"].startswith("/api/auth/avatar?v="))
        restored_profile = self.client.get("/api/auth/me")
        self.assertEqual(restored_profile.json["user"]["name"], "Updated Learner")
        self.assertEqual(
            restored_profile.json["user"]["pictureUrl"],
            response.json["user"]["pictureUrl"],
        )
        avatar = self.client.get("/api/auth/avatar")
        self.assertEqual(avatar.status_code, 200)
        self.assertEqual(avatar.mimetype, "image/jpeg")
        self.assertEqual(avatar.headers["X-Content-Type-Options"], "nosniff")
        with Image.open(BytesIO(avatar.data)) as saved_image:
            self.assertEqual(saved_image.size, (24, 16))

    def test_profile_update_rejects_invalid_pictures_and_requires_session(self):
        unauthorized = self.client.put(
            "/api/auth/profile",
            data={"name": "Learner"},
            content_type="multipart/form-data",
        )
        self.assertEqual(unauthorized.status_code, 401)

        self.client.post(
            "/api/auth/signup",
            json={
                "name": "Test Learner",
                "email": "invalid-picture@example.com",
                "password": "a-unique-test-password",
            },
        )
        invalid_picture = self.client.put(
            "/api/auth/profile",
            data={
                "name": "Test Learner",
                "picture": (BytesIO(b"not an image"), "profile.png", "image/png"),
            },
            content_type="multipart/form-data",
        )
        self.assertEqual(invalid_picture.status_code, 400)
        self.assertIn("valid", invalid_picture.json["message"])

        oversized_picture = self.client.put(
            "/api/auth/profile",
            data={
                "name": "Test Learner",
                "picture": (BytesIO(b"x" * (2 * 1024 * 1024 + 1)), "large.png", "image/png"),
            },
            content_type="multipart/form-data",
        )
        self.assertEqual(oversized_picture.status_code, 400)
        self.assertIn("2 MB", oversized_picture.json["message"])

    def test_profile_picture_can_be_removed(self):
        self.client.post(
            "/api/auth/signup",
            json={
                "name": "Test Learner",
                "email": "remove-picture@example.com",
                "password": "a-unique-test-password",
            },
        )
        image_buffer = BytesIO()
        Image.new("RGB", (8, 8), color=(40, 120, 180)).save(image_buffer, format="PNG")
        self.client.put(
            "/api/auth/profile",
            data={
                "name": "Test Learner",
                "picture": (BytesIO(image_buffer.getvalue()), "profile.png", "image/png"),
            },
            content_type="multipart/form-data",
        )

        removed = self.client.put(
            "/api/auth/profile",
            data={"name": "Test Learner", "remove_picture": "true"},
            content_type="multipart/form-data",
        )
        self.assertEqual(removed.status_code, 200)
        self.assertIsNone(removed.json["user"]["pictureUrl"])
        self.assertEqual(self.client.get("/api/auth/avatar").status_code, 404)


if __name__ == "__main__":
    unittest.main()
