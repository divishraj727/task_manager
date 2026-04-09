from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .filters import TaskFilter
from .models import Category, Task
from .serializers import CategorySerializer, TaskSerializer, TaskStatsSerializer


class TaskViewSet(ModelViewSet):
    """
    Task CRUD + extra actions.

    Endpoints 9-17:
      9  GET    /api/tasks/              list
      10 POST   /api/tasks/              create
      11 GET    /api/tasks/{id}/         retrieve
      12 PUT    /api/tasks/{id}/         update
      13 PATCH  /api/tasks/{id}/         partial_update
      14 DELETE /api/tasks/{id}/         destroy
      15 GET    /api/tasks/stats/        stats
      16 POST   /api/tasks/{id}/complete/ complete
      17 POST   /api/tasks/{id}/reopen/  reopen
    """

    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = TaskFilter
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "due_date", "priority", "status"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Task.objects.filter(owner=self.request.user).select_related("category")

    @extend_schema(responses=TaskStatsSerializer, tags=["Tasks"])
    @action(detail=False, methods=["get"])
    def stats(self, request):
        qs = self.get_queryset()
        today = timezone.now().date()
        data = {
            "total": qs.count(),
            "todo": qs.filter(status=Task.Status.TODO).count(),
            "in_progress": qs.filter(status=Task.Status.IN_PROGRESS).count(),
            "done": qs.filter(status=Task.Status.DONE).count(),
            "cancelled": qs.filter(status=Task.Status.CANCELLED).count(),
            "overdue": qs.filter(
                due_date__lt=today,
                status__in=[Task.Status.TODO, Task.Status.IN_PROGRESS],
            ).count(),
            "high_priority": qs.filter(
                priority__in=[Task.Priority.HIGH, Task.Priority.URGENT],
                status__in=[Task.Status.TODO, Task.Status.IN_PROGRESS],
            ).count(),
        }
        return Response(TaskStatsSerializer(data).data)

    @extend_schema(request=None, tags=["Tasks"])
    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.status = Task.Status.DONE
        task.completed_at = timezone.now()
        task.save()
        return Response(TaskSerializer(task, context={"request": request}).data)

    @extend_schema(request=None, tags=["Tasks"])
    @action(detail=True, methods=["post"])
    def reopen(self, request, pk=None):
        task = self.get_object()
        task.status = Task.Status.TODO
        task.completed_at = None
        task.save()
        return Response(TaskSerializer(task, context={"request": request}).data)


# Category endpoints 18-21
class CategoryListCreateView(generics.ListCreateAPIView):
    """
      18 GET  /api/tasks/categories/      list
      19 POST /api/tasks/categories/      create
    """

    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(owner=self.request.user)


class CategoryDetailView(generics.RetrieveDestroyAPIView):
    """
      20 GET    /api/tasks/categories/{id}/  retrieve
      21 DELETE /api/tasks/categories/{id}/  destroy
    """

    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(owner=self.request.user)
