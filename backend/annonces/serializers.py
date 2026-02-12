from rest_framework import serializers
from .models import Annonce


class AnnonceSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source="user.email")

    class Meta:
        model = Annonce
        fields = [
            "id",
            "user_email",
            "type",
            "title",
            "description",
            "category",
            "price",
            "is_urgent",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "user_email",
            "status",
            "created_at",
            "updated_at",
        ]
