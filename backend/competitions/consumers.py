import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Match

class MatchConsumer(AsyncWebsocketConsumer):
    """
    Консьюмер для матча.
    """

    async def connect(self):
        """
        Подключается к WebSocket.
        """
        self.match_id = self.scope["url_route"]["kwargs"]["match_id"]
        self.room_group_name = f"match_{self.match_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        await self.send(text_data=json.dumps({
            "type": "info", 
            "message": "Connected to WebSocket"
        }))

    async def disconnect(self, close_code):
        """
        Отключается от WebSocket.
        """
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """
        Получает данные из WebSocket.
        """
        data = json.loads(text_data)
        action = data.get("action")

        user = self.scope.get("user")
        if user is None or not user.is_authenticated:
            await self.send(text_data=json.dumps({
                "type": "error",
                "message": "User not authenticated"
            }))
            return

        if action == "join":
            match = await Match.objects.aget(id=self.match_id)
            if match.opponent is None:
                match.opponent = user
                match.status = "started"
                await match.asave()
                tasks = await self.get_tasks(match)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "match_start",
                        "tasks": tasks,
                    }
                )

        elif action == "answer":
            task_id = data.get("task_id")
            answer = data.get("answer")

            is_correct = await self.check_answer(task_id, answer)

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "player_progress",
                    "user_id": user.id,
                    "task_id": task_id,
                    "correct": is_correct
                }
            )

    async def match_start(self, event):
        """
        Отправляет сообщение о начале матча.
        """
        await self.send(text_data=json.dumps({
            "type": "match_start",
            "tasks": event["tasks"]
        }))

    async def player_progress(self, event):
        """
        Отправляет прогресс пользователя
        """
        await self.send(text_data=json.dumps({
            "type": "progress",
            "user_id": event["user_id"],
            "task_id": event["task_id"],
            "correct": event["correct"]
        }))

    # MOCK TASKS (ПОКА ЗАГЛУШКА)
    @database_sync_to_async
    def get_tasks(self, match):
        return [
            {"id": 1, "question": "2+2", "answer": "4"},
            {"id": 2, "question": "3+3", "answer": "6"},
        ]

    # CHECK ANSWER (ЗАГЛУШКА)
    @database_sync_to_async
    def check_answer(self, task_id, answer):
        correct_answers = {
            1: "4",
            2: "6"
        }
        return correct_answers.get(task_id) == answer
