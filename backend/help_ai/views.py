from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import IntegrityError
import requests

from task_bank.models import Task
from shop.services import WalletService
from shop.choices import TransactionReason

from .models import TaskHint
from .prompts import build_hint_prompt, build_question_prompt
from .services import (
    get_task,
    get_cached_hint,
    charge_for_hint,
    refund_hint,
    save_hint,
    generate_hint_for_task,
    generate_hint,
)
from .constants import HINT_PRICES


class HintView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        task_id = request.data.get("task_id")
        level = int(request.data.get("level", 1))

        if level not in [1, 2, 3]:
            return Response({"error": "Неверный уровень"}, status=400)

        task = get_task(task_id)
        if not task:
            return Response({"error": "Задание не найдено"}, status=404)

        cached = get_cached_hint(task, level)
        if cached:
            return Response({"hint": cached.hint, "cached": True})

        try:
            price = charge_for_hint(request.user, task.id, level)
        except ValueError:
            return Response({"error": "Недостаточно средств"}, status=403)

        try:
            hint_text = generate_hint_for_task(task, level)
        except requests.exceptions.RequestException:
            refund_hint(request.user, price)
            return Response({"error": "Ошибка генерации подсказки"}, status=500)

        save_hint(task, level, hint_text)

        return Response({
            "hint": hint_text,
            "cached": False,
            "price": price,
        })


class AskQuestionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        task_id = request.data.get("task_id")
        question = request.data.get("question")

        if not question:
            return Response({"error": "Пустой вопрос"}, status=400)

        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response({"error": "Задание не найдено"}, status=404)

        price = 100
        try:
            WalletService.change_balance(
                user=request.user,
                amount=-price,
                reason=TransactionReason.PURCHASE,
                description=f"Ответ на вопрос по задаче {task.id}"
            )
        except ValueError:
            return Response(
                {"error": "Недостаточно средств"},
                status=403
            )

        prompt = build_question_prompt(task, question)

        try:
            answer = generate_hint(prompt)
        except requests.exceptions.RequestException:
            WalletService.change_balance(
                user=request.user,
                amount=price,
                reason=TransactionReason.ADMIN_ADJUSTMENT,
                description="Возврат за ошибку генерации ответа на вопрос"
            )
            return Response(
                {"error": "Ошибка генерации ответа на вопрос"},
                status=500
            )

        return Response({
            "answer": answer,
            "price": price
        })


class HintPricesView(APIView):
    def get(self, request):
        return Response(HINT_PRICES)
