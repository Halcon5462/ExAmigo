from django.urls import path
from . import views

path('download/<str:filename>/', views.download_file)