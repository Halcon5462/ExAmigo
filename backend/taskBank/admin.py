from django.contrib import admin
from .models import Task, TaskCorrectAnswer


class TaskCorrectAnswerInline(admin.TabularInline):
    model = TaskCorrectAnswer
    extra = 1 

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    inlines = [TaskCorrectAnswerInline]
    
    list_display = ('id', 'subject', 'order_KIM', 'difficulty', 'author', 'created_at')

    list_filter = ('subject', 'difficulty', 'author')

    search_fields = ('subject', 'description', 'author__email')

    list_editable = ('difficulty',)

    readonly_fields = ('created_at',)

@admin.register(TaskCorrectAnswer)
class TaskCorrectAnswerAdmin(admin.ModelAdmin):

    list_display = ('id', 'task', 'answer_text')
    
    list_filter = ('task__subject', 'task')
    
    search_fields = ('answer_text',)
    
    autocomplete_fields = ('task',)