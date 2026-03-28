from django.db import OperationalError, ProgrammingError

from achievements.models import Achievement, UserAchievement
from achievements.services.factory import AchievementStrategyFactory


class AchievementService:
    """
    Сервис для работы с ачивками.
    """
    @staticmethod
    def handle_event(user, event, context=None):
        """
        Обрабатывает событие и проверяет, нужно ли выдать ачивку.
        """
        context = context or {}

        try:
            achievements = Achievement.objects.filter(action_type=event)

            for achievement in achievements:
                strategy = AchievementStrategyFactory.get_strategy(
                    achievement.action_type
                )
                if not strategy:
                    continue

                completed = strategy.process(user, achievement, context)
                if completed:
                    UserAchievement.objects.get_or_create(
                        user=user,
                        achievement=achievement,
                    )
        except (OperationalError, ProgrammingError):
            return
