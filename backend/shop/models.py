from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from django.db.models.signals import post_save
from django.dispatch import receiver
from .choices import TransactionReason

User = get_user_model()


class UserWallet(models.Model):
    """
    Модель кошелька пользователя для хранения баланса очков.

    Attributes:
        user: Связь один-к-одному с пользователем
        balance: Текущий баланс очков пользователя
        created_at: Дата создания кошелька
        updated_at: Дата последнего обновления
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wallet',
        verbose_name='Пользователь'
    )
    balance = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='Баланс очков'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')

    class Meta:
        verbose_name = 'Кошелек пользователя'
        verbose_name_plural = 'Кошельки пользователей'
        ordering = ['-created_at']

    def __str__(self):
        return f"Кошелек {self.user.name}: {self.balance} очков"


class WalletTransaction(models.Model):
    """
    Модель транзакций кошелька для отслеживания всех операций с балансом.

    Attributes:
        wallet: Связь с кошельком пользователя
        amount: Сумма транзакции (может быть положительной или отрицательной)
        reason: Причина транзакции
        created_at: Дата и время транзакции
    """

    wallet = models.ForeignKey(
        UserWallet,
        on_delete=models.CASCADE,
        related_name='transactions',
        verbose_name='Кошелек'
    )
    amount = models.IntegerField(
        verbose_name='Сумма',
        help_text='Положительное значение - начисление, отрицательное - списание'
    )
    reason = models.CharField(
        max_length=50,
        choices=TransactionReason.choices,
        verbose_name='Причина'
    )
    description = models.TextField(
        blank=True,
        verbose_name='Описание',
        help_text='Дополнительная информация о транзакции'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата транзакции')

    class Meta:
        verbose_name = 'Транзакция кошелька'
        verbose_name_plural = 'Транзакции кошельков'
        ordering = ['-created_at']

    def __str__(self):
        sign = "+" if self.amount > 0 else ""
        return f"{sign}{self.amount} очков - {self.get_reason_display()}"


@receiver(post_save, sender=User)
def create_user_wallet(sender, instance, created, **kwargs):
    """
    Сигнал для автоматического создания кошелька при создании пользователя.
    """
    if created:
        UserWallet.objects.create(user=instance)
