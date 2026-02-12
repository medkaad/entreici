from rest_framework import serializers
from .models import Conversation
from .models import Message

class ConversationSerializer(serializers.ModelSerializer):
    annonce_title = serializers.ReadOnlyField(source="annonce.title")

    class Meta:
        model = Conversation
        fields = [
            "id",
            "annonce",
            "annonce_title",
            "participants",
            "created_at",
            "is_active",
        ]
        read_only_fields = ["participants", "created_at", "is_active"]

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
        read_only_fields = ["sender", "created_at", "is_read", "conversation",]