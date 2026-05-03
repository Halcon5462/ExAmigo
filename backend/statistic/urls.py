from django.urls import path

from .views import (
    SubjectStatisticsDetail,
    SubjectStatisticsList,
    TaskStatisticsListView,
    TaskSubmitView,
)


urlpatterns = [
    path("tasks/", TaskStatisticsListView.as_view(), name="task-statistics-list"),
    path("subjects/", SubjectStatisticsList.as_view(), name="subject-statistics-list"),
    path(
        "subjects/<str:subject>/",
        SubjectStatisticsDetail.as_view(),
        name="subject-statistics-detail"
    ),
    path("task-progress/<int:pk>/submit/", TaskSubmitView.as_view(), name="task-submit"),
]
