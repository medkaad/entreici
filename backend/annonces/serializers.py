from rest_framework import serializers
from .models import Annonce
from users.models import Review


class AnnonceSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source="user.email")
    user_id = serializers.ReadOnlyField(source="user.id")

    # optionnel "startup": affichage nom + confiance
    user_first_name = serializers.ReadOnlyField(source="user.first_name")
    user_last_name = serializers.ReadOnlyField(source="user.last_name")
    user_is_verified = serializers.ReadOnlyField(source="user.is_verified")

    user_score = serializers.FloatField(source="user.profile.score", read_only=True)
    user_total_reviews = serializers.IntegerField(source="user.profile.total_reviews", read_only=True)
    user_badge = serializers.CharField(source="user.profile.badge", read_only=True)

    reservation_requester_id = serializers.IntegerField(
        source="reservation_requester.id", read_only=True
    )
    reservation_requester_email = serializers.CharField(
        source="reservation_requester.email", read_only=True
    )
    reservation_status = serializers.CharField(read_only=True)


    class Meta:
        model = Annonce
        fields = [
            "id",
            "user_id",
            "user_email",
            "user_first_name",
            "user_last_name",
            "user_is_verified",
            "user_score",
            "user_total_reviews",
            "user_badge",
            "ville",
            "quartier",
            "type",
            "title",
            "description",
            "category",
            "price",
            "is_urgent",
            "status",
            "created_at",
            "updated_at",
            "reservation_requester_id",
            "reservation_requester_email",
            "reservation_status",
        ]
        read_only_fields = [
            "user_id",
            "user_email",
            "user_first_name",
            "user_last_name",
            "user_is_verified",
            "user_score",
            "user_total_reviews",
            "user_badge",
            "created_at",
            "updated_at",
        ]

class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["rating", "comment"]
