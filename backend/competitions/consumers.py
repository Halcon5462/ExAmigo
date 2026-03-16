import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Match

class MatchConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.match_id = self.scope["url_route"]["kwargs"]["match_id"]
        self.room_group_name = f"match_{self.match_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        await self.send(text_data=json.dumps({"type": "info", "message": "Connected to WebSocket"}))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")

        user = self.scope.get("user")
        if user is None or not user.is_authenticated:
            await self.send(text_data=json.dumps({"type": "error", "message": "User not authenticated"}))
            return

        if action == "join":
            match = await Match.objects.aget(id=self.match_id)
            if match.opponent is None:
                match.opponent = user
                match.status = "started"
                await match.asave()

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "match_start",
                        "message": "Match started!"
                    }
                )

    async def match_start(self, event):
        await self.send(text_data=json.dumps({
            "type": "match_start",
            "message": event["message"]
        }))