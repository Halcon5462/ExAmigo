from django.contrib import admin

from .models import TaskAttempt, TaskProgress, TaskStatistics


@admin.register(TaskAttempt)
class TaskAttemptAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "task",
        "exam_session",
        "is_correct",
        "created_at",
    )
    list_filter = (
        "is_correct",
        "created_at",
        "task__subject",
    )
    search_fields = (
        "user__email",
        "task__description",
    )
    autocomplete_fields = (
        "user",
        "task",
    )
    ordering = ("-created_at",)


@admin.register(TaskProgress)
class TaskProgressAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "task",
        "first_solved_at",
    )
    list_filter = (
        "task__subject",
        "first_solved_at",
    )
    search_fields = (
        "user__email",
        "task__description",
    )
    autocomplete_fields = (
        "user",
        "task",
    )
    ordering = ("-first_solved_at",)


@admin.register(TaskStatistics)
class TaskStatisticsAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "subject",
        "order_KIM",
        "attempts_count",
        "correct_first_try",
        "correct_count",
        "last_attempt_at",
    )
    list_filter = (
        "subject",
        "last_attempt_at",
    )
    search_fields = (
        "user__email",
    )
    ordering = ("-last_attempt_at",)
    autocomplete_fields = (
        "user",
    )
