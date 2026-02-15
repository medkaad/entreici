from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from annonces.models import Annonce
from chat.models import Conversation

User = get_user_model()


class MessageAPITests(APITestCase):

    def setUp(self):
        self.owner = User.objects.create_user(
            email="owner@test.com",
            username="owner",
            password="TestPass123"
        )

        self.client_user = User.objects.create_user(
            email="client@test.com",
            username="client",
            password="TestPass123"
        )

        self.annonce = Annonce.objects.create(
            user=self.owner,
            type="service_offer",
            title="Test",
            description="Desc",
            category="Services",
        )

        self.conversation = Conversation.objects.create(
            annonce=self.annonce
        )
        self.conversation.participants.add(
            self.owner,
            self.client_user
        )

        login = self.client.post("/api/users/login/", {
            "email": "client@test.com",
            "password": "TestPass123"
        })

        token = login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_send_message(self):
        response = self.client.post(
            f"/api/chat/conversations/{self.conversation.id}/messages/",
            {"content": "Hello"}
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["content"], "Hello")

    def test_only_participant_can_access(self):
        outsider = User.objects.create_user(
            email="outsider@test.com",
            username="outsider",
            password="TestPass123"
        )

        login = self.client.post("/api/users/login/", {
            "email": "outsider@test.com",
            "password": "TestPass123"
        })

        token = login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.get(
            f"/api/chat/conversations/{self.conversation.id}/messages/"
        )

        self.assertEqual(response.status_code, 403)
