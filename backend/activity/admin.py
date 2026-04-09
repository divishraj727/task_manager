from django.contrib import admin

from .models import ActivityLog


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ("user", "action", "entity_type", "entity_id", "description", "created_at")
    list_filter = ("action", "entity_type")
    search_fields = ("user__email", "description")
    date_hierarchy = "created_at"
    readonly_fields = ("user", "action", "entity_type", "entity_id", "description", "created_at")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
