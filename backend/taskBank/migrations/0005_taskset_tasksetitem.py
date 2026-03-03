# Generated migration for TaskSet and TaskSetItem models

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('taskBank', '0004_task_image'),
    ]

    operations = [
        migrations.CreateModel(
            name='TaskSet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, verbose_name='Название комплекта')),
                ('subject', models.CharField(blank=True, max_length=100, null=True, verbose_name='Предмет')),
                ('average_difficulty', models.FloatField(blank=True, null=True, verbose_name='Средняя сложность')),
                ('is_public', models.BooleanField(default=False, verbose_name='Публичный')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')),
                ('author', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tasksets', to=settings.AUTH_USER_MODEL, verbose_name='Автор')),
            ],
            options={
                'verbose_name': 'Комплект заданий',
                'verbose_name_plural': 'Комплекты заданий',
            },
        ),
        migrations.CreateModel(
            name='TaskSetItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.PositiveIntegerField(verbose_name='Порядок задания в комплекте')),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='taskset_items', to='taskBank.task')),
                ('task_set', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='taskBank.taskset')),
            ],
            options={
                'verbose_name': 'Элемент комплекта',
                'verbose_name_plural': 'Элементы комплекта',
                'ordering': ['order'],
            },
        ),
        migrations.AddConstraint(
            model_name='tasksetitem',
            constraint=models.UniqueConstraint(fields=('task_set', 'task'), name='unique_taskset_task'),
        ),
    ]
