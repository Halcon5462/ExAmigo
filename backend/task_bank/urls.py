from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, TaskSetViewSet, FinishExamView, ExamSessionDetailView, StartExamView, SubjectChoicesView, TaskFilterOptionsView

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'tasksets', TaskSetViewSet)

urlpatterns = [
    path('tasksets/<int:pk>/start-exam/', StartExamView.as_view(), name='start-exam'),
    path('exams/<int:exam_id>/', ExamSessionDetailView.as_view(), name='exam-detail'),
    path('exams/<int:exam_id>/finish/', FinishExamView.as_view(), name='finish-exam'),
    path('subjects/', SubjectChoicesView.as_view()),
    path('filter-options/', TaskFilterOptionsView.as_view()),
]

urlpatterns += router.urls
