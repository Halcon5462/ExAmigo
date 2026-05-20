import os
import requests
from django.db import IntegrityError
from rest_framework.response import Response

from task_bank.models import Task
from help_ai.models import TaskHint
from shop.services import WalletService
from shop.models import TransactionReason

from .constants import HINT_PRICES
from .prompts import build_hint_prompt

DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions"
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")


def generate_hint(prompt):
    try:
        response = requests.post(
            DEEPSEEK_URL,
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
            timeout=30,
        )
    except requests.exceptions.RequestException:
        return Response({"error": "AI временно недоступен, попробуйте позже"}, status=503)

    data = response.json()

    return data["choices"][0]["message"]["content"]


def get_task(task_id):
    try:
        return Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return None


def get_cached_hint(task, level):
    return task.hints.filter(level=level).first()


def charge_for_hint(user, task_id, level):
    price = HINT_PRICES.get(level, 2)

    WalletService.change_balance(
        user=user,
        amount=-price,
        reason=TransactionReason.PURCHASE,
        description=f"Подсказка lvl {level} для задачи {task_id}",
    )

    return price


def refund_hint(user, price):
    WalletService.change_balance(
        user=user,
        amount=price,
        reason=TransactionReason.ADMIN_ADJUSTMENT,
        description="Возврат за ошибку генерации подсказки",
    )


def save_hint(task, level, hint_text):
    try:
        TaskHint.objects.create(
            task=task,
            level=level,
            hint=hint_text,
        )
    except IntegrityError:
        pass


def generate_hint_for_task(task, level):
    prompt = build_hint_prompt(task, level)
    return generate_hint(prompt)
