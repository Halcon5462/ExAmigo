from achievements.models import UserAchievementProgress


class BaseAchievementStrategy:
    """
    Базовая стратегия для ачивок.
    """
    def process(self, user, achievement, context):
        """
        Обрабатывает событие и возвращает True, если ачивка выполнена.
        """
        raise NotImplementedError


class SolveTasksStrategy(BaseAchievementStrategy):
    """
    Стратегия для ачивок, связанных с решением задач.
    """
    def process(self, user, achievement, context):
        """
        Обрабатывает событие и возвращает True, если ачивка выполнена.
        """
        progress, _ = UserAchievementProgress.objects.get_or_create(
            user=user,
            achievement=achievement,
        )
        progress.current_value += 1
        progress.save(update_fields=["current_value"])

        return progress.is_completed


class FirstTryStrategy(BaseAchievementStrategy):
    """
    Стратегия для ачивок, связанных с решением задач с первого раза.
    """
    def process(self, user, achievement, context):
        """
        Обрабатывает событие и возвращает True, если ачивка выполнена.
        """
        if not context.get("first_time"):
            return False

        required_subject = (achievement.condition or {}).get("subject")
        if required_subject and context.get("subject") != required_subject:
            return False

        progress, _ = UserAchievementProgress.objects.get_or_create(
            user=user,
            achievement=achievement,
        )
        progress.current_value += 1
        progress.save(update_fields=["current_value"])

        return progress.is_completed


class DifficultyStrategy(BaseAchievementStrategy):
    """
    Стратегия для ачивок, связанных с решением задач определенной сложности.
    """
    def process(self, user, achievement, context):
        """
        Обрабатывает событие и возвращает True, если ачивка выполнена.
        """
        required = (achievement.condition or {}).get("difficulty")
        if context.get("difficulty") != required:
            return False

        progress, _ = UserAchievementProgress.objects.get_or_create(
            user=user,
            achievement=achievement,
        )
        progress.current_value += 1
        progress.save(update_fields=["current_value"])

        return progress.is_completed
