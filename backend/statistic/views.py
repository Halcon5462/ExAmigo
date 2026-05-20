from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from task_bank.models import Task

from .models import TaskStatistics
from .serializers import TaskStatisticsSerializer
from .services import validate_exam, process_task_submit, update_task_statistics


class TaskStatisticsListView(generics.ListAPIView):
    """
    Представление для получения списка статистики по заданиям.
    """
    serializer_class = TaskStatisticsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Возвращает статистику по заданиям для текущего пользователя.
        """
        return TaskStatistics.objects.filter(user=self.request.user).order_by(
            "subject", "order_KIM"
        )


class SubjectStatisticsList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        subjects = (
            TaskStatistics.objects
            .filter(user=request.user)
            .values_list("subject", flat=True)
            .distinct()
        )

        return Response(list(subjects))


class SubjectStatisticsDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, subject):
        stats = (
            TaskStatistics.objects
            .filter(user=request.user, subject=subject)
            .order_by("order_KIM")
        )
        serializer = TaskStatisticsSerializer(stats, many=True)

        return Response({
            "tasks": serializer.data
        })


class TaskSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        task = Task.objects.get(pk=pk)
        user = request.user
        user_answer = request.data.get("answer", "").strip()
        exam_id = request.data.get("exam_session")

        if not user_answer:
            return Response(
                {"error": "Answer required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        exam = validate_exam(task, user, exam_id)

        if isinstance(exam, str):
            return Response(
                {"error": exam},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = process_task_submit(task, user, user_answer, exam)

        return Response(result)
