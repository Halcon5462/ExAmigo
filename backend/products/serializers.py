from rest_framework import serializers

from .models import Background, Frame, Product, ProductType


class FrameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Frame
        fields = ("id", "icon_frame")
        read_only_fields = fields


class BackgroundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Background
        fields = ("id", "image_background")
        read_only_fields = fields


class ProductSerializer(serializers.ModelSerializer):
    frame = FrameSerializer(read_only=True)
    background = BackgroundSerializer(read_only=True)
    remaining = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "type",
            "name",
            "description",
            "cost",
            "is_limited",
            "stock",
            "sold_count",
            "remaining",
            "author",
            "created_at",
            "frame",
            "background",
        )
        read_only_fields = (
            "id",
            "sold_count",
            "remaining",
            "created_at",
            "frame",
            "background",
        )


class ProductWriteSerializer(serializers.ModelSerializer):
    icon_frame = serializers.ImageField(required=False, allow_null=True, write_only=True)
    image_background = serializers.ImageField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "type",
            "name",
            "description",
            "cost",
            "is_limited",
            "stock",
            "author",
            "icon_frame",
            "image_background",
        )
        read_only_fields = ("id",)

    def validate(self, attrs):
        is_limited = attrs.get("is_limited", getattr(self.instance, "is_limited", False))
        stock = attrs.get("stock", getattr(self.instance, "stock", None))
        if is_limited and stock is None:
            raise serializers.ValidationError({"stock": "Для лимитированного товара нужно указать stock."})
        if is_limited and stock is not None and stock <= 0:
            raise serializers.ValidationError({"stock": "stock должен быть > 0 для лимитированного товара."})
        return attrs

    def _apply_related_images(self, product: Product, *, icon_frame, image_background):
        if icon_frame is not None:
            if product.type != ProductType.FRAME:
                raise serializers.ValidationError({"icon_frame": "icon_frame можно задавать только для type=frame."})
            product.frame.icon_frame = icon_frame
            product.frame.save(update_fields=["icon_frame"])

        if image_background is not None:
            if product.type != ProductType.BACKGROUND:
                raise serializers.ValidationError(
                    {"image_background": "image_background можно задавать только для type=background."}
                )
            product.background.image_background = image_background
            product.background.save(update_fields=["image_background"])

    def create(self, validated_data):
        icon_frame = validated_data.pop("icon_frame", None)
        image_background = validated_data.pop("image_background", None)
        product = super().create(validated_data)
        product.refresh_from_db()
        self._apply_related_images(product, icon_frame=icon_frame, image_background=image_background)
        return product

    def update(self, instance, validated_data):
        icon_frame = validated_data.pop("icon_frame", None)
        image_background = validated_data.pop("image_background", None)
        product = super().update(instance, validated_data)
        product.refresh_from_db()
        self._apply_related_images(product, icon_frame=icon_frame, image_background=image_background)
        return product


class PurchaseSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1, default=1, required=False)

