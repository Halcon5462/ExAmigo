from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db import transaction

from .models import Task, TaskSet, TaskSetItem, ExamSession, TaskSetType
from .ege_scoring import SubjectChoices
from .serializers import TaskSerializer, TaskSetSerializer

from .services import exam_time_left, finish_exam_session
from .services import TaskSetGenerator


class TaskViewSet(ModelViewSet):  # pylint: disable=too-many-ancestors
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


class TaskSetViewSet(ModelViewSet):  # pylint: disable=too-many-ancestors
    """CRUD для TaskSet (комплекты заданий)"""

    queryset = TaskSet.objects.prefetch_related('items__task').all()
    serializer_class = TaskSetSerializer

    @action(
        detail=False,
        methods=["post"],
        url_path="generate-exam",
        permission_classes=[IsAuthenticated],
    )
    def generate_exam(self, request):
        subject = request.data.get("subject")
        name = request.data.get("name") or "Экзамен"

        if (err := validate_subject_presence(subject)):
            return err
        if (err := validate_subject_value(subject)):
            return err

        tasks, missing = collect_exam_tasks(subject)

        if missing:
            return error_response(
                {"error": "Не хватает задач для генерации экзамена", "missing": missing},
                400,
            )

        taskset = create_exam_taskset(request.user, name, subject, tasks)

        return Response(
            TaskSetSerializer(taskset, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"], url_path="generate")
    def generate(self, request):
        user = request.user
        subject = request.data.get("subject")
        mode = request.data.get("mode", "full")
        task_numbers = request.data.get("task_numbers") or []

        if not subject:
            return error_response({"detail": "subject required"}, 400)

        task_numbers = resolve_task_numbers(subject, mode, task_numbers)

        if not task_numbers:
            return error_response({"detail": "invalid task_numbers"}, 400)

        tasks = TaskSetGenerator.generate(
            user=user,
            subject=subject,
            task_numbers=task_numbers,
        )

        if not tasks:
            return error_response({"detail": "no tasks found"}, 400)

        taskset = create_generated_taskset(user, subject, request.data, tasks)

        return Response(
            TaskSetSerializer(taskset).data,
            status=status.HTTP_201_CREATED,
        )


def error_response(data, code):
    return Response(data, status=code)


def validate_subject_presence(subject):
    if not subject:
        return error_response({"error": "subject required"}, 400)
    return None


def validate_subject_value(subject):
    value_to_label = dict(SubjectChoices.choices)
    label_to_value = {l: v for v, l in SubjectChoices.choices}

    if subject not in value_to_label and subject not in label_to_value:
        return error_response(
            {
                "error": "invalid subject",
                "allowed_subjects": [
                    {"value": v, "label": l}
                    for v, l in SubjectChoices.choices
                ],
            },
            400,
        )
    return None


def collect_exam_tasks(subject):
    value_to_label = dict(SubjectChoices.choices)
    label_to_value = {l: v for v, l in SubjectChoices.choices}

    normalized = label_to_value.get(subject, subject)

    subject_filters = {normalized}
    if normalized in value_to_label:
        subject_filters.add(value_to_label[normalized])

    tasks = []
    missing = []

    for number in range(1, 13):
        task = (
            Task.objects
            .filter(subject__in=subject_filters, order_KIM=number)
            .order_by("?")
            .first()
        )

        if task:
            tasks.append(task)
        else:
            missing.append(number)

    return tasks, missing


def create_exam_taskset(user, name, subject, tasks):
    avg_diff = sum(t.difficulty for t in tasks) / len(tasks)

    with transaction.atomic():
        taskset = TaskSet.objects.create(
            name=name,
            subject=subject,
            is_public=False,
            author=user,
            type=TaskSetType.EXAM,
            average_difficulty=avg_diff,
        )

        for i, task in enumerate(tasks, start=1):
            TaskSetItem.objects.create(
                task_set=taskset,
                task=task,
                order=i,
            )

    return taskset


def resolve_task_numbers(subject, mode, task_numbers):
    if mode == "full":
        return sorted(
            Task.objects.filter(subject=subject)
            .values_list("order_KIM", flat=True)
            .distinct()
        )

    try:
        return [int(n) for n in task_numbers]
    except (TypeError, ValueError):
        return []


def create_generated_taskset(user, subject, data, tasks):
    name = data.get("name") or f"Адаптивный вариант {subject}"

    with transaction.atomic():
        taskset = TaskSet.objects.create(
            name=name,
            subject=subject,
            is_public=False,
            author=user if user.is_authenticated else None,
        )

        for i, task in enumerate(tasks, start=1):
            TaskSetItem.objects.create(
                task_set=taskset,
                task=task,
                order=i,
            )

    return taskset


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

        def _as_int(value):
            if value is None:
                return None
            try:
                return int(round(float(value)))
            except (TypeError, ValueError):
                return None

        orders_raw = (
            tasks.exclude(order_KIM__isnull=True)
            .values_list("order_KIM", flat=True)
            .distinct()
        )
        orders = sorted({v for v in (_as_int(x) for x in orders_raw) if v is not None})

        difficulties_raw = (
            tasks.exclude(difficulty__isnull=True)
            .values_list("difficulty", flat=True)
            .distinct()
        )
        difficulties = sorted({v for v in (_as_int(x) for x in difficulties_raw) if v is not None})

        types_raw = (
            tasks.exclude(type__isnull=True)
            .exclude(type__exact="")
            .values_list("type", flat=True)
            .distinct()
        )
        types = sorted({t.strip() for t in types_raw if isinstance(t, str) and t.strip()})

        authors_raw = (
            tasks.exclude(author=None)
            .values_list("author__name", flat=True)
            .distinct()
        )
        authors = sorted({a.strip() for a in authors_raw if isinstance(a, str) and a.strip()})

        return Response({
            "subjects": [
                {"value": v, "label": l} for v, l in SubjectChoices.choices
            ],
            "orders": orders,
            "types": types,
            "difficulties": difficulties,
            "authors": authors,
        })
