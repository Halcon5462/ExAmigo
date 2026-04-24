from django.contrib import admin
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.test import RequestFactory
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from .admin import ProductAdmin, ProductAdminForm
from .models import Background, Frame, Product, ProductType, UserEquippedItem, UserProduct
from .serializers import ProductWriteSerializer
from .services import ProductService, equip_product


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

    def test_is_available_returns_false_for_non_positive_quantity(self):
        product = Product.objects.create(
            type=ProductType.FRAME,
            name="F1",
            description="d",
            cost=10,
            is_limited=False,
        )

        self.assertFalse(product.is_available(0))

    def test_product_write_serializer_requires_stock_for_limited_product(self):
        serializer = ProductWriteSerializer(
            data={
                "type": ProductType.FRAME,
                "name": "F1",
                "description": "d",
                "cost": 10,
                "is_limited": True,
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("stock", serializer.errors)


class ProductAdminTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.product_admin = ProductAdmin(Product, admin.site)

    def test_product_admin_form_rejects_background_file_for_frame(self):
        form = ProductAdminForm(
            data={
                "type": ProductType.FRAME,
                "name": "F1",
                "description": "d",
                "cost": 10,
                "is_limited": False,
                "sold_count": 0,
                "author": "",
            },
            files={
                "image_background": SimpleUploadedFile(
                    "background.gif",
                    (
                        b"GIF87a\x01\x00\x01\x00\x80\x00\x00"
                        b"\x00\x00\x00\xff\xff\xff!\xf9\x04\x01"
                        b"\x00\x00\x00\x00,\x00\x00\x00\x00\x01"
                        b"\x00\x01\x00\x00\x02\x02D\x01\x00;"
                    ),
                    content_type="image/gif",
                )
            },
        )
        form.fields["author"].required = False

        self.assertFalse(form.is_valid())
        self.assertIn("image_background", form.errors)

    def test_product_admin_save_related_creates_frame_from_product_form(self):
        product = Product.objects.create(
            type=ProductType.FRAME,
            name="Frame product",
            description="d",
            cost=10,
            is_limited=False,
        )
        request = self.factory.post("/admin/products/product/add/")
        form = ProductAdminForm(
            data={
                "type": ProductType.FRAME,
                "name": "Frame product",
                "description": "d",
                "cost": 10,
                "is_limited": False,
                "sold_count": 0,
                "author": "",
            },
            files={
                "icon_frame": SimpleUploadedFile(
                    "frame.gif",
                    (
                        b"GIF87a\x01\x00\x01\x00\x80\x00\x00"
                        b"\x00\x00\x00\xff\xff\xff!\xf9\x04\x01"
                        b"\x00\x00\x00\x00,\x00\x00\x00\x00\x01"
                        b"\x00\x01\x00\x00\x02\x02D\x01\x00;"
                    ),
                    content_type="image/gif",
                )
            },
            instance=product,
        )
        form.fields["author"].required = False

        self.assertTrue(form.is_valid(), form.errors)

        product = form.save(commit=False)
        self.product_admin.save_model(request, product, form, change=True)
        self.product_admin.save_related(request, form, [], change=True)

        product.refresh_from_db()
        self.assertTrue(Frame.objects.filter(product=product).exists())
        self.assertEqual(Background.objects.filter(product=product).count(), 0)
        self.assertTrue(product.frame.icon_frame.name)


class ProductServiceTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(email="u@example.com", name="U", password="pass")
        self.user.wallet.balance = 100
        self.user.wallet.save(update_fields=["balance", "updated_at"])
        self.product = Product.objects.create(
            type=ProductType.FRAME,
            name="F1",
            description="d",
            cost=10,
            is_limited=False,
        )

    def test_purchase_product_creates_user_product_and_updates_balance(self):
        result = ProductService.purchase_product(self.user, self.product, quantity=1)

        self.user.wallet.refresh_from_db()
        self.product.refresh_from_db()
        self.assertTrue(UserProduct.objects.filter(user=self.user, product=self.product).exists())
        self.assertEqual(self.user.wallet.balance, 90)
        self.assertEqual(result["sold_count"], 1)

    def test_purchase_product_rejects_duplicate_purchase(self):
        UserProduct.objects.create(user=self.user, product=self.product)

        with self.assertRaises(ValueError):
            ProductService.purchase_product(self.user, self.product)

    def test_equip_product_updates_existing_slot(self):
        first_product = self.product
        second_product = Product.objects.create(
            type=ProductType.FRAME,
            name="F2",
            description="d",
            cost=15,
            is_limited=False,
        )
        first_user_product = UserProduct.objects.create(user=self.user, product=first_product)
        second_user_product = UserProduct.objects.create(user=self.user, product=second_product)
        equip_product(self.user, first_user_product.id)

        equipped_product = equip_product(self.user, second_user_product.id)

        slot = UserEquippedItem.objects.get(profile=self.user, slot=ProductType.FRAME)
        self.assertEqual(equipped_product.id, second_product.id)
        self.assertEqual(slot.product_id, second_product.id)


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

    def test_purchase_endpoint_rejects_duplicate_purchase(self):
        product = Product.objects.create(
            type=ProductType.FRAME,
            name="F1",
            description="d",
            cost=10,
            is_limited=False,
        )
        UserProduct.objects.create(user=self.user, product=product)

        self.client.force_authenticate(user=self.user)
        response = self.client.post(f"/api/products/products/{product.id}/purchase/", {"quantity": 1}, format="json")

        self.assertEqual(response.status_code, 400)

    def test_product_list_marks_already_purchased_for_authenticated_user(self):
        product = Product.objects.create(
            type=ProductType.FRAME,
            name="F1",
            description="d",
            cost=10,
            is_limited=False,
        )
        user_product = UserProduct.objects.create(user=self.user, product=product)

        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/products/products/")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data[0]["already_purchased"])
        self.assertEqual(response.data[0]["user_product_id"], user_product.id)

    def test_equip_endpoint_equips_owned_product(self):
        product = Product.objects.create(
            type=ProductType.BACKGROUND,
            name="B1",
            description="d",
            cost=10,
            is_limited=False,
        )
        user_product = UserProduct.objects.create(user=self.user, product=product)

        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            "/api/products/equip/",
            {"user_product_id": user_product.id},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["type"], ProductType.BACKGROUND)

    def test_equipped_items_returns_current_slots(self):
        frame = Product.objects.create(
            type=ProductType.FRAME,
            name="F1",
            description="d",
            cost=10,
            is_limited=False,
        )
        user_product = UserProduct.objects.create(user=self.user, product=frame)
        equip_product(self.user, user_product.id)

        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/products/equipped/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["frame"]["id"], frame.id)
        self.assertIsNone(response.data["background"])
