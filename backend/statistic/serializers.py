from rest_framework import serializers

from .models import TaskStatistics


class TaskStatisticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskStatistics
        fields = [
            "id",
            "subject",
            "order_KIM",
            "attempts_count",
            "correct_first_try",
            "correct_count",
            "last_attempt_at",
        ]

