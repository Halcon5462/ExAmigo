from django.utils import timezone

from .models import TaskStatistics


def update_task_statistics(user, task, is_correct: bool, first_time: bool) -> None:
    """
    Обновляет агрегированную статистику по заданию.
    """
    stats, created = TaskStatistics.objects.get_or_create(
        user=user,
        subject=task.subject,
        order_KIM=task.order_KIM,
        defaults={"attempts_count": 0, "correct_count": 0, "correct_first_try": 0},
    )

    stats.attempts_count += 1
    if is_correct:
        stats.correct_count += 1
        if first_time:
            stats.correct_first_try += 1

    stats.last_attempt_at = timezone.now()
    stats.save()

