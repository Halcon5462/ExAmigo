from rest_framework import serializers
from .models import UserStreak


class UserStreakSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    user_name = serializers.ReadOnlyField(source='user.name')

    class Meta:
        model = UserStreak
        fields = [
            'id',
            'user',
            'user_email',
            'user_name',
            'current_streak',
            'best_streak',
            'last_activity_date',
            'updated_at'
        ]
        read_only_fields = ['user', 'current_streak', 'best_streak', 'last_activity_date']
