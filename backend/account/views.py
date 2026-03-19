from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import UserSerializer, RegisterSerializer, UserAchievementSerializer, UserAchievementProgressSerializer
from .models import UserAccount, UserAchievement, UserAchievementProgress

from rest_framework.views import APIView
from django.db import transaction

from .models import Task
from statistic.models import TaskAttempt, TaskProgress

from shop.services import WalletService
from statistic.services import update_task_statistics
from statistic.services import update_task_statistics

from taskBank.models import ExamSession
from taskBank.services import exam_time_left, finish_exam_session
from statistic.models import TaskAttempt, TaskProgress


class RegisterView(generics.GenericAPIView):
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = UserAccount.objects.get(email=request.data['email'])
            response.data['user'] = UserSerializer(user).data
        return response

class UserAchievementListView(generics.ListAPIView):
    serializer_class = UserAchievementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserAchievement.objects.filter(user=self.request.user)

class UserProgressListView(generics.ListAPIView):
    serializer_class = UserAchievementProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserAchievementProgress.objects.filter(user=self.request.user)


class TaskSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    DIFFICULTY_MAP = {
        1: 'easy',
        2: 'easy',
        3: 'medium',
        4: 'hard',
        5: 'expert',
    }

    def post(self, request, pk):
        task = Task.objects.get(pk=pk)
        user = request.user
        user_answer = request.data.get("answer", "").strip()
        exam_id = request.data.get("exam_session")
        exam = None

        if not user_answer:
            return Response({"error": "Answer required"}, status=400)

        if exam_id:
            try:
                exam = ExamSession.objects.select_related("task_set").get(
                    id=exam_id,
                    user=user
                )
            except ExamSession.DoesNotExist:
                return Response({"error": "Exam session not found"}, status=404)

            if exam.is_finished:
                return Response({"error": "Exam session finished"}, status=400)

            if exam_time_left(exam) <= 0:
                finish_exam_session(exam)
                return Response({"error": "Exam time is over"}, status=400)

            in_exam = exam.task_set.items.filter(task_id=task.id).exists()
            if not in_exam:
                return Response({"error": "Task is not in this exam"}, status=400)

            exists = TaskAttempt.objects.filter(
                exam_session_id=exam_id,
                task=task
            ).exists()

            if exists:
                return Response(
                    {"error": "Only one attempt allowed in exam"},
                    status=400
                )

        cleaned_user_answer = "".join(user_answer.split()).lower()

        is_correct = any(
            "".join(a.answer_text.split()).lower() == cleaned_user_answer
            for a in task.correct_answers.all()
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
                is_correct=is_correct
            )
            if is_correct:
                progress, created = TaskProgress.objects.get_or_create(
                    user=user, task=task
                )
                progress, created = TaskProgress.objects.get_or_create(
                    user=user, task=task
                )
                if created:
                    first_time = True
                    difficulty_str = self.DIFFICULTY_MAP.get(task.difficulty, "easy")
                    difficulty_str = self.DIFFICULTY_MAP.get(task.difficulty, "easy")
                    try:
                        transaction_data = WalletService.add_task_reward(
                            user=user,
                            task_difficulty=difficulty_str,
                            task_title=f"{task.subject}, №{task.order_KIM}, сложность: {task.difficulty}",
                        )
                        reward = transaction_data["amount"]
                        reward = transaction_data["amount"]
                    except Exception as e:
                        print(f"Error awarding points: {e}")

            # Обновляем агрегированную статистику попыток
            update_task_statistics(
                user=user,
                task=task,
                is_correct=is_correct,
                first_time=first_time,
            )

            # Обновляем агрегированную статистику попыток
            update_task_statistics(
                user=user,
                task=task,
                is_correct=is_correct,
                first_time=first_time,
            )

        response_data = {
            "correct": is_correct,
            "first_time": first_time,
            "reward": reward,
        }

        if transaction_data:
            response_data["new_balance"] = transaction_data["new_balance"]

        return Response(response_data)
