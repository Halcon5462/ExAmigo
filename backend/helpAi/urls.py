from django.urls import path
from .views import HintView, AskQuestionView, HintPricesView

urlpatterns = [
    path("hint/", HintView.as_view()),
    path("ask/", AskQuestionView.as_view()),
    path("prices/", HintPricesView.as_view()),
]