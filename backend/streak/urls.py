from django.urls import path
from . import views

urlpatterns = [
    path('me/', views.UserStreakDetailView.as_view(), name='streak-me'),
]
