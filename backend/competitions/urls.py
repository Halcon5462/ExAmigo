from django.urls import path
from .views import CreateMatchView

urlpatterns = [
    path("create/", CreateMatchView.as_view()),
]
