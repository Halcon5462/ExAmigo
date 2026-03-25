from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserAccountManager(BaseUserManager):
    def create_user(self, email, name, password=None):
        if not email:
            raise ValueError('Email РѕР±СЏР·Р°С‚РµР»РµРЅ')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None):
        user = self.create_user(email, name, password)
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)
        return user


class Avatar(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='avatars/defaults/')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class UserAccount(AbstractBaseUser, PermissionsMixin):
    """
    РњРѕРґРµР»СЊ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ.

    РСЃРїРѕР»СЊР·СѓСЋ email РєР°Рє Р»РѕРіРёРЅ.

    РџРѕР»СЏ:
    - email: СѓРЅРёРєР°Р»СЊРЅС‹Р№, РґР»СЏ РІС…РѕРґР°
    - name: РёРјСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
    - is_active: Р°РєС‚РёРІРµРЅ Р»Рё Р°РєРєР°СѓРЅС‚
    - is_staff: РґРѕСЃС‚СѓРї РІ Р°РґРјРёРЅРєСѓ
    """

    email = models.EmailField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    avatar = models.ImageField(
        upload_to='avatars/custom/',
        blank=True,
        null=True,
    )
    avatar_default = models.ForeignKey(
        Avatar,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserAccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email

    def get_avatar_url(self):
        if self.avatar:
            return self.avatar.url
        if self.avatar_default and self.avatar_default.image:
            return self.avatar_default.image.url
        return None
