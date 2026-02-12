from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from .permissions import IsConversationParticipant
from annonces.models import Annonce


# =========================
# CONVERSATIONS
# =========================

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated, IsConversationParticipant]

    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).order_by("-created_at")

    def perform_create(self, serializer):
        annonce_id = self.request.data.get("annonce")
        annonce = get_object_or_404(Annonce, id=annonce_id)

        # ❌ empêcher contacter sa propre annonce
        if annonce.user_id == self.request.user.id:
            raise PermissionDenied("Vous ne pouvez pas contacter votre propre annonce.")

        # ❌ empêcher doublon conversation
        existing = Conversation.objects.filter(
            annonce=annonce,
            participants=self.request.user
        ).first()

        if existing:
            raise PermissionDenied("Conversation déjà existante.")

        conversation = serializer.save(annonce=annonce)

        conversation.participants.add(
            self.request.user,
            annonce.user
        )


# =========================
# MESSAGES
# =========================

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs.get("conversation_pk")

        conversation = get_object_or_404(
            Conversation,
            id=conversation_id
        )

        if self.request.user not in conversation.participants.all():
            raise PermissionDenied("Not allowed")

        return Message.objects.filter(
            conversation=conversation
        ).order_by("created_at")

    def perform_create(self, serializer):
        conversation_id = self.kwargs.get("conversation_pk")

        conversation = get_object_or_404(
            Conversation,
            id=conversation_id
        )

        if self.request.user not in conversation.participants.all():
            raise PermissionDenied("Not allowed")

        serializer.save(
            sender=self.request.user,
            conversation=conversation
        )
