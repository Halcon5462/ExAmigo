from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction as db_transaction
from django.db.models import F, Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Product
from .serializers import ProductSerializer, ProductWriteSerializer, PurchaseSerializer
from .services import ProductService

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("author").all()
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return ProductWriteSerializer
        if self.action == "purchase":
            return PurchaseSerializer
        return ProductSerializer

    def get_queryset(self):
        qs = super().get_queryset()

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

