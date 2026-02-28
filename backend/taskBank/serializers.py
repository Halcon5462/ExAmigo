from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.name", read_only=True)
    author_email = serializers.EmailField(source="author.email", read_only=True)

    class Meta:
        model = Task
        fields = '__all__'
        extra_kwargs = {"author": {"read_only": True}}
