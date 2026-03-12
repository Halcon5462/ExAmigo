from django.urls import path
from . import views

urlpatterns = [
    path("download/<path:filename>/", views.download_file)
]
