from django.db import models
from django.conf import settings

PRODUCT_TYPES = (
    ("frame", "Frame"),
    ("background", "Background"),
)


class Product(models.Model):
    type = models.CharField(
        max_length=20,
        choices=PRODUCT_TYPES,
    )
    name = models.CharField(max_length=255)
    description = models.TextField()
    cost = models.PositiveIntegerField()
    is_limited = models.BooleanField(default=False)
    stock = models.PositiveIntegerField(
        null=True,
        blank=True,
    )
    sold_count = models.PositiveIntegerField(default=0)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def is_available(self):
        if not self.is_limited:
            return True
        return self.sold_count < (self.stock or 0)


class Frame(models.Model):
    icon_frame = models.ImageField(upload_to="frames/icons/")
    product = models.OneToOneField(
        Product,
        on_delete=models.CASCADE,
        related_name="frame",
    )


class Background(models.Model):
    image_background = models.ImageField(upload_to="backgrounds/images/")
    product = models.OneToOneField(
        Product,
        on_delete=models.CASCADE,
        related_name="background",
    )
