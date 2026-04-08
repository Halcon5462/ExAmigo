from django.contrib import admin
from .models import UserStreak

@admin.register(UserStreak)
class UserStreakAdmin(admin.ModelAdmin):
    list_display = ('user', 'current_streak', 'best_streak', 'last_activity_date')
    list_filter = ('current_streak', 'best_streak')
    search_fields = ('user__email', 'user__name')
    readonly_fields = ('updated_at',)