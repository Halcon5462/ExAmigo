from django.db.models import Exists, IntegerField, OuterRef, Subquery, Value
from django.db.models.functions import Coalesce

from achievements.models import Achievement, UserAchievement, UserAchievementProgress


def get_user_achievements(user):
    """
    Возвращает все ачивки с прогрессом пользователя.
    """
    progress_subquery = UserAchievementProgress.objects.filter(
        user=user,
        achievement=OuterRef("pk"),
    ).values("current_value")[:1]
    obtained_subquery = UserAchievement.objects.filter(
        user=user,
        achievement=OuterRef("pk"),
    )

    return Achievement.objects.annotate(
        current_value=Coalesce(
            Subquery(progress_subquery, output_field=IntegerField()),
            Value(0),
        ),
        is_obtained=Exists(obtained_subquery),
    )
