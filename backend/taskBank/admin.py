from django.contrib import admin
from .models import (
    Task,
    TaskCorrectAnswer,
    TaskSet,
    TaskSetItem
)


class TaskCorrectAnswerInline(admin.TabularInline):
    model = TaskCorrectAnswer
    extra = 1


class TaskSetItemInline(admin.TabularInline):
    model = TaskSetItem
    extra = 1
    autocomplete_fields = ["task"]


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("subject", "order_KIM", "difficulty", "author")
    list_filter = ("subject", "difficulty")
    search_fields = ("description",)
    inlines = [TaskCorrectAnswerInline]


@admin.register(TaskSet)
class TaskSetAdmin(admin.ModelAdmin):
    list_display = ("name", "subject", "is_public", "author")
    list_filter = ("subject", "is_public")
    search_fields = ("name",)
    inlines = [TaskSetItemInline]
