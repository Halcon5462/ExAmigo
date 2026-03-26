from rest_framework import serializers

from .models import Avatar, UserAccount


class AvatarSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Avatar
        fields = ['id', 'name', 'image']

    def get_image(self, obj):
        request = self.context.get('request')
        if not obj.image:
            return None
        if request is None:
            return obj.image.url
        return request.build_absolute_uri(obj.image.url)


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = UserAccount
        fields = ['id', 'email', 'name', 'avatar', 'avatar_default', 'avatar_url']

    def get_avatar_url(self, obj):
        avatar_url = obj.get_avatar_url()
        request = self.context.get('request')

        if not avatar_url:
            return None
        if request is None:
            return avatar_url
        return request.build_absolute_uri(avatar_url)


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField(max_length=255)
    password = serializers.CharField(write_only=True, min_length=6)

    def validate_email(self, value):
        if UserAccount.objects.filter(email=value).exists():
            raise serializers.ValidationError('Пользователь с таким email уже существует')
        return value

    def create(self, validated_data):
        user = UserAccount.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password']
        )
        return user

    def update(self, instance, validated_data):
        raise NotImplementedError("RegisterSerializer does not support update.")
