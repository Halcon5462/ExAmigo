from django.utils import timezone

import random

from .models import Task
from statistic.models import TaskStatistics, TaskProgress


def exam_time_left(exam):
    """
    Возвращает оставшееся время экзамена в секундах.
    """
    elapsed = (timezone.now() - exam.started_at).total_seconds()
    return max(0, exam.time_limit - int(elapsed))


def finish_exam_session(exam):
    """
    Завершает сессию экзамена.
    """
    if exam.is_finished:
        return exam

    correct = exam.attempts.filter(is_correct=True).count()

    exam.score = correct
    exam.finished_at = timezone.now()
    exam.is_finished = True
    exam.save(update_fields=["score", "finished_at", "is_finished"])

    return exam



def get_target_difficulty(stats: TaskStatistics | None) -> int:
    """
    Определяет целевую сложность задания на основе статистики пользователя.
    """
    if not stats or stats.attempts_count == 0:
        return random.choice([1, 2])

    accuracy = stats.correct_count / stats.attempts_count

    if accuracy < 0.6:
        return random.choice([1, 2])
    elif accuracy < 0.85:
        return random.choice([3, 4])
    else:
        return random.choice([4, 5])


def pick_task(user, subject: str, number: int, difficulty: int) -> Task | None:
    """
    Выбирает задание с приоритетом нерешённых ранее пользователем.
    """
    solved_tasks = TaskProgress.objects.filter(
        user=user
    ).values_list("task_id", flat=True)

    task = (
        Task.objects.filter(
            subject=subject,
            order_KIM=number,
            difficulty=difficulty,
        )
        .exclude(id__in=solved_tasks)
        .order_by("?")
        .first()
    )
    if task:
        return task

    task = (
        Task.objects.filter(
            subject=subject,
            order_KIM=number,
        )
        .exclude(id__in=solved_tasks)
        .order_by("?")
        .first()
    )
    if task:
        return task

    return (
        Task.objects.filter(
            subject=subject,
            order_KIM=number,
        )
        .order_by("?")
        .first()
    )


class TaskSetGenerator:
    """
    Генерация списка заданий (варианта) на основе статистики пользователя.
    """

    @staticmethod
    def generate(user, subject: str, task_numbers: list[int]) -> list[Task]:
        """
        Генерирует список заданий.
        """
        tasks: list[Task] = []

        for number in task_numbers:
            stats = TaskStatistics.objects.filter(
                user=user,
                subject=subject,
                order_KIM=number,
            ).first()

            difficulty = get_target_difficulty(stats)

            task = pick_task(
                user=user,
                subject=subject,
                number=number,
                difficulty=difficulty,
            )

            if task:
                tasks.append(task)

        return tasks
