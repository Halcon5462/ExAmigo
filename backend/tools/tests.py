import os
from tempfile import mkdtemp

from django.conf import settings
from django.test import TestCase, override_settings


@override_settings(MEDIA_ROOT=mkdtemp())
class DownloadFileTests(TestCase):
    def test_download_existing_file_returns_response(self):
        file_path = os.path.join(settings.MEDIA_ROOT, "example.txt")
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "wb") as file:
            file.write(b"hello")

        response = self.client.get("/api/tools/download/example.txt/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get("Content-Disposition"), 'attachment; filename="example.txt"')

    def test_download_missing_file_returns_404(self):
        response = self.client.get("/api/tools/download/missing.txt/")

        self.assertEqual(response.status_code, 404)
