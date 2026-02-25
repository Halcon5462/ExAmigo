from django.db import models
from django.conf import settings


class Task(models.Model):
    subject = models.CharField(max_length=100, verbose_name="Предмет")
    order_KIM = models.PositiveIntegerField(verbose_name="Номер задания из КИМ")
    type = models.CharField(max_length=100, verbose_name="Тип задания из КИМ")
    difficulty = models.PositiveIntegerField(verbose_name="Сложность от 1 до 5")
    description = models.TextField(verbose_name="Описание задания")
    answer = models.CharField(max_length=255, verbose_name="Праивльный ответ")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='tasks', verbose_name="Автор")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    class Meta:
        ordering = ['subject', 'order_KIM']
        verbose_name = "Задание"
        verbose_name_plural = "Задания"

    def str(self):
        return f"{self.subject} - №{self.order_KIM} ({self.difficulty})"


class TaskSet(models.Model):
    name = models.CharField(max_length=255)
    tasks = models.ManyToManyField('Task', through='TaskSetItem', related_name='taskSets')
    average_difficulty = models.FloatField(default=0.0)
    subject = models.CharField(max_length=100)
    is_public = models.BooleanField(default=False)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='created_task_sets', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name} ({self.subject})"


class TaskSetItem(models.Model):
    task_set = models.ForeignKey(TaskSet, on_delete=models.CASCADE, related_name='items')
    task = models.ForeignKey('Task', on_delete=models.CASCADE)
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ['order']
        unique_together = ('task_set', 'order')
