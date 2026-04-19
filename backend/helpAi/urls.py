from django.urls import path
from .views import HintView

urlpatterns = [
    path("hint/", HintView.as_view()),
]