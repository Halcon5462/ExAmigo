from django.conf import settings
from django.db import models


class Achievement(models.Model):
    """
    Модель для ачивок.
    """
    ACTION_TYPES = [
        ("solve_tasks", "Решить задачи"),
        ("first_try", "С первого раза"),
        ("difficulty_master", "Мастер сложности"),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField()
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    target = models.PositiveIntegerField()
    icon = models.ImageField(upload_to="achievements/icons/")
    reward = models.CharField(max_length=255, blank=True, null=True)
    condition = models.JSONField(blank=True, null=True)

    class Meta:
        db_table = "account_achievement"

    def __str__(self):
        """
        Возвращает имя ачивки.
        """
        return self.name


class UserAchievement(models.Model):
    """
    Модель для связи пользователя и ачивки.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="achievements",
    )
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    get_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "account_userachievement"
        unique_together = ("user", "achievement")

    def __str__(self):
        """
        Возвращает строку с email пользователя и именем ачивки.
        """
        return f"{self.user.email} - {self.achievement.name}"


class UserAchievementProgress(models.Model):
    """
    Модель для отслеживания прогресса пользователя в получении ачивки.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="progressToAchievement",
    )
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    current_value = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "account_userachievementprogress"
        unique_together = ("user", "achievement")

    def __str__(self):
        """
        Возвращает строку с email пользователя и именем ачивки.
        """
        return f"{self.user.email} progress for {self.achievement.name}"

    @property
    def is_completed(self):
        """
        Возвращает True, если прогресс пользователя достиг цели ачивки.
        """
        return self.current_value >= self.achievement.target
