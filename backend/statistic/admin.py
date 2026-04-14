from django.contrib import admin

from .models import TaskAttempt, TaskProgress


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
