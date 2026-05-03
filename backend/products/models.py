from django.db import models, transaction
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models import F


class ProductType(models.TextChoices):
    """
    Типы продуктов.
    """
    FRAME = "frame", "Frame"
    BACKGROUND = "background", "Background"


class Product(models.Model):
    """
    Модель продукта.
    """
    type = models.CharField(
        max_length=20,
        choices=ProductType.choices,
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

    def __str__(self) -> str:
        """
        Возвращает строку с типом и названием продукта.
        """
        return f"{self.get_type_display()}: {self.name}"

    def clean(self):
        """
        Проверяет, что у лимитированного товара указан stock.
        """
        if self.is_limited:
            if self.stock is None:
                raise ValidationError({
                    "stock": "Для лимитированного товара нужно указать stock."
                })
            if self.stock <= 0:
                raise ValidationError({
                    "stock": "stock должен быть > 0 для лимитированного товара."
                })

    @property
    def remaining(self) -> int | None:
        """
        Возвращает оставшееся количество товара.
        """
        if not self.is_limited:
            return None
        return max((self.stock or 0) - self.sold_count, 0)

    def is_available(self, quantity: int = 1) -> bool:
        """
        Проверяет, доступен ли товар для покупки.
        """
        if quantity <= 0:
            return False
        if not self.is_limited:
            return True
        return (self.sold_count + quantity) <= (self.stock or 0)

    def purchase(self, quantity: int = 1, *, using: str | None = None) -> int:
        """
        Совершает покупку товара.
        """
        if quantity <= 0:
            raise ValidationError({"quantity": "quantity должен быть > 0."})

        db_alias = using or self._state.db or "default"

        with transaction.atomic(using=db_alias):
            qs = type(self).objects.using(db_alias).filter(pk=self.pk)

            if self.is_limited:
                updated = qs.filter(
                    is_limited=True,
                    stock__isnull=False,
                    stock__gte=F("sold_count") + quantity,
                ).update(sold_count=F("sold_count") + quantity)
            else:
                updated = qs.update(sold_count=F("sold_count") + quantity)

            if updated != 1:
                raise ValidationError("Товар недоступен (нет остатка).")

            self.refresh_from_db(using=db_alias, fields=["sold_count", "stock", "is_limited"])

        return self.sold_count

    def _ensure_related(self):
        """
        Создает или удаляет связанные объекты Frame или Background.
        """
        if self.type == ProductType.FRAME:
            Frame.objects.get_or_create(product=self)
            Background.objects.filter(product=self).delete()
        elif self.type == ProductType.BACKGROUND:
            Background.objects.get_or_create(product=self)
            Frame.objects.filter(product=self).delete()

    def save(self, *args, **kwargs):
        """
        Сохраняет продукт и связанные объекты.
        """
        old_type = None
        if self.pk:
            old_type = type(self).objects.filter(pk=self.pk).values_list("type", flat=True).first()

        super().save(*args, **kwargs)

        if old_type != self.type:
            self._ensure_related()


class Frame(models.Model):
    """
    Модель рамки.
    """
    icon_frame = models.ImageField(upload_to="frames/icons/", null=True, blank=True)
    product = models.OneToOneField(
        Product,
        on_delete=models.CASCADE,
        related_name="frame",
    )


class Background(models.Model):
    """
    Модель фона.
    """
    image_background = models.ImageField(upload_to="backgrounds/images/", null=True, blank=True)
    product = models.OneToOneField(
        Product,
        on_delete=models.CASCADE,
        related_name="background",
    )


class UserProduct(models.Model):
    """
    Факт покупки: каждый пользователь может купить один и тот же товар
    только один раз (unique_together).

    Attributes:
        user: Связь с пользователем
        product: Продукт
        purchased_at: Время покупки
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name='Пользователь'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="owners",
        verbose_name="Товар",
    )
    purchased_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "product")
        ordering = ["-purchased_at"]

    def __str__(self) -> str:
        """
        Возвращает строку с пользователем и продуктом.
        """
        return f"{self.user} — {self.product}"


class UserEquippedItem(models.Model):
    """
    Модель для экипированных предметов.
    """
    profile = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='equipped_items',
        verbose_name='Профиль'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='equipped_by',
        verbose_name='Товар'
    )
    slot = models.CharField(
        max_length=20,
        choices=ProductType.choices,
        verbose_name='Тип товара'
    )
    equipped_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('profile', 'slot')
        ordering = ['-equipped_at']

    def __str__(self) -> str:
        """
        Возвращает строку с профилем, слотом и продуктом.
        """
        return f"{self.profile} -> {self.slot}: {self.product}"
