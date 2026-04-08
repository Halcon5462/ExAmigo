import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Match
from taskBank.models import ExamSession


class MatchConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        """
        Подключение
        """
        self.match_id = self.scope["url_route"]["kwargs"]["match_id"]
        self.room_group_name = f"match_{self.match_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        """
        Отключение от матча
        """
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """
        Действие пользователя
        """
        data = json.loads(text_data)
        action = data.get("action")

        user = self.scope.get("user")
        if not user or not user.is_authenticated:
            await self.send_json({"type": "error", "message": "Unauthorized"})
            return

        handler = getattr(self, f"handle_{action}", None)
        if not handler:
            await self.send_json({"type": "error", "message": "Unknown action"})
            return

        await handler(user, data)

    async def send_json(self, data):
        await self.send(text_data=json.dumps(data))

    async def handle_join(self, user, data):
        """
        Подключение пользователя
        """
        match = await Match.objects.select_related(
            "host", "opponent", "task_set"
        ).aget(id=self.match_id)

        # если это хост — просто ждём
        if user.id == match.host.id:
            return

        # если уже есть opponent — не пускаем
        if match.opponent is not None:
            await self.send_json({
                "type": "error",
                "message": "Match already full"
            })
            return

        # подключается второй игрок
        match.opponent = user
        match.status = "started"
        await match.asave()

        # создаём экзамены
        exam_data = await self.create_exam_sessions(match)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "match_start",
                "exam_data": exam_data
            }
        )

    async def handle_answer(self, user, data):
        """
        Синхронизация ответов
        """
        task_id = data.get("task_id")
        correct = data.get("correct")

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "player_progress",
                "user_id": user.id,
                "task_id": task_id,
                "correct": correct
            }
        )

    async def match_start(self, event):
        """
        Старт матча
        """
        await self.send_json({
            "type": "match_start",
            "exam_data": event["exam_data"]
        })

    async def player_progress(self, event):
        """
        Прогресс пользователя
        """
        await self.send_json({
            "type": "progress",
            "user_id": event["user_id"],
            "task_id": event["task_id"],
            "correct": event["correct"]
        })

    @database_sync_to_async
    def create_exam_sessions(self, match):
        """
        Создаем сессию
        Используем уже готовый TaskSet 
        """

        taskset = match.task_set  # ВАЖНО: матч должен хранить task_set

        exam1 = ExamSession.objects.create(
            user=match.host,
            task_set=taskset,
            time_limit=3 * 60 * 60
        )

        exam2 = ExamSession.objects.create(
            user=match.opponent,
            task_set=taskset,
            time_limit=3 * 60 * 60
        )
        total_tasks = taskset.items.count()

        return {
            "taskset_id": taskset.id,
            "total_tasks": total_tasks,
            "players": {
                match.host.id: exam1.id,
                match.opponent.id: exam2.id,
            }
        }