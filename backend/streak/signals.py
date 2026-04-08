from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import UserStreak

User = get_user_model()

@receiver(post_save, sender=User)
def create_user_streak(sender, instance, created, **kwargs):
    if created:
        UserStreak.objects.create(user=instance)
        print(f"Создана серия для пользователя {instance.email}")