from django.contrib import admin

from .models import Category, Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "status", "priority", "due_date", "is_overdue", "created_at")
    list_filter = ("status", "priority", "category")
    search_fields = ("title", "description", "owner__email")
    date_hierarchy = "created_at"
    ordering = ("-created_at",)
    autocomplete_fields = ("owner",)

    fieldsets = (
        (None, {"fields": ("title", "description")}),
        ("Status & Priority", {"fields": ("status", "priority", "completed_at")}),
        ("Scheduling", {"fields": ("due_date",)}),
        ("Relations", {"fields": ("owner", "category")}),
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "color", "owner", "created_at")
    search_fields = ("name", "owner__email")
