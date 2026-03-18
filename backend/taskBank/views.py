from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from .models import Task, TaskCorrectAnswer, TaskSet, TaskSetItem
from .serializers import TaskSerializer, TaskSetSerializer
from .services import TaskSetGenerator

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

    @action(detail=False, methods=["post"], url_path="generate")
    def generate(self, request):
        """
        Генерация комплекта заданий на основе статистики пользователя.

        Ожидаемый формат body:
        {
            "subject": "MATH",
            "mode": "full" | "custom",
            "task_numbers": [1, 2, 3]   # для режима custom
        }
        """
        user = request.user
        subject = request.data.get("subject")
        mode = request.data.get("mode", "full")
        task_numbers = request.data.get("task_numbers") or []

        if not subject:
            return Response(
                {"detail": "Поле 'subject' обязательно."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        if mode == "full":
            from django.db.models import F

            numbers_qs = (
                Task.objects.filter(subject=subject)
                .values_list("order_KIM", flat=True)
                .distinct()
            )
            task_numbers = sorted(numbers_qs)
        else:
            try:
                task_numbers = [int(n) for n in task_numbers]
            except (TypeError, ValueError):
                return Response(
                    {"detail": "Поле 'task_numbers' должно быть списком чисел."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if not task_numbers:
            return Response(
                {"detail": "Не удалось определить номера заданий для генерации."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        tasks = TaskSetGenerator.generate(user=user, subject=subject, task_numbers=task_numbers)

        if not tasks:
            return Response(
                {"detail": "Не удалось подобрать задания по указанным параметрам."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        from django.utils import timezone

        name = request.data.get("name") or f"Адаптивный вариант {subject} от {timezone.now().strftime('%d.%m.%Y %H:%M')}"

        task_set = TaskSet.objects.create(
            name=name,
            subject=subject,
            is_public=False,
            author=user if user.is_authenticated else None,
        )
        
        for order_index, task in enumerate(tasks, start=1):
            TaskSetItem.objects.create(
                task_set=task_set,
                task=task,
                order=order_index,
            )

        serializer = self.get_serializer(task_set)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
