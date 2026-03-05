from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, TaskSetViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'tasksets', TaskSetViewSet)

urlpatterns = router.urls
