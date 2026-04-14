from django.db import models
from django.conf import settings
from django.utils import timezone

class UserStreak(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='streak',
        verbose_name='Пользователь'
    )
    current_streak = models.PositiveIntegerField(
        default=0,
        verbose_name='Текущая серия'
    )
    best_streak = models.PositiveIntegerField(
        default=0,
        verbose_name='Лучшая серия'
    )
    last_activity_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Дата последней активности'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )

    class Meta:
        verbose_name = 'Серия пользователя'
        verbose_name_plural = 'Серии пользователей'

    def __str__(self):
        return f"{self.user.email} - {self.current_streak} дней"

    def update_streak(self):
        today = timezone.now().date()
        
        if self.last_activity_date is None:
            self.current_streak = 1
        else:
            days_diff = (today - self.last_activity_date).days
            
            if days_diff == 1:
                self.current_streak += 1
            elif days_diff == 0:
                return self
            else:
                self.current_streak = 1
        
        if self.current_streak > self.best_streak:
            self.best_streak = self.current_streak
        
        self.last_activity_date = today
        self.save()
        return self