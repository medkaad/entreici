from django.db import models
from django.conf import settings


class Annonce(models.Model):

    TYPE_CHOICES = [
        ("service_offer", "Service proposé"),
        ("service_request", "Service recherché"),
        ("item_sale", "Objet à vendre"),
        ("item_request", "Objet recherché"),
        ("urgent_help", "Aide urgente"),
    ]

    STATUS_CHOICES = [
        ("active", "Active"),
        ("in_progress", "En cours"),
        ("completed", "Terminée"),
        ("cancelled", "Annulée"),
        ("deleted", "Supprimée"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="annonces",
    )

    type = models.CharField(max_length=30, choices=TYPE_CHOICES)

    title = models.CharField(max_length=255)
    description = models.TextField()

    category = models.CharField(max_length=100)

    ville = models.CharField(max_length=100, db_index=True, default="")
    quartier = models.CharField(max_length=100, blank=True, default="", db_index=True)

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )

    is_urgent = models.BooleanField(default=False)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active",
    )

    reservation_requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reservation_requests"
    )

    reservation_status = models.CharField(
        max_length=20,
        choices=[
            ("none", "Aucune"),
            ("pending", "En attente"),
            ("accepted", "Acceptée"),
            ("rejected", "Refusée"),
        ],
        default="none"
    )


    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
