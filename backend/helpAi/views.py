from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.db import IntegrityError

from taskBank.models import Task
from .models import TaskHint

from .prompts import build_hint_prompt
from .services import generate_hint

class HintView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        task_id = request.data.get("task_id")
        level = int(request.data.get("level", 1))

        if level not in [1, 2, 3]:
            return Response({"error": "Неверный уровень"}, status=400)

        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response({"error": "Задание не найдено"}, status=404)

        # КЕШ
        cached_hint = task.hints.filter(level=level).first()
        if cached_hint:
            return Response({
                "hint": cached_hint.hint,
                "cached": True
            })

        # (пока отключено)
        # profile = request.user.profile
        # ...

        #PROMPT
        prompt = build_hint_prompt(task, level)

        #AI
        hint_text = generate_hint(prompt)

        #сохранение
        try:
            TaskHint.objects.create(
                task=task,
                level=level,
                hint=hint_text
            )
        except IntegrityError:
            pass

        return Response({
            "hint": hint_text,
            "cached": False
        })