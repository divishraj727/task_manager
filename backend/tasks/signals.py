from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Task


@receiver(post_save, sender=Task)
def log_task_save(sender, instance, created, **kwargs):
    from activity.models import ActivityLog

    action = "created" if created else "updated"
    ActivityLog.objects.create(
        user=instance.owner,
        action=action,
        entity_type="task",
        entity_id=instance.id,
        description=f'Task "{instance.title}" was {action}.',
    )


@receiver(post_delete, sender=Task)
def log_task_delete(sender, instance, **kwargs):
    from activity.models import ActivityLog

    ActivityLog.objects.create(
        user=instance.owner,
        action="deleted",
        entity_type="task",
        entity_id=instance.id,
        description=f'Task "{instance.title}" was deleted.',
    )
