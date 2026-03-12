from django.http import FileResponse
from django.conf import settings
import os

def download_file(request, filename):
    file_path = os.path.join(settings.MEDIA_ROOT, filename)
    return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=filename)