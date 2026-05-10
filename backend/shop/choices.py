from django.db import models


class TransactionReason(models.TextChoices):
    """Причины транзакций"""
    TASK_COMPLETE = 'task_complete', 'Выполнение задачи'
    ACHIEVEMENT = 'achievement', 'Получение ачивки'
    BONUS = 'bonus', 'Бонус'
    PURCHASE = 'purchase', 'Покупка'
    ADMIN_ADJUSTMENT = 'admin_adjustment', 'Корректировка администратора'
