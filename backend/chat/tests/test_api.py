from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from annonces.models import Annonce

User = get_user_model()


class ConversationAPITests(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(
            email="owner@test.com",
            username="owner",
            password="TestPass123"
        )

        self.user2 = User.objects.create_user(
            email="client@test.com",
            username="client",
            password="TestPass123"
        )

        self.annonce = Annonce.objects.create(
            user=self.user1,
            type="service_offer",
            title="Service test",
            description="Desc",
            category="Services",
        )

        login = self.client.post(reverse("login"), {
            "email": "client@test.com",
            "password": "TestPass123"
        })

        self.token = login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_create_conversation(self):
        response = self.client.post("/api/chat/conversations/", {
            "annonce": self.annonce.id
        })

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["annonce"], self.annonce.id)

    def test_only_participant_can_view(self):
        response = self.client.post("/api/chat/conversations/", {
            "annonce": self.annonce.id
        })

        conversation_id = response.data["id"]

        outsider = User.objects.create_user(
            email="outsider@test.com",
            username="outsider",
            password="TestPass123"
        )

        login = self.client.post(reverse("login"), {
            "email": "outsider@test.com",
            "password": "TestPass123"
        })

        token = login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.get(f"/api/chat/conversations/{conversation_id}/")

        self.assertEqual(response.status_code, 404)
    
    def test_cannot_contact_own_annonce(self):
        login = self.client.post("/api/users/login/", {
            "email": "owner@test.com",
            "password": "TestPass123"
        })

        token = login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.post(
            "/api/chat/conversations/",
            {"annonce": self.annonce.id}
        )

        self.assertEqual(response.status_code, 403)

