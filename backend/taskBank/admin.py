from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Task, TaskCorrectAnswer
from .models import TaskSet, TaskSetItem
from .models import ExamSession
from .ege_scoring import SubjectChoices

admin.site.site_header = "Панель управления Exam Service"
admin.site.site_title = "Администрирование Exam Service"
admin.site.index_title = "Добро пожаловать в систему управления"


class TaskCorrectAnswerInline(admin.TabularInline):
    model = TaskCorrectAnswer
    extra = 1
    verbose_name = "Правильный ответ"
    verbose_name_plural = "Правильные ответы"

    fields = ('answer_text',)


class DifficultyListFilter(admin.SimpleListFilter):
    title = 'Группа сложности'
    parameter_name = 'difficulty_group'

    def lookups(self, request, model_admin):
        return (
            ('easy', 'Лёгкие (1-2)'),
            ('medium', 'Средние (3)'),
            ('hard', 'Сложные (4-5)'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'easy':
            return queryset.filter(difficulty__in=[1, 2])
        if self.value() == 'medium':
            return queryset.filter(difficulty=3)
        if self.value() == 'hard':
            return queryset.filter(difficulty__in=[4, 5])
        return queryset


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    inlines = [TaskCorrectAnswerInline]


    list_display = (
        'id',
        'colored_subject',
        'order_KIM',
        'difficulty',  
        'colored_difficulty', 
        'author',
        'created_at',
        'has_image',
        'answers_count',
    )

    list_editable = ('difficulty',)  # Теперь difficulty есть в list_display

    list_filter = (
        'subject',
        DifficultyListFilter,
        'difficulty',
        'author',
        'created_at',
    )

    search_fields = (
        'subject',
        'description',
        'author__email',
        'author__name',
        'correct_answers__answer_text',
    )

    readonly_fields = ('created_at',  'preview_image')

    fieldsets = (
        ('Основная информация', {
            'fields': ('subject', 'order_KIM', 'type', 'difficulty'),
            'classes': ('wide',),
        }),
        ('Содержание', {
            'fields': ('description', 'formula', 'image', 'preview_image', 'file'),
            'classes': ('collapse',),
        }),
        ('Метаданные', {
            'fields': ('author', 'created_at'),
            'classes': ('collapse',),
        }),
    )

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.author = request.user
        super().save_model(request, obj, form, change)

    def colored_difficulty(self, obj):
        colors = {
            1: 'green',
            2: 'lightgreen',
            3: 'orange',
            4: 'red',
            5: 'darkred',
        }
        color = colors.get(obj.difficulty, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.difficulty
        )

    colored_difficulty.short_description = 'Сложность'
    colored_difficulty.admin_order_field = 'difficulty'

    def colored_subject(self, obj):
        colors = {
            SubjectChoices.MATH: "blue",
            SubjectChoices.RUSSIAN: "green",
            SubjectChoices.PHYSICS: "purple",
            SubjectChoices.INFORM: "orange",
        }

        color = colors.get(obj.subject, "black")

        return format_html(
            '<span style="color:{}; font-weight:bold;">{}</span>',
            color,
            obj.get_subject_display()
        )

    colored_subject.short_description = "Предмет"
    colored_subject.admin_order_field = 'subject'

    def has_image(self, obj):
        return obj.image is not None and bool(obj.image)

    has_image.boolean = True
    has_image.short_description = 'Изображение'

    def answers_count(self, obj):
        count = obj.correct_answers.count()
        return format_html(
            '<span style="color: {};">{}</span>',
            'green' if count > 0 else 'gray',
            count
        )

    answers_count.short_description = 'Ответов'
    answers_count.admin_order_field = 'correct_answers__count'

    def preview_image(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 100px; max-width: 200px;" />',
                obj.image.url
            )
        return "Нет изображения"

    preview_image.short_description = 'Превью'
    actions = ['make_easy', 'make_medium', 'make_hard', 'duplicate_tasks']

    def make_easy(self, request, queryset):
        updated = queryset.update(difficulty=1)
        self.message_user(request, f'{updated} задач(и) сделаны лёгкими')

    make_easy.short_description = "Сделать сложность = 1"

    def make_medium(self, request, queryset):
        updated = queryset.update(difficulty=3)
        self.message_user(request, f'{updated} задач(и) сделаны средними')

    make_medium.short_description = "Сделать сложность = 3"

    def make_hard(self, request, queryset):
        updated = queryset.update(difficulty=5)
        self.message_user(request, f'{updated} задач(и) сделаны сложными')

    make_hard.short_description = "Сделать сложность = 5"

    def duplicate_tasks(self, request, queryset):
        for task in queryset:
            task.pk = None
            task.save()
        self.message_user(request, f'{queryset.count()} задач(и) продублированы')

    duplicate_tasks.short_description = "Дублировать выбранные задачи"

    date_hierarchy = 'created_at'
    list_per_page = 25

@admin.register(TaskCorrectAnswer)
class TaskCorrectAnswerAdmin(admin.ModelAdmin):
    list_display = ('id', 'task_link', 'answer_text', 'task_subject')
    list_filter = ('task__subject', 'task')
    search_fields = ('answer_text', 'task__description')
    autocomplete_fields = ('task',)

    def task_link(self, obj):
        """Ссылка на задание в админке"""
        url = reverse('admin:taskBank_task_change', args=[obj.task.id])
        return format_html('<a href="{}">{}</a>', url, obj.task)

    task_link.short_description = 'Задание'
    task_link.admin_order_field = 'task'

    def task_subject(self, obj):
        """Предмет задания"""
        return obj.task.subject

    task_subject.short_description = 'Предмет'
    task_subject.admin_order_field = 'task__subject'


class TaskSetItemInline(admin.TabularInline):
    model = TaskSetItem
    extra = 1
    autocomplete_fields = ["task"]
    ordering = ("order",)

@admin.register(TaskSet)
class TaskSetAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "type",
        "subject",
        "average_difficulty",
        "author",
        "is_public",
        "created_at",
    )

    list_filter = (
        "type",
        "subject",
        "is_public",
        "created_at",
    )

    search_fields = (
        "name",
        "author__username",
    )

    inlines = [TaskSetItemInline]

    autocomplete_fields = ["author"]


@admin.register(ExamSession)
class ExamSessionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "task_set",
        "started_at",
        "finished_at",
        "time_limit",
        "is_finished",
        "score",
    )

    list_filter = (
        "is_finished",
        "started_at",
        "task_set__subject",
    )

    autocomplete_fields = (
        "user",
        "task_set",
    )

    ordering = ("-started_at",)

@admin.register(TaskSetItem)
class TaskSetItemAdmin(admin.ModelAdmin):
    list_display = (
        "task_set",
        "task",
        "order",
    )

    list_filter = (
        "task_set",
        "task__subject",
    )

    search_fields = (
        "task_set__name",
        "task__description",
    )

    ordering = ("task_set", "order")
