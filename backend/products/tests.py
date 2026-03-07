from django.core.exceptions import ValidationError
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from .models import Product, ProductType


class ProductBehaviorTests(TestCase):
    def test_creating_frame_product_creates_frame(self):
        p = Product.objects.create(
            type=ProductType.FRAME,
            name="F1",
            description="d",
            cost=10,
            is_limited=False,
        )
        self.assertTrue(hasattr(p, "frame"))
        self.assertEqual(p.frame.product_id, p.id)
        self.assertFalse(hasattr(p, "background"))

    def test_creating_background_product_creates_background(self):
        p = Product.objects.create(
            type=ProductType.BACKGROUND,
            name="B1",
            description="d",
            cost=10,
            is_limited=False,
        )
        self.assertTrue(hasattr(p, "background"))
        self.assertEqual(p.background.product_id, p.id)
        self.assertFalse(hasattr(p, "frame"))

    def test_purchase_increments_sold_count_unlimited(self):
        p = Product.objects.create(
            type=ProductType.FRAME,
            name="F1",
            description="d",
            cost=10,
            is_limited=False,
        )
        self.assertEqual(p.sold_count, 0)
        p.purchase()
        self.assertEqual(p.sold_count, 1)
        p.purchase(quantity=2)
        self.assertEqual(p.sold_count, 3)

    def test_purchase_limited_respects_stock(self):
        p = Product.objects.create(
            type=ProductType.BACKGROUND,
            name="B1",
            description="d",
            cost=10,
            is_limited=True,
            stock=2,
        )
        p.purchase(quantity=2)
        self.assertEqual(p.sold_count, 2)

        with self.assertRaises(ValidationError):
            p.purchase(quantity=1)

        p.refresh_from_db()
        self.assertEqual(p.sold_count, 2)


class ProductApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        User = get_user_model()
        self.user = User.objects.create_user(email="u@example.com", name="U", password="pass")

    def test_purchase_endpoint_charges_wallet_and_increments_sold_count(self):
        wallet = self.user.wallet
        wallet.balance = 100
        wallet.save(update_fields=["balance", "updated_at"])

        p = Product.objects.create(
            type=ProductType.FRAME,
            name="F1",
            description="d",
            cost=10,
            is_limited=False,
        )

        self.client.force_authenticate(user=self.user)
        resp = self.client.post(f"/api/products/products/{p.id}/purchase/", {"quantity": 3}, format="json")
        self.assertEqual(resp.status_code, 200, resp.data)

        p.refresh_from_db()
        wallet.refresh_from_db()
        self.assertEqual(p.sold_count, 3)
        self.assertEqual(wallet.balance, 70)
