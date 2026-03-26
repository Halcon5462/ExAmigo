from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from statistic.models import TaskAttempt, TaskProgress

from .models import Avatar, UserAccount


@admin.register(Avatar)
class AvatarAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)


class UserAccountAdmin(UserAdmin):
    list_display = ('email', 'name', 'avatar_default', 'is_staff', 'is_active')
    search_fields = ('email', 'name')
    ordering = ('email',)

    fieldsets = (
        (None, {'fields': ('email', 'name', 'password', 'avatar', 'avatar_default')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'password1', 'password2', 'avatar', 'avatar_default', 'is_staff', 'is_active'),
        }),
    )


admin.site.register(UserAccount, UserAccountAdmin)


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
