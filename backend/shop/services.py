from typing import Optional, Dict, Any
from django.db import transaction as db_transaction
from .models import UserWallet, WalletTransaction
from .choices import TransactionReason


class WalletService:
    """
    Сервис для работы с кошельком пользователя.
    Предоставляет методы для изменения баланса и создания транзакций.
    """

    # Словарь с наградами за различные активности
    TASK_REWARDS = {
        'easy': 10,  # Легкая задача
        'medium': 25,  # Средняя задача
        'hard': 50,  # Сложная задача
        'expert': 100,  # Экспертная задача
    }

    ACHIEVEMENT_REWARDS = {
        'first_task': 5,
        'ten_tasks': 50,
        'hundred_tasks': 200,
        'perfect_week': 100,
        'helper': 30,
        'expert_solver': 150,
        'social': 20,
    }

    BONUS_REWARDS = {
        'daily_bonus': 5,
        'weekly_bonus': 50,
        'referral_bonus': 100,
    }

    @classmethod
    def change_balance(
            cls,
            user,
            amount: int,
            reason: str,
            description: str = ""
    ) -> Optional[Dict[str, Any]]:
        """
        Изменяет баланс пользователя и создает запись о транзакции.

        Args:
            user: Пользователь или объект кошелька
            amount: Сумма изменения (положительная - начисление, отрицательная - списание)
            reason: Причина транзакции (из TransactionReason)
            description: Дополнительное описание

        Returns:
            Dict с информацией о транзакции или None в случае ошибки

        Raises:
            ValueError: Если недостаточно средств для списания
        """
        if hasattr(user, 'wallet'):
            wallet = user.wallet
        else:
            wallet = UserWallet.objects.get(user=user)

        if amount < 0 and wallet.balance + amount < 0:
            raise ValueError("Недостаточно средств на балансе")

        with db_transaction.atomic():
            wallet.balance += amount
            wallet.save(update_fields=['balance', 'updated_at'])

            transaction = WalletTransaction.objects.create(
                wallet=wallet,
                amount=amount,
                reason=reason,
                description=description
            )

        return {
            'transaction_id': transaction.id,
            'new_balance': wallet.balance,
            'amount': amount,
            'reason': reason,
            'created_at': transaction.created_at
        }

    @classmethod
    def add_task_reward(
        cls,
        user,
        task_difficulty: str,
        task_title: str = "",
    ) -> Optional[Dict[str, Any]]:
        """
        Начисляет награду за выполнение задачи.

        Args:
            user: Пользователь
            task_difficulty: Сложность задачи (easy, medium, hard, expert)
            task_title: Название задачи для описания

        Returns:
            Результат транзакции
        """
        if task_difficulty not in cls.TASK_REWARDS:
            raise ValueError(f"Неизвестная сложность задачи: {task_difficulty}")

        amount = cls.TASK_REWARDS[task_difficulty]
        if task_title:
            description = f"Задача: {task_title}"
        else:
            description = f"Задача сложности {task_difficulty}"

        return cls.change_balance(
            user=user,
            amount=amount,
            reason=TransactionReason.TASK_COMPLETE,
            description=description
        )

    @classmethod
    def add_achievement_reward(
        cls,
        user,
        achievement_code: str,
        achievement_name: str = ""
    ) -> Optional[Dict[str, Any]]:
        """
        Начисляет награду за получение ачивки.

        Args:
            user: Пользователь
            achievement_code: Код ачивки
            achievement_name: Название ачивки для описания

        Returns:
            Результат транзакции
        """
        if achievement_code not in cls.ACHIEVEMENT_REWARDS:
            amount = 25
        else:
            amount = cls.ACHIEVEMENT_REWARDS[achievement_code]

        if achievement_name:
            description = f"Ачивка: {achievement_name}"
        else:
            description = f"Ачивка {achievement_code}"

        return cls.change_balance(
            user=user,
            amount=amount,
            reason=TransactionReason.ACHIEVEMENT,
            description=description
        )

    @classmethod
    def add_bonus(cls, user, bonus_type: str) -> Optional[Dict[str, Any]]:
        """
        Начисляет бонус пользователю.

        Args:
            user: Пользователь
            bonus_type: Тип бонуса (daily_bonus, weekly_bonus, referral_bonus)

        Returns:
            Результат транзакции
        """
        if bonus_type not in cls.BONUS_REWARDS:
            raise ValueError(f"Неизвестный тип бонуса: {bonus_type}")

        amount = cls.BONUS_REWARDS[bonus_type]
        description = f"Бонус: {bonus_type.replace('_', ' ').title()}"

        return cls.change_balance(
            user=user,
            amount=amount,
            reason=TransactionReason.BONUS,
            description=description
        )

    @classmethod
    def get_balance(cls, user) -> int:
        """Возвращает текущий баланс пользователя."""
        if hasattr(user, 'wallet'):
            return user.wallet.balance
        return UserWallet.objects.get(user=user).balance

    @classmethod
    def get_transaction_history(cls, user, limit: int = 50):
        """Возвращает историю транзакций пользователя."""
        if hasattr(user, 'wallet'):
            wallet = user.wallet
        else:
            wallet = UserWallet.objects.get(user=user)

        return wallet.transactions.all()[:limit]
