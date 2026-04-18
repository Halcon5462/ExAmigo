import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import TaskHint
from taskBank.models import Task

from django.db import IntegrityError

DEEPSEEK_API_KEY = "sk-06332664920b4d1f957d9cb75d2a2169"

class HintView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        task_id = request.data.get("task_id")
        level = request.data.get("level")

        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response({"error": "Задание не найдено"}, status=404)

        #Проверка кеша
        cached_hint = task.hints.filter(level=level).first()
        if cached_hint:
            return Response({
                "hint": cached_hint.hint,
                "cached": True
            })

        #Списание валюты
        # profile = request.user.wallet
        # if profile.balance < 1:
        #     return Response({"error": "Не достаточно монет"}, status=403)

        # profile.balance -= 1
        # profile.save()

        #Генерация
        prompt = f"""
        Ты помогаешь готовиться к ЕГЭ.

        Правила:
        - НЕ давай ответ
        - Дай направление решения
        - Коротко (1-2 предложения)

        Задание:
        {task.description}
        """

        response = requests.post(
            "https://api.deepseek.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": "Ты помощник для ЕГЭ"},
                    {"role": "user", "content": prompt},
                ],
            },
        )

        data = response.json()
        hint_text = data["choices"][0]["message"]["content"]

        # Сохраняем
        try:
            TaskHint.objects.create(
                task=task,
                level=level,
                hint=hint_text
            )
        except IntegrityError:
            pass  # уже кто-то сохранил

        return Response({
            "hint": hint_text,
            "cached": False
        })