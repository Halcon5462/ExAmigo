from django.urls import path

from .views import TaskStatisticsListView


urlpatterns = [
    path("tasks/", TaskStatisticsListView.as_view(), name="task-statistics-list"),
]

