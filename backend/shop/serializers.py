from rest_framework import serializers
from .models import UserWallet, WalletTransaction


class UserWalletSerializer(serializers.ModelSerializer):
    """Сериализатор для кошелька пользователя"""
    username = serializers.CharField(source='user.name', read_only=True)

    class Meta:
        model = UserWallet
        fields = ['id', 'username', 'balance', 'created_at', 'updated_at']
        read_only_fields = ['id', 'username', 'balance', 'created_at', 'updated_at']


class WalletTransactionSerializer(serializers.ModelSerializer):
    """Сериализатор для транзакций кошелька"""
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)

    class Meta:
        model = WalletTransaction
        fields = ['id', 'amount', 'reason', 'reason_display', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class BalanceResponseSerializer(serializers.Serializer):
    """Сериализатор для ответа с балансом"""
    balance = serializers.IntegerField()
    message = serializers.CharField(required=False)


class TransactionResponseSerializer(serializers.Serializer):
    """Сериализатор для ответа о транзакции"""
    transaction_id = serializers.IntegerField()
    new_balance = serializers.IntegerField()
    amount = serializers.IntegerField()
    reason = serializers.CharField()
    created_at = serializers.DateTimeField()