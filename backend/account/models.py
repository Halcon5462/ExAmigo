from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from taskBank.models import Task

class UserAccountManager(BaseUserManager):
    def create_user(self, email, name, password=None):
        if not email:
            raise ValueError('Email обязателен')
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

class UserAccount(AbstractBaseUser, PermissionsMixin):
    """
    Модель пользователя.

    Использую email как логин.

    Поля:
    - email: уникальный, для входа
    - name: имя пользователя
    - is_active: активен ли аккаунт
    - is_staff: доступ в админку
    """
    email = models.EmailField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserAccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email

class Achievement(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    target = models.PositiveIntegerField()
    icon = models.ImageField(upload_to='achievements/icons/')
    reward = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name

class UserAchievement(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='achievements'
    )
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    get_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement')

    def __str__(self):
        return f"{self.user.email} - {self.achievement.name}"


class UserAchievementProgress(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='progressToAchievement'
    )
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    current_value = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('user', 'achievement')

    def __str__(self):
        return f"{self.user.email} progress for {self.achievement.name}"

    @property
    def is_completed(self):
        return self.current_value >= self.achievement.target


    # Модели, связанные с заданиями (TaskAttempt, TaskProgress),
    # перенесены в приложение `statistic`.
