from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions

from .models import ActivityLog
from .serializers import ActivityLogSerializer


@extend_schema(tags=["Activity"])
class ActivityLogListView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ActivityLog.objects.filter(user=self.request.user).select_related("user")
