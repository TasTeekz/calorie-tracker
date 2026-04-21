from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Profile, DailyGoal


@receiver(post_save, sender=User)
def create_user_related_objects(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance, sex='male', role='USER')
        DailyGoal.objects.create(user=instance)
