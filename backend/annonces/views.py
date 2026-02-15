from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Annonce
from .serializers import AnnonceSerializer, ReviewCreateSerializer
from .permissions import IsOwnerOrReadOnly
from django.db.models import Q
from rest_framework import status
from users.models import Review

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
            .select_related("user", "user__profile")
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
        instance = serializer.instance
        new_status = serializer.validated_data.get("status", instance.status)

        if instance.user != self.request.user:
            raise PermissionDenied("Vous ne pouvez modifier que votre annonce.")

        #  Workflow autorisé
        allowed_transitions = {
            "active": ["in_progress", "cancelled"],
            "in_progress": ["completed", "cancelled"],
            "completed": [],
            "cancelled": [],
        }

        # Si on change le status
        if new_status != instance.status:
            if new_status not in allowed_transitions.get(instance.status, []):
                raise PermissionDenied(
                    f"Transition interdite : {instance.status} → {new_status}"
                )

        serializer.save()


    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.user != request.user:
            raise PermissionDenied("Vous ne pouvez supprimer que votre annonce.")

        # Soft delete
        instance.status = "deleted"
        instance.save()

        return Response(status=204)

    #  NOUVEL ENDPOINT → /api/annonces/mine/
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def mine(self, request):
        annonces = (
            Annonce.objects
            .select_related("user", "user__profile")
            .filter(user=request.user)
            .exclude(status="deleted")
            .order_by("-created_at")
        )

        serializer = self.get_serializer(annonces, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def review(self, request, pk=None):
        annonce = self.get_object()

        #  avis seulement si annonce terminée
        if annonce.status != "completed":
            return Response(
                {"detail": "Avis autorisé uniquement quand l'annonce est terminée."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        #  pas d'avis sur soi-même
        if annonce.user == request.user:
            return Response(
                {"detail": "Tu ne peux pas t'auto-noter."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        #  1 avis par annonce
        if hasattr(annonce, "review"):
            return Response(
                {"detail": "Un avis existe déjà pour cette annonce."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        Review.objects.create(
            annonce=annonce,
            reviewer=request.user,
            reviewed_user=annonce.user,
            rating=serializer.validated_data["rating"],
            comment=serializer.validated_data.get("comment", ""),
        )

        #  recalcul score + total_reviews
        qs = Review.objects.filter(reviewed_user=annonce.user)
        total = qs.count()
        avg = sum(r.rating for r in qs) / total if total > 0 else 0

        profile = annonce.user.profile
        profile.score = avg
        profile.total_reviews = total
        profile.save()  #  update_badge() se fait dans save()

        return Response({"message": "Avis enregistré."}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def request_reservation(self, request, pk=None):
        annonce = self.get_object()

        if annonce.user == request.user:
            return Response({"detail": "Tu ne peux pas réserver ta propre annonce."}, status=400)

        if annonce.reservation_status == "pending":
            return Response({"detail": "Une demande existe déjà."}, status=400)

        annonce.reservation_requester = request.user
        annonce.reservation_status = "pending"
        annonce.save()

        return Response({"message": "Demande envoyée"}, status=200)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def accept_reservation(self, request, pk=None):
        annonce = self.get_object()

        if annonce.user != request.user:
            return Response({"detail": "Non autorisé"}, status=403)

        annonce.reservation_status = "accepted"
        annonce.status = "in_progress"
        annonce.save()

        return Response({"message": "Réservation acceptée"})

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def reject_reservation(self, request, pk=None):
        annonce = self.get_object()

        if annonce.user != request.user:
            return Response({"detail": "Non autorisé"}, status=403)

        annonce.reservation_status = "rejected"
        annonce.reservation_requester = None
        annonce.save()

        return Response({"message": "Réservation refusée"})
