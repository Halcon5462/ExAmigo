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


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
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
            "Meta",
            {
                "fields": ("created_at",),
            },
        ),
    )

    def get_inlines(self, request, obj):
        if not obj:
            return []
        if obj.type == ProductType.FRAME:
            return [FrameInline]
        if obj.type == ProductType.BACKGROUND:
            return [BackgroundInline]
        return []

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

