from django.contrib import admin

from achievements.models import Achievement, UserAchievement, UserAchievementProgress


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ("name", "action_type", "target", "reward")
    search_fields = ("name",)
    list_filter = ("action_type",)


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ("user", "achievement", "get_date")
    search_fields = ("user__email", "achievement__name")


@admin.register(UserAchievementProgress)
class UserAchievementProgressAdmin(admin.ModelAdmin):
    list_display = ("user", "achievement", "current_value")
    search_fields = ("user__email", "achievement__name")
