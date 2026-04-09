from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CategoryDetailView, CategoryListCreateView, TaskViewSet

router = DefaultRouter()
router.register(r"", TaskViewSet, basename="task")

urlpatterns = [
    path("categories/", CategoryListCreateView.as_view(), name="category-list"),      # 18 & 19
    path("categories/<int:pk>/", CategoryDetailView.as_view(), name="category-detail"), # 20 & 21
    path("", include(router.urls)),
]
