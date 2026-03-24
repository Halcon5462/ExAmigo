from achievements.models import UserAchievementProgress


class BaseAchievementStrategy:
    def process(self, user, achievement, context):
        raise NotImplementedError


class SolveTasksStrategy(BaseAchievementStrategy):
    def process(self, user, achievement, context):
        progress, _ = UserAchievementProgress.objects.get_or_create(
            user=user,
            achievement=achievement,
        )
        progress.current_value += 1
        progress.save(update_fields=["current_value"])

        return progress.is_completed


class FirstTryStrategy(BaseAchievementStrategy):
    def process(self, user, achievement, context):
        if not context.get("first_time"):
            return False

        progress, _ = UserAchievementProgress.objects.get_or_create(
            user=user,
            achievement=achievement,
        )
        progress.current_value += 1
        progress.save(update_fields=["current_value"])

        return progress.is_completed


class DifficultyStrategy(BaseAchievementStrategy):
    def process(self, user, achievement, context):
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
