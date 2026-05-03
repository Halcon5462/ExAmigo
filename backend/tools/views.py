import os
from django.conf import settings
from django.http import FileResponse, Http404


def download_file(request, filename):
    """
    Скачивает файл.
    """
    file_path = os.path.join(settings.MEDIA_ROOT, filename)

    if os.path.exists(file_path):
        return FileResponse(open(file_path, "rb"), as_attachment=True)

    raise Http404("File not found")
