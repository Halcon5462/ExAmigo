from django.db import models
from django.contrib.auth.models import User


class Task(models.Model):
    subject = models.CharField(max_length=100, verbose_name="Предмет")
    order_KIM = models.PositiveIntegerField(verbose_name="Номер задания КИМ")
    type = models.CharField(max_length=100, verbose_name="Тип задания")
    difficulty = models.CharField(max_length=50, verbose_name="Сложность")
    description = models.TextField(verbose_name="Описание задания")
    answer = models.CharField(max_length=255, verbose_name="Ответ")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks', verbose_name="Автор")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    class Meta:
        ordering = ['subject', 'order_KIM']
        verbose_name = "Задание"
        verbose_name_plural = "Задания"

    def __str__(self):
        return f"{self.subject} - №{self.order_KIM} ({self.difficulty})"