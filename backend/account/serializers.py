from rest_framework import serializers

from .models import Avatar, UserAccount


class AvatarSerializer(serializers.ModelSerializer):
    """
    Сериализатор для модели Avatar.
    """
    image = serializers.SerializerMethodField()

    class Meta:
        model = Avatar
        fields = ['id', 'name', 'image']

    def get_image(self, obj):
        """
        Возвращает абсолютный URL изображения аватара.
        """
        request = self.context.get('request')
        if not obj.image:
            return None
        if request is None:
            return obj.image.url
        return request.build_absolute_uri(obj.image.url)


class UserSerializer(serializers.ModelSerializer):
    """
    Сериализатор для модели UserAccount.
    """
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = UserAccount
        fields = ['id', 'email', 'name', 'avatar', 'avatar_default', 'avatar_url']

    def get_avatar_url(self, obj):
        """
        Возвращает абсолютный URL аватара пользователя.
        """
        avatar_url = obj.get_avatar_url()
        request = self.context.get('request')

        if not avatar_url:
            return None
        if request is None:
            return avatar_url
        return request.build_absolute_uri(avatar_url)


class RegisterSerializer(serializers.Serializer):
    """
    Сериализатор для регистрации нового пользователя.
    """
    email = serializers.EmailField()
    name = serializers.CharField(max_length=255)
    password = serializers.CharField(write_only=True, min_length=6)

    def validate_email(self, value):
        """
        Проверяет, что email уникален.
        """
        if UserAccount.objects.filter(email=value).exists():
            raise serializers.ValidationError('Пользователь с таким email уже существует')
        return value

    def create(self, validated_data):
        """
        Создает нового пользователя.
        """
        user = UserAccount.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password']
        )
        return user

    def update(self, instance, validated_data):
        """
        Метод не поддерживается.
        """
        raise NotImplementedError("RegisterSerializer does not support update.")
