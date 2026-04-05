from django.urls import path

from achievements.api.views import AchievementListView


urlpatterns = [
    path("", AchievementListView.as_view(), name="achievement-list"),
]
