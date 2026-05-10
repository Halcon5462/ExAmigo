import asyncio

from channels.testing import WebsocketCommunicator
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken
from django.test import TestCase, TransactionTestCase

from account.models import UserAccount
from backend.asgi import application
from competitions.models import Match


class CompetitionApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = UserAccount.objects.create_user(
            email="host@example.com",
            name="Host",
            password="secret123",
        )

    def test_create_match_requires_authentication(self):
        response = self.client.post("/api/match/create/")

        self.assertEqual(response.status_code, 401)

    def test_create_match_creates_waiting_match(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post("/api/match/create/")

        match = Match.objects.get(id=response.data["match_id"])
        self.assertEqual(response.status_code, 200)
        self.assertEqual(match.host_id, self.user.id)
        self.assertEqual(match.status, "waiting")


class CompetitionConsumerTests(TransactionTestCase):
    def setUp(self):
        self.host = UserAccount.objects.create_user(
            email="host@example.com",
            name="Host",
            password="secret123",
        )
        self.opponent = UserAccount.objects.create_user(
            email="opponent@example.com",
            name="Opponent",
            password="secret123",
        )
        self.match = Match.objects.create(host=self.host)

    def test_join_action_requires_authenticated_user(self):
        async def scenario():
            communicator = WebsocketCommunicator(application, f"/ws/match/{self.match.id}/")
            connected, _ = await communicator.connect()
            self.assertTrue(connected)
            await communicator.receive_json_from()
            await communicator.send_json_to({"action": "join"})
            response = await communicator.receive_json_from()
            await communicator.disconnect()
            return response

        response = asyncio.run(scenario())

        self.assertEqual(response["type"], "error")

    def test_join_action_sets_opponent_and_starts_match(self):
        token = str(AccessToken.for_user(self.opponent))

        async def scenario():
            communicator = WebsocketCommunicator(
                application,
                f"/ws/match/{self.match.id}/?token={token}",
            )
            connected, _ = await communicator.connect()
            self.assertTrue(connected)
            await communicator.receive_json_from()
            await communicator.send_json_to({"action": "join"})
            response = await communicator.receive_json_from()
            await communicator.disconnect()
            return response

        response = asyncio.run(scenario())

        self.match.refresh_from_db()
        self.assertEqual(response["type"], "match_start")
        self.assertEqual(self.match.opponent_id, self.opponent.id)
        self.assertEqual(self.match.status, "started")
