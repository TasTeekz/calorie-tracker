from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import logging

from .models import Profile, DailyGoal


logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def create_user_related_objects(sender, instance, created, **kwargs):
    if created:
        profile = Profile.objects.create(user=instance, sex='male', role='USER', is_profile_completed=False)
        DailyGoal.objects.create(user=instance)
        logger.debug(
            'Auto-created profile user_id=%s profile_id=%s completed=%s',
            instance.id,
            profile.id,
            profile.is_profile_completed,
        )
