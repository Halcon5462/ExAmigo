from django.core.exceptions import ValidationError
from django.db import transaction as db_transaction

from shop.choices import TransactionReason
from .models import UserEquippedItem, UserProduct
from shop.services import WalletService

from .models import Product


class ProductService:
    """
    Сервис для работы с продуктами.
    """

    @classmethod
    def purchase_product(cls, user, product: Product, quantity: int = 1) -> dict:
        """
        Покупка товара пользователем.

        Raises:
            ValueError: Если товар уже куплен или недостаточно средств
            ValidationError: Если товар недоступен (нет остатка)
        """
        if UserProduct.objects.filter(user=user, product=product).exists():
            raise ValueError("Вы уже приобрели этот товар.")

        if not product.is_available(quantity):
            raise ValidationError("Товар недоступен для покупки.")

        total_cost = product.cost * quantity

        with db_transaction.atomic():
            result = WalletService.change_balance(
                user=user,
                amount=-total_cost,
                reason=TransactionReason.PURCHASE,
                description=f"Покупка: {product.name} x{quantity}",
            )

            user_product = UserProduct.objects.create(user=user, product=product)
            product.purchase(quantity=quantity)

        return {
            **result,
            'product_id': product.id,
            'quantity': quantity,
            'sold_count': product.sold_count,
            'total_cost': total_cost,
            'user_product_id': user_product.id,
            'purchased_at': user_product.purchased_at,
        }


def equip_product(user, user_product_id):
    """
    Экипирует продукт.
    """
    user_product = UserProduct.objects.get(user=user, id=user_product_id)
    product = user_product.product
    slot = product.type

    equipped, created = UserEquippedItem.objects.update_or_create(
        profile=user,
        slot=slot,
        defaults={"product": product},
    )
    equipped.save()
    return product
