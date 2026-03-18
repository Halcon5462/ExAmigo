from django.db import models
from django.conf import settings

from taskBank.models import Task
from taskBank.ege_scoring import SubjectChoices


class TaskAttempt(models.Model):
    """
    Просто решение, бесконечное количество на одно задание.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="attempts",
    )
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    answer = models.TextField()
    is_correct = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)


class TaskProgress(models.Model):
    """
    Первое верное решение для задания.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="task_progress",
    )
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    first_solved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "task")


class TaskStatistics(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="task_statistics",
    )
    subject = models.CharField(
        max_length=50,
        choices=SubjectChoices.choices,
    )
    order_KIM = models.PositiveIntegerField()

    attempts_count = models.PositiveIntegerField(default=0)
    correct_first_try = models.PositiveIntegerField(default=0)
    correct_count = models.PositiveIntegerField(default=0)

    last_attempt_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "subject", "order_KIM")

