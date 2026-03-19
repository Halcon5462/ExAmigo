from django.conf import settings
from django.db import models


class Match(models.Model):

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

    created_at = models.DateTimeField(auto_now_add=True)