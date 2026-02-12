from rest_framework import serializers
from .models import Conversation, Message


class ConversationSerializer(serializers.ModelSerializer):
    annonce_title = serializers.ReadOnlyField(source="annonce.title")
    other_user = serializers.SerializerMethodField()  # ✅ IMPORTANT

    class Meta:
        model = Conversation
        fields = [
            "id",
            "annonce",
            "annonce_title",
            "participants",
            "other_user",
            "created_at",
            "is_active",
        ]
        read_only_fields = ["participants", "created_at", "is_active"]

    def get_other_user(self, obj):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            return None

        current_user = request.user
        other = obj.participants.exclude(id=current_user.id).first()

        if other:
            return {
                "id": other.id,
                "first_name": other.first_name,
                "last_name": other.last_name,
            }

        return None


class MessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.ReadOnlyField(source="sender.email")

    class Meta:
        model = Message
        fields = [
            "id",
            "conversation",
            "sender",
            "sender_email",
            "content",
            "created_at",
            "is_read",
        ]
        read_only_fields = ["sender", "created_at", "is_read", "conversation"]
