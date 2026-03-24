from django.db import transaction
from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from achievements.services.achievement_service import AchievementService
from shop.services import WalletService
from statistic.models import TaskAttempt, TaskProgress
from statistic.services import update_task_statistics
from taskBank.models import ExamSession, Task
from taskBank.services import exam_time_left, finish_exam_session

from .models import UserAccount
from .serializers import RegisterSerializer, UserSerializer


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
                is_correct=is_correct
            )

            if is_correct:
                _, created = TaskProgress.objects.get_or_create(
                    user=user,
                    task=task
                )
                if created:
                    first_time = True
                    difficulty_str = self.DIFFICULTY_MAP.get(task.difficulty, "easy")
                    try:
                        transaction_data = WalletService.add_task_reward(
                            user=user,
                            task_difficulty=difficulty_str,
                            task_title=f"{task.subject}, номер–{task.order_KIM}, сложность: {task.difficulty}",
                        )
                        reward = transaction_data["amount"]
                    except Exception as e:
                        print(f"Error awarding points: {e}")

                AchievementService.handle_event(
                    user=user,
                    event="solve_tasks",
                    context={
                        "difficulty": task.difficulty,
                        "first_time": first_time,
                    },
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

        response_data = {
            "correct": is_correct,
            "first_time": first_time,
            "reward": reward,
        }

        if transaction_data:
            response_data["new_balance"] = transaction_data["new_balance"]

        return Response(response_data)
