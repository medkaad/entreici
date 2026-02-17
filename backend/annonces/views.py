from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q, Avg, Count

from .models import Annonce
from .serializers import AnnonceSerializer
from .permissions import IsOwnerOrReadOnly

from users.models import Review
from chat.models import Conversation, Message
from ai.views import scam_score


class AnnonceViewSet(viewsets.ModelViewSet):
    serializer_class = AnnonceSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]
    filterset_fields = ["type", "category", "is_urgent", "status", "quartier"]
    search_fields = ["title", "description", "category"]
    ordering_fields = ["created_at", "price"]

    def get_queryset(self):
        user = self.request.user
        user_ville = (getattr(user.profile, "ville", "") or "").strip()

        qs = (
            Annonce.objects
            .select_related("user", "user__profile")
            .filter(Q(status__in=["active", "in_progress", "completed", "cancelled"]) | Q(user=user))
            .exclude(status="deleted")
            .order_by("-created_at")
        )

        if user_ville:
            qs = qs.filter(Q(user=user) | Q(ville__iexact=user_ville))

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        annonce = serializer.save(user=user)

        # ✅ Assurer ville/quartier
        if not annonce.ville:
            annonce.ville = (getattr(user.profile, "ville", "") or "").strip()
        if not annonce.quartier:
            annonce.quartier = (getattr(user.profile, "quartier", "") or "").strip()

        level, score, reasons = scam_score(annonce.title or "", annonce.description or "")
        annonce.scam_level = level
        annonce.scam_score = score
        annonce.save()

    def perform_update(self, serializer):
        instance = serializer.instance
        old_status = instance.status

        new_status = serializer.validated_data.get("status", instance.status)

        if instance.user != self.request.user:
            raise PermissionDenied("Vous ne pouvez modifier que votre annonce.")

        # Workflow autorisé
        allowed_transitions = {
            "active": ["in_progress", "cancelled"],
            "in_progress": ["completed", "cancelled"],
            "completed": [],
            "cancelled": [],
        }

        if new_status != instance.status:
            if new_status not in allowed_transitions.get(instance.status, []):
                raise PermissionDenied(
                    f"Transition interdite : {instance.status} → {new_status}"
                )

        serializer.save()

        # ==========================
        # ✅ AUTO MESSAGE SI TERMINÉE
        # ==========================
        if old_status != "completed" and new_status == "completed":
            requester = getattr(instance, "reservation_requester", None)
            r_status = getattr(instance, "reservation_status", None)

            # seulement si réservation acceptée
            if requester and r_status == "accepted":
                # ✅ récupérer OU créer conversation
                conv = (
                    Conversation.objects
                    .filter(annonce=instance)
                    .filter(participants=instance.user)
                    .filter(participants=requester)
                    .first()
                )

                if not conv:
                    conv = Conversation.objects.create(annonce=instance)
                    conv.participants.add(instance.user, requester)

                # ✅ éviter doublons
                already = Message.objects.filter(
                    conversation=conv,
                    content__icontains=f"[AVIS:{instance.id}]"
                ).exists()

                if not already:
                    Message.objects.create(
                        conversation=conv,
                        sender=instance.user,  # owner
                        content=(
                            f"✅ L’annonce \"{instance.title}\" est terminée.\n"
                            f"⭐ Merci de laisser un avis (note + commentaire)\n"
                            f"[AVIS:{instance.id}]"
                        ),
                    )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.user != request.user:
            raise PermissionDenied("Vous ne pouvez supprimer que votre annonce.")

        # Soft delete
        instance.status = "deleted"
        instance.save()

        return Response(status=204)

    # ==========================
    # ✅ /api/annonces/mine/
    # ==========================
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

    # ==========================
    # ✅ RESERVATION
    # ==========================
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def request_reservation(self, request, pk=None):
        annonce = self.get_object()

        if annonce.user == request.user:
            return Response(
                {"detail": "Tu ne peux pas réserver ta propre annonce."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1 demande à la fois
        if annonce.reservation_status == "pending":
            return Response(
                {"detail": "Une demande existe déjà."},
                status=status.HTTP_400_BAD_REQUEST
            )

        annonce.reservation_requester = request.user
        annonce.reservation_status = "pending"
        annonce.save()

        # ✅ notification MVP: créer conversation + message auto
        conv = (
            Conversation.objects
            .filter(annonce=annonce)
            .filter(participants=annonce.user)
            .filter(participants=request.user)
            .first()
        )

        if not conv:
            conv = Conversation.objects.create(annonce=annonce)
            conv.participants.add(annonce.user, request.user)

        Message.objects.create(
            conversation=conv,
            sender=request.user,
            content=f"📩 J’ai envoyé une demande de réservation pour \"{annonce.title}\"."
        )

        return Response({"message": "Demande envoyée", "conversation_id": conv.id}, status=200)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def accept_reservation(self, request, pk=None):
        annonce = self.get_object()

        if annonce.user != request.user:
            return Response({"detail": "Non autorisé"}, status=status.HTTP_403_FORBIDDEN)

        if annonce.reservation_status != "pending" or annonce.reservation_requester is None:
            return Response({"detail": "Aucune demande en attente."}, status=status.HTTP_400_BAD_REQUEST)

        annonce.reservation_status = "accepted"
        annonce.status = "in_progress"
        annonce.save()

        # ✅ message auto dans la conversation (si existe, sinon créer)
        requester = annonce.reservation_requester

        conv = (
            Conversation.objects
            .filter(annonce=annonce)
            .filter(participants=annonce.user)
            .filter(participants=requester)
            .first()
        )
        if not conv:
            conv = Conversation.objects.create(annonce=annonce)
            conv.participants.add(annonce.user, requester)

        Message.objects.create(
            conversation=conv,
            sender=annonce.user,
            content=f"✅ Réservation acceptée pour \"{annonce.title}\". On peut s’organiser ici."
        )

        return Response({"message": "Réservation acceptée", "conversation_id": conv.id}, status=200)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def reject_reservation(self, request, pk=None):
        annonce = self.get_object()

        if annonce.user != request.user:
            return Response({"detail": "Non autorisé"}, status=status.HTTP_403_FORBIDDEN)

        if annonce.reservation_status != "pending":
            return Response({"detail": "Aucune demande en attente."}, status=status.HTTP_400_BAD_REQUEST)

        requester = annonce.reservation_requester

        annonce.reservation_status = "rejected"
        annonce.reservation_requester = None
        annonce.save()

        # ✅ message auto (si conversation existe)
        if requester:
            conv = (
                Conversation.objects
                .filter(annonce=annonce)
                .filter(participants=annonce.user)
                .filter(participants=requester)
                .first()
            )
            if conv:
                Message.objects.create(
                    conversation=conv,
                    sender=annonce.user,
                    content=f"❌ Réservation refusée pour \"{annonce.title}\"."
                )

        return Response({"message": "Réservation refusée"}, status=200)

    # ==========================
    # ✅ REVIEW (AVIS)
    # ==========================
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def review(self, request, pk=None):
        annonce = self.get_object()

        # seulement si terminée
        if annonce.status != "completed":
            return Response(
                {"detail": "Tu peux laisser un avis uniquement quand l’annonce est Terminée."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # seulement si réservation acceptée
        if annonce.reservation_status != "accepted" or annonce.reservation_requester is None:
            return Response(
                {"detail": "Aucune réservation acceptée pour cette annonce."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # seul le réservant peut noter
        if annonce.reservation_requester != request.user:
            return Response(
                {"detail": "Seul le réservant peut laisser un avis."},
                status=status.HTTP_403_FORBIDDEN
            )

        # validation note
        try:
            rating = int(request.data.get("rating", 0))
        except:
            rating = 0

        comment = request.data.get("comment", "")

        if rating < 1 or rating > 5:
            return Response(
                {"detail": "La note doit être entre 1 et 5."},
                status=status.HTTP_400_BAD_REQUEST
            )

        reviewed_user = annonce.user  # propriétaire

        # 1 avis par annonce (OneToOne)
        if Review.objects.filter(annonce=annonce).exists():
            return Response(
                {"detail": "Un avis existe déjà pour cette annonce."},
                status=status.HTTP_400_BAD_REQUEST
            )

        Review.objects.create(
            annonce=annonce,
            reviewer=request.user,
            reviewed_user=reviewed_user,
            rating=rating,
            comment=comment,
        )

        # recalcul score + total_reviews
        agg = Review.objects.filter(reviewed_user=reviewed_user).aggregate(
            avg=Avg("rating"),
            count=Count("id")
        )

        reviewed_user.profile.score = float(agg["avg"] or 0)
        reviewed_user.profile.total_reviews = int(agg["count"] or 0)
        reviewed_user.profile.save()  # update_badge() auto

        return Response(
            {
                "message": "Avis envoyé",
                "owner_score": reviewed_user.profile.score,
                "owner_total_reviews": reviewed_user.profile.total_reviews,
                "owner_badge": reviewed_user.profile.badge,
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def quartiers(self, request):
        user_ville = request.user.profile.ville

        quartiers = (
            Annonce.objects
            .filter(ville=user_ville)
            .exclude(quartier="")
            .values_list("quartier", flat=True)
            .distinct()
            .order_by("quartier")
        )

        return Response({"ville": user_ville, "quartiers": list(quartiers)})
