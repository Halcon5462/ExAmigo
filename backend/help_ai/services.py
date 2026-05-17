import requests
import os
from rest_framework.response import Response

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
