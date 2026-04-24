from rest_framework import serializers

from .models import TaskStatistics


class TaskStatisticsSerializer(serializers.ModelSerializer):
    """
    Сериализатор для статистики по заданиям.
    """

    accuracy_percent = serializers.SerializerMethodField()

    def get_accuracy_percent(self, obj):
        if not obj.attempts_count:
            return 0

        return round((obj.correct_count / obj.attempts_count) * 100)

    class Meta:
        model = TaskStatistics
        fields = [
            "id",
            "subject",
            "order_KIM",
            "attempts_count",
            "correct_first_try",
            "correct_count",
            "accuracy_percent",
            "last_attempt_at",
        ]
