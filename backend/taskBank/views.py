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

    @action(detail=False, methods=["post"], url_path="generate-exam", permission_classes=[IsAuthenticated])
    def generate_exam(self, request):
        subject = request.data.get("subject")
        name = request.data.get("name") or "Экзамен"
        is_public = bool(request.data.get("is_public", False))

        if not subject:
            return Response({"error": "subject required"}, status=status.HTTP_400_BAD_REQUEST)

        tasks = []
        missing = []

        for number in range(1, 13):
            task = Task.objects.filter(
                subject=subject,
                order_KIM=number
            ).order_by("?").first()

            if not task:
                missing.append(number)
                continue

            tasks.append(task)

        if missing:
            return Response(
                {"error": "Не хватает задач для генерации экзамена", "missing": missing},
                status=status.HTTP_400_BAD_REQUEST
            )

        avg_diff = sum(t.difficulty for t in tasks) / len(tasks) if tasks else None

        with transaction.atomic():
            taskset = TaskSet.objects.create(
                name=name,
                subject=subject,
                is_public=is_public,
                author=request.user,
                type=TaskSetType.EXAM,
                average_difficulty=avg_diff,
            )

            for number, task in enumerate(tasks, start=1):
                TaskSetItem.objects.create(
                    task_set=taskset,
                    task=task,
                    order=number,
                )

        serializer = self.get_serializer(taskset, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class StartExamView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        taskset = TaskSet.objects.get(pk=pk)

        if taskset.type != TaskSetType.EXAM:
            return Response(
                {"error": "Этот комплект не является экзаменом"},
                status=status.HTTP_400_BAD_REQUEST
            )

        exam = ExamSession.objects.create(
            user=request.user,
            task_set=taskset,
            time_limit=3 * 60 * 60
        )

        return Response({
            "exam_id": exam.id,
            "time_limit": exam.time_limit,
            "started_at": exam.started_at,
        })


class ExamSessionDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, exam_id):
        exam = ExamSession.objects.get(
            id=exam_id,
            user=request.user
        )

        time_left = exam_time_left(exam)
        if time_left <= 0 and not exam.is_finished:
            exam = finish_exam_session(exam)

        return Response({
            "id": exam.id,
            "task_set": exam.task_set_id,
            "started_at": exam.started_at,
            "finished_at": exam.finished_at,
            "time_limit": exam.time_limit,
            "time_left": exam_time_left(exam),
            "is_finished": exam.is_finished,
            "score": exam.score,
        })


class FinishExamView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, exam_id):
        exam = ExamSession.objects.get(
            id=exam_id,
            user=request.user
        )

        exam = finish_exam_session(exam)

        return Response({
            "score": exam.score
        })
