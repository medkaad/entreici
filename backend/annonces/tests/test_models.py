from django.test import TestCase
from django.contrib.auth import get_user_model
from annonces.models import Annonce

User = get_user_model()


class AnnonceModelTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="annonce@example.com",
            username="annonceuser",
            password="TestPass123"
        )

    def test_create_annonce(self):
        annonce = Annonce.objects.create(
            user=self.user,
            type="service_offer",
            title="Aide aux courses",
            description="Je peux aider pour faire les courses",
            category="Services",
            price=10.00,
        )

        self.assertEqual(annonce.user, self.user)
        self.assertEqual(annonce.status, "active")
