from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import Annonce
from .serializers import AnnonceSerializer
from .permissions import IsOwnerOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .filters import AnnonceFilter


class AnnonceViewSet(ModelViewSet):
    queryset = Annonce.objects.all().order_by("-created_at")
    serializer_class = AnnonceSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = AnnonceFilter
    search_fields = ["title", "description"]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
