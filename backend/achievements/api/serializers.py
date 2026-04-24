from rest_framework import serializers

from achievements.models import Achievement


class AchievementListSerializer(serializers.ModelSerializer):
    """
    Сериализатор для списка ачивок.
    """
    current_value = serializers.IntegerField(default=0)
    progress_percent = serializers.SerializerMethodField()
    is_obtained = serializers.BooleanField()
    earned_at = serializers.DateTimeField(required=False, allow_null=True)

    class Meta:
        model = Achievement
        fields = [
            "id",
            "name",
            "description",
            "action_type",
            "target",
            "icon",
            "reward",
            "condition",
            "current_value",
            "progress_percent",
            "is_obtained",
            "earned_at",
        ]

    def get_progress_percent(self, obj):
        """
        Возвращает прогресс в процентах.
        """
        current = obj.current_value or 0
        if not obj.target:
            return 100
        return min(100, int(current / obj.target * 100))
