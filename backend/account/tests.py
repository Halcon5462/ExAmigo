from tempfile import mkdtemp

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from account.models import Avatar, UserAccount
from account.serializers import RegisterSerializer, UserSerializer


class UserAccountModelTests(TestCase):
    def test_create_user_without_email_raises_error(self):
        with self.assertRaises(ValueError):
            UserAccount.objects.create_user(email="", name="NoEmail", password="secret123")

    def test_create_superuser_sets_staff_flags(self):
        user = UserAccount.objects.create_superuser(
            email="admin@example.com",
            name="Admin",
            password="secret123",
        )

        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)

    def test_get_avatar_url_returns_default_avatar_url(self):
        avatar = Avatar.objects.create(
            name="Стандартный",
            image=SimpleUploadedFile("avatar.jpg", b"default-avatar", content_type="image/jpeg"),
        )
        user = UserAccount.objects.create_user(
            email="user@example.com",
            name="User",
            password="secret123",
        )
        user.avatar_default = avatar
        user.save(update_fields=["avatar_default"])

        self.assertEqual(user.get_avatar_url(), avatar.image.url)


class AccountSerializerTests(TestCase):
    def test_register_serializer_rejects_duplicate_email(self):
        UserAccount.objects.create_user(
            email="user@example.com",
            name="User",
            password="secret123",
        )
        serializer = RegisterSerializer(
            data={
                "email": "user@example.com",
                "name": "Another",
                "password": "secret123",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)

    def test_user_serializer_returns_avatar_url(self):
        avatar = Avatar.objects.create(
            name="Готовый",
            image=SimpleUploadedFile("avatar.jpg", b"default-avatar", content_type="image/jpeg"),
        )
        user = UserAccount.objects.create_user(
            email="user@example.com",
            name="User",
            password="secret123",
        )
        user.avatar_default = avatar
        user.save(update_fields=["avatar_default"])

        data = UserSerializer(user).data

        self.assertEqual(data["avatar_url"], avatar.image.url)


@override_settings(MEDIA_ROOT=mkdtemp())
class AccountApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = UserAccount.objects.create_user(
            email="user@example.com",
            name="User",
            password="secret123",
        )
        self.avatar = Avatar.objects.create(
            name="Стандартный",
            image=SimpleUploadedFile("default.jpg", b"default-avatar", content_type="image/jpeg"),
        )

    def test_register_view_creates_user_and_returns_tokens(self):
        response = self.client.post(
            "/api/account/register/",
            {
                "email": "new@example.com",
                "name": "New User",
                "password": "secret123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertTrue(UserAccount.objects.filter(email="new@example.com").exists())

    def test_login_view_returns_user_payload(self):
        response = self.client.post(
            "/api/account/login/",
            {
                "email": "user@example.com",
                "password": "secret123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"]["email"], self.user.email)

    def test_profile_view_requires_authentication(self):
        response = self.client.get("/api/account/profile/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_view_returns_current_user(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/account/profile/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user.email)

    def test_avatar_list_returns_only_active_avatars(self):
        inactive_avatar = Avatar.objects.create(
            name="Скрытый",
            image=SimpleUploadedFile("hidden.jpg", b"hidden-avatar", content_type="image/jpeg"),
            is_active=False,
        )
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/account/avatars/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        avatar_ids = {item["id"] for item in response.data}
        self.assertIn(self.avatar.id, avatar_ids)
        self.assertNotIn(inactive_avatar.id, avatar_ids)

    def test_change_avatar_rejects_conflicting_payload(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            "/api/account/avatar/change/",
            {
                "avatar_id": self.avatar.id,
                "avatar": SimpleUploadedFile("custom.jpg", b"custom-avatar", content_type="image/jpeg"),
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_avatar_updates_default_avatar(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            "/api/account/avatar/change/",
            {"avatar_id": self.avatar.id},
            format="json",
        )

        self.user.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["type"], "default")
        self.assertEqual(self.user.avatar_default_id, self.avatar.id)

    def test_change_avatar_returns_404_for_missing_avatar(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            "/api/account/avatar/change/",
            {"avatar_id": 99999},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_change_avatar_uploads_custom_avatar(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            "/api/account/avatar/change/",
            {"avatar": SimpleUploadedFile("custom.jpg", b"custom-avatar", content_type="image/jpeg")},
            format="multipart",
        )

        self.user.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["type"], "custom")
        self.assertIsNone(self.user.avatar_default)
        self.assertTrue(self.user.avatar.name.endswith("custom.jpg"))
