from django.urls import path

from .views import TaskStatisticsListView, TaskSubmitView


urlpatterns = [
    path("tasks/", TaskStatisticsListView.as_view(), name="task-statistics-list"),
    path("task-progress/<int:pk>/submit/", TaskSubmitView.as_view(), name="task-submit"),
]
