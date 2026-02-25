from django.contrib import admin
from .models import Task, TaskCorrectAnswer


class TaskCorrectAnswerInline(admin.TabularInline):
    model = TaskCorrectAnswer
    extra = 1


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    inlines = [TaskCorrectAnswerInline]