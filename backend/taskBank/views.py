from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db import transaction

from .models import Task, TaskCorrectAnswer, TaskSet, TaskSetItem, ExamSession, TaskSetType
from .serializers import TaskSerializer, TaskSetSerializer
from .services import exam_time_left, finish_exam_session

class TaskViewSet(ModelViewSet):
    queryset = Task.objects.prefetch_related("correct_answers").all()
    serializer_class = TaskSerializer

    @action(detail=True, methods=["post"])
    def check(self, request, pk=None):
        task = self.get_object()
        user_answer = request.data.get("answer")

        is_correct = task.correct_answers.filter(
            answer_text=user_answer
        ).exists()

        return Response({"correct": is_correct})


class TaskSetViewSet(ModelViewSet):
    """CRUD for TaskSet (комплекты заданий)"""
    queryset = TaskSet.objects.prefetch_related('items__task').all()
    serializer_class = TaskSetSerializer
