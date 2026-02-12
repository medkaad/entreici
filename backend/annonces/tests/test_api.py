from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()


class AnnonceAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="user1@example.com",
            username="user1",
            password="TestPass123"
        )

        login = self.client.post(reverse("login"), {
            "email": "user1@example.com",
            "password": "TestPass123"
        })

        self.token = login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_create_annonce(self):
        response = self.client.post("/api/annonces/", {
            "type": "service_offer",
            "title": "Aide jardinage",
            "description": "Je propose aide jardinage",
            "category": "Services",
            "price": 15.00,
        })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_user_cannot_edit_other_annonce(self):
        response = self.client.post("/api/annonces/", {
            "type": "service_offer",
            "title": "Test",
            "description": "Desc",
            "category": "Services",
        })

        annonce_id = response.data["id"]

        other_user = User.objects.create_user(
            email="other@example.com",
            username="other",
            password="TestPass123"
        )

        login = self.client.post(reverse("login"), {
            "email": "other@example.com",
            "password": "TestPass123"
        })

        token = login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.patch(f"/api/annonces/{annonce_id}/", {
            "title": "Hack"
        })

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_search_annonce(self):
        self.client.post("/api/annonces/", {
            "type": "service_offer",
            "title": "Cours de math",
            "description": "Aide en mathématiques",
            "category": "Education",
        })

        response = self.client.get("/api/annonces/?search=math")

        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data["results"]), 1)

    def test_pagination(self):
        for i in range(15):
            self.client.post("/api/annonces/", {
                "type": "service_offer",
                "title": f"Annonce {i}",
                "description": "Desc",
                "category": "Services",
            })

        response = self.client.get("/api/annonces/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 10)


