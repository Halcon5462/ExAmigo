from django.db import models
from django.conf import settings
from .ege_scoring import get_task_score, SubjectChoices


class Task(models.Model):
    subject = models.CharField(
        max_length=50,
        choices=SubjectChoices.choices,
    )
    order_KIM = models.PositiveIntegerField(verbose_name="Номер задания из КИМ")
    type = models.CharField(max_length=100, verbose_name="Тип задания из КИМ")
    difficulty = models.PositiveIntegerField(verbose_name="Сложность от 1 до 5")
    description = models.TextField(verbose_name="Описание задания")
    image = models.ImageField(
        upload_to='tasks/images/', 
        blank=True,
        null=True,
    )
    file = models.FileField(
        upload_to='tasks/files/', 
        blank=True,
        null=True,
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='tasks',
        verbose_name="Автор",
        )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")


    @property
    def primary_score(self):
        return get_task_score(self.subject, self.order_KIM)


    class Meta:
        ordering = ['subject', 'order_KIM']
        verbose_name = "Задание"
        verbose_name_plural = "Задания"


    def __str__(self):
        return f"Задание {self.id}: {self.subject} - №{self.order_KIM} (сложность {self.difficulty}/5)"

class TaskCorrectAnswer(models.Model):
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='correct_answers',
    )
    answer_text = models.TextField(max_length=25, verbose_name='Правильный ответ')

class TaskSet(models.Model):
    """Набор заданий (комплект)"""
    name = models.CharField(max_length=200, verbose_name="Название комплекта")
    subject = models.CharField(
        max_length=50,
        choices=SubjectChoices.choices,
    )
    average_difficulty = models.FloatField(verbose_name="Средняя сложность", blank=True, null=True)
    is_public = models.BooleanField(default=False, verbose_name="Публичный")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='tasksets',
        verbose_name="Автор",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    @property
    def total_primary_score(self):
        return sum(item.task.primary_score for item in self.items.all())

    class Meta:
        verbose_name = "Комплект заданий"
        verbose_name_plural = "Комплекты заданий"

    def __str__(self):
        return self.name

class TaskSetItem(models.Model):
    """Связующая модель между TaskSet и Task, хранит порядок задания в комплекте"""
    task_set = models.ForeignKey(TaskSet, on_delete=models.CASCADE, related_name='items')
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='taskset_items')
    order = models.PositiveIntegerField(verbose_name="Порядок задания в комплекте")

    class Meta:
        ordering = ['order']
        unique_together = ('task_set', 'task')
        verbose_name = "Элемент комплекта"
        verbose_name_plural = "Элементы комплекта"

    def __str__(self):
        return f"{self.task_set.name} - {self.task.id} (#{self.order})"
    