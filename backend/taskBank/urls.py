from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, TaskSetViewSet, FinishExamView, ExamSessionDetailView

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'tasksets', TaskSetViewSet)

urlpatterns = [
    path('exams/<int:exam_id>/', ExamSessionDetailView.as_view(), name='exam-detail'),
    path('exams/<int:exam_id>/finish/', FinishExamView.as_view(), name='finish-exam'),
]

urlpatterns += router.urls
