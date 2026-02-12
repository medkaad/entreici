from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Annonce
from .serializers import AnnonceSerializer
from .permissions import IsOwnerOrReadOnly
from django.db.models import Q
from rest_framework.response import Response

class AnnonceViewSet(viewsets.ModelViewSet):
    serializer_class = AnnonceSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = ["type", "category", "is_urgent", "status"]
    search_fields = ["title", "description", "category"]
    ordering_fields = ["created_at", "price"]

    def get_queryset(self):
        user = self.request.user

        return (
            Annonce.objects
            .select_related("user")
            .filter(
                Q(status__in=["active", "in_progress", "completed", "cancelled"]) |
                Q(user=user)
            )
            .exclude(status="deleted")
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.status != "active":
            raise PermissionDenied("Annonce inactive.")
        serializer.save()
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.user != request.user:
            raise PermissionDenied("Vous ne pouvez supprimer que votre annonce.")

        instance.status = "deleted"
        instance.save()

        return Response(status=204)
