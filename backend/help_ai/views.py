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
from .services import generate_hint
from .constants import HINT_PRICES


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

        price = HINT_PRICES.get(level, 2)
        try:
            WalletService.change_balance(
                user=request.user,
                amount=-price,
                reason=TransactionReason.PURCHASE,
                description=f"Подсказка lvl {level} для задачи {task.id}"
            )
        except ValueError:
            return Response(
                {"error": "Недостаточно средств"},
                status=403
            )

        prompt = build_hint_prompt(task, level)

        try:
            hint_text = generate_hint(prompt)
        except requests.exceptions.RequestException:
            WalletService.change_balance(
                user=request.user,
                amount=price,
                reason=TransactionReason.ADMIN_ADJUSTMENT,
                description="Возврат за ошибку генерации подсказки"
            )
            return Response(
                {"error": "Ошибка генерации подсказки"},
                status=500
            )

        # сохранение
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
            "cached": False,
            "price": price
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
