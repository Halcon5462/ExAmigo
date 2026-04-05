from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction as db_transaction
from django.db.models import F, Q, BooleanField, Exists, OuterRef, Value, IntegerField, Subquery
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Product, UserEquippedItem, UserProduct
from .serializers import ProductSerializer, ProductWriteSerializer, PurchaseSerializer
from .services import ProductService, equip_product

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Разрешение, которое позволяет только администраторам выполнять небезопасные методы.
    """
    def has_permission(self, request, view):
        """
        Проверяет, есть ли у пользователя разрешение на выполнение запроса.
        """
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet для продуктов.
    """
    queryset = Product.objects.select_related("author").all()
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        """
        Возвращает класс сериализатора в зависимости от действия.
        """
        if self.action in {"create", "update", "partial_update"}:
            return ProductWriteSerializer
        if self.action == "purchase":
            return PurchaseSerializer
        return ProductSerializer

    def get_queryset(self):
        """
        Возвращает queryset продуктов.
        """
        qs = super().get_queryset()

        user = self.request.user
        if user.is_authenticated:
            user_product_id_sq = UserProduct.objects.filter(
                user=user,
                product=OuterRef("pk"),
            ).values("id")[:1]
            qs = qs.annotate(
                already_purchased=Exists(
                    UserProduct.objects.filter(
                        user=user,
                        product=OuterRef("pk"),
                    )
                ),
                user_product_id=Subquery(user_product_id_sq, output_field=IntegerField()),
            )
        else:
            qs = qs.annotate(
                already_purchased=Value(False, output_field=BooleanField()),
                user_product_id=Value(None, output_field=IntegerField()),
            )

        product_type = self.request.query_params.get("type")
        if product_type:
            qs = qs.filter(type=product_type)

        available = self.request.query_params.get("available")
        if available in {"1", "true", "True", "yes", "on"}:
            qs = qs.filter(
                Q(is_limited=False)
                | Q(is_limited=True, stock__isnull=False, sold_count__lt=F("stock"))
            )

        return qs.order_by("-created_at")

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def purchase(self, request, pk=None):
        """
        Покупает продукт.
        """
        product = self.get_object()
        serializer = PurchaseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        quantity = serializer.validated_data.get("quantity", 1)

        try:
            result = ProductService.purchase_product(
                user=request.user,
                product=product,
                quantity=quantity,
            )
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except DjangoValidationError as e:
            detail = e.message_dict if hasattr(e, "message_dict") else {"error": e.messages}
            return Response(detail, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "product_id": result["product_id"],
                "quantity": result["quantity"],
                "sold_count": result["sold_count"],
                "total_cost": result["total_cost"],
                "balance": result["new_balance"],
            },
            status=status.HTTP_200_OK,
        )


class EquipProductView(APIView):
    """
    Представление для экипировки продукта.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Обрабатывает POST-запрос для экипировки продукта.
        """
        user_product_id = request.data.get("user_product_id")
        if not user_product_id:
            return Response({"error": "user_product_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = equip_product(request.user, int(user_product_id))
        except UserProduct.DoesNotExist:
            return Response({"error": "UserProduct not found"}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"status": "equipped", "type": product.type}, status=status.HTTP_200_OK)


class EquippedItemsView(APIView):
    """
    Представление для получения экипированных предметов.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Обрабатывает GET-запрос для получения экипированных предметов.
        """
        items = (
            UserEquippedItem.objects.filter(profile=request.user)
            .select_related("product", "product__frame", "product__background")
        )

        data = {"frame": None, "background": None}
        for item in items:
            if item.slot in data:
                user_product_id = (
                    UserProduct.objects.filter(user=request.user, product=item.product)
                    .values_list("id", flat=True)
                    .first()
                )
                item.product.already_purchased = True
                item.product.user_product_id = user_product_id
                data[item.slot] = ProductSerializer(item.product).data

        return Response(data, status=status.HTTP_200_OK)
