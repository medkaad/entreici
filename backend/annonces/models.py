from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL

class Annonce(models.Model):

    TYPE_CHOICES = [
        ("SERVICE", "Service"),
        ("OBJET", "Objet"),
        ("AIDE", "Aide"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    city = models.CharField(max_length=100)

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="annonces",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
