import requests
from django.conf import settings

DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions"
DEEPSEEK_API_KEY = 'sk-06332664920b4d1f957d9cb75d2a2169'


def generate_hint(prompt):
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
        timeout=10,
    )

    data = response.json()

    return data["choices"][0]["message"]["content"]