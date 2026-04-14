from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from account.models import UserAccount
from shop.choices import TransactionReason
from shop.models import UserWallet, WalletTransaction
from shop.services import WalletService


class WalletServiceTests(TestCase):
    def setUp(self):
        self.user = UserAccount.objects.create_user(
            email="user@example.com",
            name="User",
            password="secret123",
        )

    def test_wallet_is_created_with_user(self):
        self.assertTrue(UserWallet.objects.filter(user=self.user).exists())
        self.assertEqual(self.user.wallet.balance, 0)

    def test_change_balance_updates_wallet_and_creates_transaction(self):
        result = WalletService.change_balance(
            user=self.user,
            amount=25,
            reason=TransactionReason.BONUS,
            description="Награда",
        )

        self.user.wallet.refresh_from_db()
        transaction = WalletTransaction.objects.get(wallet=self.user.wallet)
        self.assertEqual(result["new_balance"], 25)
        self.assertEqual(self.user.wallet.balance, 25)
        self.assertEqual(transaction.reason, TransactionReason.BONUS)

    def test_change_balance_raises_when_funds_are_not_enough(self):
        with self.assertRaises(ValueError):
            WalletService.change_balance(
                user=self.user,
                amount=-10,
                reason=TransactionReason.PURCHASE,
            )

    def test_add_task_reward_rejects_unknown_difficulty(self):
        with self.assertRaises(ValueError):
            WalletService.add_task_reward(self.user, task_difficulty="legendary")

    def test_get_transaction_history_returns_recent_transactions(self):
        WalletService.change_balance(self.user, 10, TransactionReason.BONUS)
        WalletService.change_balance(self.user, 15, TransactionReason.ACHIEVEMENT)

        transactions = list(WalletService.get_transaction_history(self.user))

        self.assertEqual(len(transactions), 2)


class WalletApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = UserAccount.objects.create_user(
            email="user@example.com",
            name="User",
            password="secret123",
        )
        self.client.force_authenticate(user=self.user)

    def test_my_wallet_returns_current_user_wallet(self):
        response = self.client.get("/api/shop/wallets/my_wallet/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["balance"], 0)
        self.assertEqual(response.data["username"], self.user.name)

    def test_balance_endpoint_returns_current_balance(self):
        self.user.wallet.balance = 42
        self.user.wallet.save(update_fields=["balance", "updated_at"])

        response = self.client.get("/api/shop/wallets/balance/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["balance"], 42)

    def test_add_task_reward_endpoint_requires_difficulty(self):
        response = self.client.post("/api/shop/wallets/add_task_reward/", {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_task_reward_endpoint_creates_transaction(self):
        response = self.client.post(
            "/api/shop/wallets/add_task_reward/",
            {"difficulty": "medium", "task_title": "Задача"},
            format="json",
        )

        self.user.wallet.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["amount"], 25)
        self.assertEqual(self.user.wallet.balance, 25)
