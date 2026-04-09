from rest_framework import serializers

from .models import Category, Task


class CategorySerializer(serializers.ModelSerializer):
    task_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "name", "color", "task_count", "created_at")
        read_only_fields = ("id", "created_at")

    def get_task_count(self, obj):
        return obj.tasks.count()

    def create(self, validated_data):
        validated_data["owner"] = self.context["request"].user
        return super().create(validated_data)


class TaskSerializer(serializers.ModelSerializer):
    is_overdue = serializers.ReadOnlyField()
    category_detail = CategorySerializer(source="category", read_only=True)
    owner_name = serializers.ReadOnlyField(source="owner.full_name")

    class Meta:
        model = Task
        fields = (
            "id", "title", "description", "status", "priority",
            "due_date", "completed_at", "category", "category_detail",
            "owner_name", "is_overdue", "created_at", "updated_at",
        )
        read_only_fields = ("id", "completed_at", "created_at", "updated_at", "owner_name")

    def create(self, validated_data):
        validated_data["owner"] = self.context["request"].user
        return super().create(validated_data)

    def validate_category(self, value):
        if value and value.owner != self.context["request"].user:
            raise serializers.ValidationError("You do not own this category.")
        return value


class TaskStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    todo = serializers.IntegerField()
    in_progress = serializers.IntegerField()
    done = serializers.IntegerField()
    cancelled = serializers.IntegerField()
    overdue = serializers.IntegerField()
    high_priority = serializers.IntegerField()
