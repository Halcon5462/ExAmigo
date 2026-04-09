from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db import transaction

from .models import Task, TaskCorrectAnswer, TaskSet, TaskSetItem, ExamSession, TaskSetType
from .ege_scoring import SubjectChoices
from .serializers import TaskSerializer, TaskSetSerializer

from .services import exam_time_left, finish_exam_session
from .services import TaskSetGenerator
from django.utils import timezone
from django.db.models import F

class TaskViewSet(ModelViewSet):
    """
    ViewSet для работы с заданиями.
    """
    queryset = Task.objects.prefetch_related("correct_answers").all()
    serializer_class = TaskSerializer

    @action(detail=True, methods=["post"])
    def check(self, request, pk=None):
        """
        Проверяет ответ пользователя на задание.
        """
        task = self.get_object()
        user_answer = request.data.get("answer")

        is_correct = task.correct_answers.filter(
            answer_text=user_answer
        ).exists()

        return Response({"correct": is_correct})

    @action(detail=True, methods=["get"])
    def get_queryset(self):
        qs = Task.objects.prefetch_related("correct_answers")

        subject = self.request.query_params.get("subject")
        order_kim = self.request.query_params.get("order_KIM")
        type_ = self.request.query_params.get("type")
        difficulty = self.request.query_params.get("difficulty")
        author = self.request.query_params.get("author")

        if subject:
            qs = qs.filter(subject=subject)
        if order_kim:
            qs = qs.filter(order_KIM=order_kim)
        if type_:
            qs = qs.filter(type=type_)
        if difficulty:
            qs = qs.filter(difficulty=difficulty)
        if author:
            qs = qs.filter(author=author)

        return qs

class TaskSetViewSet(ModelViewSet):
    """CRUD for TaskSet (комплекты заданий)"""
    queryset = TaskSet.objects.prefetch_related('items__task').all()
    serializer_class = TaskSetSerializer
    @action(detail=False, methods=["post"], url_path="generate-exam", permission_classes=[IsAuthenticated])
    def generate_exam(self, request):
        """
        Генерирует экзаменационный вариант.
        """
        subject = request.data.get("subject")
        name = request.data.get("name") or "Экзамен"
        is_public = bool(request.data.get("is_public", False))

        if not subject:
            return Response({"error": "subject required"}, status=status.HTTP_400_BAD_REQUEST)

        value_to_label = {v: l for v, l in SubjectChoices.choices}
        label_to_value = {l: v for v, l in SubjectChoices.choices}

        allowed_values = list(value_to_label.keys())
        allowed_labels = list(label_to_value.keys())

        if subject not in allowed_values and subject not in allowed_labels:
            return Response(
                {
                    "error": "invalid subject",
                    "allowed_subjects": [{"value": v, "label": l} for v, l in SubjectChoices.choices]
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        normalized_subject = label_to_value.get(subject, subject)
        subject_filters = {normalized_subject}
        # Поддержка старых данных, где в Task.subject мог сохраниться label, а не value.
        if normalized_subject in value_to_label:
            subject_filters.add(value_to_label[normalized_subject])

        tasks = []
        missing = []

        for number in range(1, 13):
            task = Task.objects.filter(
                subject__in=subject_filters,
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
                subject=normalized_subject,
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


class StartExamView(APIView):
    """
    Начинает сессию экзамена.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """
        Обрабатывает POST-запрос для начала сессии экзамена.
        """
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
    """
    Возвращает информацию о сессии экзамена.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, exam_id):
        """
        Обрабатывает GET-запрос для получения информации о сессии экзамена.
        """
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
    """
    Завершает сессию экзамена.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, exam_id):
        """
        Обрабатывает POST-запрос для завершения сессии экзамена.
        """
        exam = ExamSession.objects.get(
            id=exam_id,
            user=request.user
        )

        exam = finish_exam_session(exam)

        return Response({
            "score": exam.score
        })

class SubjectChoicesView(APIView):
    def get(self, request):
        return Response([
            {"value": v, "label": l}
            for v, l in SubjectChoices.choices
        ])

class TaskFilterOptionsView(APIView):
    def get(self, request):
        tasks = Task.objects.all()
        return Response({
            "subjects": [
                {"value": v, "label": l} for v, l in SubjectChoices.choices
            ],
            "orders": sorted(tasks.values_list("order_KIM", flat=True).distinct()),
            "types": list(tasks.values_list("type", flat=True).distinct()),
            "difficulties": sorted(tasks.values_list("difficulty", flat=True).distinct()),
            "authors": list(
                tasks.exclude(author=None)
                     .values_list("author__name", flat=True)  # исправлено
                     .distinct()
            ),
        })
