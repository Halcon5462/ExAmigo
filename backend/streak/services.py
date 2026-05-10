from django.db import DatabaseError
from .models import UserStreak


def update_user_streak(user):
    try:
        streak, _ = UserStreak.objects.get_or_create(user=user)
        streak.update_streak()
        print(f"Серия обновлена: {user.email} - {streak.current_streak} дней")
        return streak
    except DatabaseError as e:
        print(f"Ошибка при обновлении серии: {e}")
        return None
