from django.conf import settings
from django.db import models
from taskBank.models import TaskSet


class Match(models.Model):
    """
    Модель для матча.
    """

    STATUS_CHOICES = [
        ("waiting", "Waiting"),
        ("started", "Started"),
        ("finished", "Finished"),
    ]

    host = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="hosted_matches"
    )

    opponent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="joined_matches"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="waiting"
    )

    task_set = models.ForeignKey(
        TaskSet,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    host_finished = models.BooleanField(default=False)
    opponent_finished = models.BooleanField(default=False)
