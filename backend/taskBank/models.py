from django.db import models
from django.conf import settings


class Task(models.Model):
    subject = models.CharField(max_length=100, verbose_name="Предмет")
    order_KIM = models.PositiveIntegerField(verbose_name="Номер задания из КИМ")
    type = models.CharField(max_length=100, verbose_name="Тип задания из КИМ")
    difficulty = models.PositiveIntegerField(verbose_name="Сложность от 1 до 5")
    description = models.TextField(verbose_name="Описание задания")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='tasks',
        verbose_name="Автор",
        )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")


    class Meta:
        ordering = ['subject', 'order_KIM']
        verbose_name = "Задание"
        verbose_name_plural = "Задания"


    def str(self):
        return f"{self.subject} - №{self.order_KIM} ({self.difficulty})"

class TaskCorrectAnswer(models.Model):
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='correct_answers',
    )
    answer_text = models.TextField(max_length=25, verbose_name='Правильный ответ')
    