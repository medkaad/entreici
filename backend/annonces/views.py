from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import Annonce
from .serializers import AnnonceSerializer
from .permissions import IsOwnerOrReadOnly

class AnnonceViewSet(ModelViewSet):
    queryset = Annonce.objects.all().order_by("-created_at")
    serializer_class = AnnonceSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
