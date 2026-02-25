from rest_framework import serializers
from .models import Task, TaskCorrectAnswer


class TaskCorrectAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskCorrectAnswer
        fields = ["id", "answer_text"]


class TaskSerializer(serializers.ModelSerializer):
    correct_answers = TaskCorrectAnswerSerializer(many=True)

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