from django.db import models


class TaskHint(models.Model):
    '''
    Модель полученной подсказки для кеширования
    level - уровень подсказки(частичное/полное решение)
    '''
    task = models.ForeignKey(
        "task_bank.Task",
        on_delete=models.CASCADE,
        related_name="hints"
    )
    level = models.IntegerField(default=1)
    hint = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("task", "level")

    def __str__(self):
        return f"Подсказка для задания {self.task.id} уровная {self.level}"
