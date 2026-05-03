from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import UserWallet
from .serializers import (
    UserWalletSerializer,
    WalletTransactionSerializer,
    BalanceResponseSerializer,
    TransactionResponseSerializer
)
from .services import WalletService


class WalletViewSet(viewsets.ReadOnlyModelViewSet):  # pylint: disable=too-many-ancestors
    """
    ViewSet для просмотра кошелька и транзакций пользователя.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserWalletSerializer

    def get_queryset(self):
        """Пользователи видят только свои кошельки"""
        return UserWallet.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'transactions':
            return WalletTransactionSerializer
        return super().get_serializer_class()

    @action(detail=False, methods=['get'])
    def my_wallet(self, request):
        """Получить информацию о своем кошельке"""
        wallet, _ = UserWallet.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(wallet)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def balance(self, request):
        """Получить текущий баланс"""
        balance = WalletService.get_balance(request.user)
        serializer = BalanceResponseSerializer(data={'balance': balance})
        serializer.is_valid()
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def transactions(self, request):
        """Получить историю транзакций"""
        transactions = WalletService.get_transaction_history(request.user)
        page = self.paginate_queryset(transactions)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_task_reward(self, request):
        """
        Начислить награду за задачу.
        (Может быть доступно только для определенных ролей)
        """
        difficulty = request.data.get('difficulty')
        task_title = request.data.get('task_title', '')

        if not difficulty:
            return Response(
                {'error': 'Не указана сложность задачи'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = WalletService.add_task_reward(
                user=request.user,
                task_difficulty=difficulty,
                task_title=task_title
            )
            serializer = TransactionResponseSerializer(data=result)
            serializer.is_valid()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
