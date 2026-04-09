from rest_framework import serializers

from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source="user.email")

    class Meta:
        model = ActivityLog
        fields = ("id", "user_email", "action", "entity_type", "entity_id", "description", "created_at")
        read_only_fields = fields
