from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserAccountManager(BaseUserManager):
    """
    Менеджер для модели пользователя.
    """
    def create_user(self, email, name, password=None):
        """
        Создает и сохраняет пользователя с указанным email, именем и паролем.
        """
        if not email:
            raise ValueError('Email обязателен')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None):
        """
        Создает и сохраняет суперпользователя с указанным email, именем и паролем.
        """
        user = self.create_user(email, name, password)
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)
        return user


class Avatar(models.Model):
    """
    Модель для аватаров по умолчанию.
    """
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='avatars/defaults/')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        """
        Возвращает имя аватара.
        """
        return self.name


class UserAccount(AbstractBaseUser, PermissionsMixin):
    """
    Модель пользователя.

    Использует email как логин.

    Поля:
    - email: уникальный, для входа
    - name: имя пользователя
    - avatar: кастомный аватар пользователя
    - avatar_default: аватар по умолчанию
    - is_active: активен ли аккаунт
    - is_staff: доступ в админку
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
        """
        Возвращает email пользователя.
        """
        return self.email

    def get_avatar_url(self):
        """
        Возвращает URL аватара пользователя.

        Если у пользователя есть кастомный аватар, возвращается его URL.
        В противном случае, если у пользователя есть аватар по умолчанию, возвращается его URL.
        В противном случае, возвращается None.
        """
        if self.avatar:
            return self.avatar.url
        if self.avatar_default and self.avatar_default.image:
            return self.avatar_default.image.url
        return None
