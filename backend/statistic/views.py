from django.db import transaction
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from achievements.services.achievement_service import AchievementService
from shop.services import WalletService
from taskBank.models import ExamSession, Task
from taskBank.services import exam_time_left, finish_exam_session

from .models import TaskAttempt, TaskProgress, TaskStatistics
from .serializers import TaskStatisticsSerializer
from .services import update_task_statistics

from streak.services import update_user_streak


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

        return Response({
            "tasks": list(stats.values())
        })


class TaskSubmitView(APIView):
    """
    Представление для отправки ответа на задание.
    """
    permission_classes = [IsAuthenticated]

    DIFFICULTY_MAP = {
        1: "easy",
        2: "easy",
        3: "medium",
        4: "hard",
        5: "expert",
    }

    def post(self, request, pk):
        """
        Обрабатывает POST-запрос для отправки ответа на задание.
        """
        task = Task.objects.get(pk=pk)
        user = request.user
        user_answer = request.data.get("answer", "").strip()
        exam_id = request.data.get("exam_session")
        exam = None

        if not user_answer:
            return Response(
                {"error": "Answer required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if exam_id:
            try:
                exam = ExamSession.objects.select_related("task_set").get(id=exam_id, user=user)
            except ExamSession.DoesNotExist:
                return Response(
                    {"error": "Exam session not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if exam.is_finished:
                return Response(
                    {"error": "Exam session finished"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if exam_time_left(exam) <= 0:
                finish_exam_session(exam)
                return Response(
                    {"error": "Exam time is over"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if not exam.task_set.items.filter(task_id=task.id).exists():
                return Response(
                    {"error": "Task is not in this exam"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            exists = TaskAttempt.objects.filter(exam_session_id=exam_id, task=task).exists()
            if exists:
                return Response(
                    {"error": "Only one attempt allowed in exam"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        cleaned_user_answer = "".join(user_answer.split()).lower()
        is_correct = any(
            "".join(answer.answer_text.split()).lower() == cleaned_user_answer
            for answer in task.correct_answers.all()
        )
        reward = 0
        first_time = False
        transaction_data = None

        with transaction.atomic():
            TaskAttempt.objects.create(
                user=user,
                task=task,
                exam_session=exam,
                answer=user_answer,
                is_correct=is_correct,
            )

            if is_correct:
                try:
                    update_user_streak(user)
                    print(f"🔥 Серия обновлена для пользователя {user.email}")
                except Exception as e:
                    print(f"❌ Ошибка при обновлении серии: {e}")
                _, created = TaskProgress.objects.get_or_create(user=user, task=task)
                if created:
                    first_time = True
                    difficulty_str = self.DIFFICULTY_MAP.get(task.difficulty, "easy")
                    transaction_data = WalletService.add_task_reward(
                        user=user,
                        task_difficulty=difficulty_str,
                        task_title=(
                            f"{task.subject}, номер-{task.order_KIM}, "
                            f"сложность: {task.difficulty}"
                        ),
                    )
                    reward = transaction_data["amount"]

                AchievementService.handle_event(
                    user=user,
                    event="solve_tasks",
                    context={"difficulty": task.difficulty, "first_time": first_time},
                )

                if first_time:
                    AchievementService.handle_event(
                        user=user,
                        event="first_try",
                        context={"first_time": True},
                    )

                AchievementService.handle_event(
                    user=user,
                    event="difficulty_master",
                    context={"difficulty": task.difficulty},
                )

            update_task_statistics(
                user=user,
                task=task,
                is_correct=is_correct,
                first_time=first_time,
            )

        response_data = {"correct": is_correct, "first_time": first_time, "reward": reward}
        if transaction_data:
            response_data["new_balance"] = transaction_data["new_balance"]

        return Response(response_data)
