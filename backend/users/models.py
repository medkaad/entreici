from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from annonces.models import Annonce
from django.core.validators import MinValueValidator, MaxValueValidator

class User(AbstractUser):
    email = models.EmailField(unique=True)

    is_verified = models.BooleanField(default=False)   # futur email verification
    role = models.CharField(
        max_length=20,
        choices=[
            ("user", "User"),
            ("moderator", "Moderator"),
            ("admin", "Admin"),
        ],
        default="user"
    )

    favorites = models.ManyToManyField(
        Annonce,
        related_name="favorited_by",
        blank=True
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email

class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    photo = models.ImageField(upload_to="profiles/", null=True, blank=True)

    ville = models.CharField(max_length=100)
    quartier = models.CharField(max_length=100, blank=True)

    description = models.TextField(blank=True)

    score = models.FloatField(default=0)
    total_reviews = models.IntegerField(default=0)

    badge = models.CharField(max_length=50, default="Nouveau")

    created_at = models.DateTimeField(auto_now_add=True)

    def update_badge(self):
        if self.score >= 4.5 and self.total_reviews >= 5:
            self.badge = "Super voisin"
        elif self.score >= 3:
            self.badge = "Voisin fiable"
        else:
            self.badge = "Nouveau"

    def save(self, *args, **kwargs):
        self.update_badge()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Profile of {self.user.email}"
    
class Review(models.Model):
    annonce = models.OneToOneField(
        "annonces.Annonce",
        on_delete=models.CASCADE,
        related_name="review",
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews_given",
    )
    reviewed_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews_received",
    )

    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.rating}/5 -> {self.reviewed_user.email} (annonce {self.annonce_id})"
