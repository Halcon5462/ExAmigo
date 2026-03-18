from rest_framework import serializers
from .models import Task, TaskCorrectAnswer, TaskSet, TaskSetItem
from statistic.models import TaskProgress


class TaskCorrectAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskCorrectAnswer
        fields = ["id", "answer_text"]


class TaskSerializer(serializers.ModelSerializer):
    already_solved = serializers.SerializerMethodField()
    author_name = serializers.CharField(source="author.name", read_only=True)
    author_email = serializers.EmailField(source="author.email", read_only=True)
    correct_answers = serializers.CharField(write_only=True)
    primary_score = serializers.IntegerField(read_only=True)
    subject_display = serializers.CharField(
        source="get_subject_display",
        read_only=True
    )

    class Meta:
        model = Task
        fields = '__all__'

    def create(self, validated_data):
        answer_text = validated_data.pop("correct_answers", "")
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['author'] = request.user

        task = Task.objects.create(**validated_data)

        if answer_text:
            TaskCorrectAnswer.objects.create(
                task=task,
                answer_text=answer_text
            )

        return task
    
    def get_already_solved(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return TaskProgress.objects.filter(user=user, task=obj).exists()
        return False

class TaskSetItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskSetItem
        fields = ['id', 'task', 'order']

class TaskSetSerializer(serializers.ModelSerializer):
    items = TaskSetItemSerializer(many=True, required=False)
    author_name = serializers.CharField(source='author.name', read_only=True)
    author_email = serializers.EmailField(source='author.email', read_only=True)

    class Meta:
        model = TaskSet
        fields = ['id', 'name', 'type', 'subject', 'average_difficulty', 'is_public', 'author', 'author_name', 'author_email', 'created_at', 'items']
        read_only_fields = ['author', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        # set author from context
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['author'] = request.user
        taskset = TaskSet.objects.create(**validated_data)
        for item in items_data:
            TaskSetItem.objects.create(task_set=taskset, **item)
        return taskset

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            # clear existing items and recreate
            instance.items.all().delete()
            for item in items_data:
                TaskSetItem.objects.create(task_set=instance, **item)
        return instance
