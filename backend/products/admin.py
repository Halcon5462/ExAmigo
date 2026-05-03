from django import forms
from django.contrib import admin

from .models import Background, Frame, Product, ProductType, UserEquippedItem, UserProduct


class FrameInline(admin.StackedInline):
    model = Frame
    extra = 0
    max_num = 1


class BackgroundInline(admin.StackedInline):
    model = Background
    extra = 0
    max_num = 1


class UserProductInline(admin.TabularInline):
    model = UserProduct
    extra = 0
    readonly_fields = ("product", "purchased_at")
    can_delete = False


class ProductAdminForm(forms.ModelForm):
    icon_frame = forms.ImageField(required=False, label="Изображение рамки")
    image_background = forms.ImageField(required=False, label="Изображение фона")

    class Meta:
        model = Product
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if not self.instance.pk:
            return

        frame = getattr(self.instance, "frame", None)
        background = getattr(self.instance, "background", None)

        if frame and frame.icon_frame:
            self.fields["icon_frame"].initial = frame.icon_frame

        if background and background.image_background:
            self.fields["image_background"].initial = background.image_background

    def clean(self):
        cleaned_data = super().clean()
        product_type = cleaned_data.get("type")
        icon_frame = cleaned_data.get("icon_frame")
        image_background = cleaned_data.get("image_background")

        if product_type == ProductType.FRAME and image_background:
            self.add_error("image_background", "Для рамки нельзя загружать фон.")

        if product_type == ProductType.BACKGROUND and icon_frame:
            self.add_error("icon_frame", "Для фона нельзя загружать рамку.")

        return cleaned_data


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm
    list_display = (
        "id",
        "type",
        "name",
        "cost",
        "is_limited",
        "stock",
        "sold_count",
        "remaining_display",
        "author",
        "created_at",
    )
    list_filter = ("type", "is_limited", "created_at")
    search_fields = ("name", "description", "author__email", "author__name")
    ordering = ("-created_at",)
    autocomplete_fields = ("author",)
    readonly_fields = ("sold_count", "created_at")

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "type",
                    "name",
                    "description",
                    "cost",
                    "author",
                )
            },
        ),
        (
            "Availability",
            {
                "fields": (
                    "is_limited",
                    "stock",
                    "sold_count",
                )
            },
        ),
        (
            "Файлы товара",
            {
                "fields": (
                    "icon_frame",
                    "image_background",
                ),
            },
        ),
        (
            "Meta",
            {
                "fields": ("created_at",),
            },
        ),
    )

    def get_inlines(self, request, obj):
        return []

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)

        product = form.instance

        if product.type == ProductType.FRAME:
            frame, _ = Frame.objects.get_or_create(product=product)
            if "icon_frame" in form.changed_data:
                frame.icon_frame = form.cleaned_data.get("icon_frame") or None
                frame.save(update_fields=("icon_frame",))
            Background.objects.filter(product=product).delete()

        if product.type == ProductType.BACKGROUND:
            background, _ = Background.objects.get_or_create(product=product)
            if "image_background" in form.changed_data:
                background.image_background = form.cleaned_data.get("image_background") or None
                background.save(update_fields=("image_background",))
            Frame.objects.filter(product=product).delete()

    @admin.display(description="Remaining")
    def remaining_display(self, obj: Product):
        return obj.remaining if obj.is_limited else "∞"


@admin.register(Frame)
class FrameAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "icon_frame")
    search_fields = ("product__name",)
    autocomplete_fields = ("product",)


@admin.register(Background)
class BackgroundAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "image_background")
    search_fields = ("product__name",)
    autocomplete_fields = ("product",)


@admin.register(UserProduct)
class UserProductAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "purchased_at")
    list_filter = ("purchased_at",)
    search_fields = ("user__email", "user__name", "product__name")
    autocomplete_fields = ("product",)
    readonly_fields = ("purchased_at",)


@admin.register(UserEquippedItem)
class UserEquippedItemAdmin(admin.ModelAdmin):
    list_display = ("profile", "slot", "product", "equipped_at")
    list_filter = ("slot", "equipped_at")
    search_fields = ("profile__email", "profile__name", "product__name")
    autocomplete_fields = ("profile", "product")
    readonly_fields = ("equipped_at",)
