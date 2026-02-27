from rest_framework import serializers
from .models import Task, TaskCorrectAnswer
from account.models import TaskProgress


class TaskCorrectAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskCorrectAnswer
        fields = ["id", "answer_text"]


class TaskSerializer(serializers.ModelSerializer):
    correct_answers = TaskCorrectAnswerSerializer(many=True)
    already_solved = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = '__all__'

    def create(self, validated_data):
        answers_data = validated_data.pop("correct_answers")
        task = Task.objects.create(**validated_data)

        for answer in answers_data:
            TaskCorrectAnswer.objects.create(
                task=task,
                **answer
            )

        return task
    
    def get_already_solved(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return TaskProgress.objects.filter(user=user, task=obj).exists()
        return False