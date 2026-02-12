from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from annonces.models import Annonce

User = get_user_model()


class FavoriteTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="user@test.com",
            username="user",
            password="TestPass123"
        )

        self.other_user = User.objects.create_user(
            email="owner@test.com",
            username="owner",
            password="TestPass123"
        )

        self.annonce = Annonce.objects.create(
            user=self.other_user,
            type="service_offer",
            title="Test annonce",
            description="Desc",
            category="Services",
        )

        login = self.client.post(reverse("login"), {
            "email": "user@test.com",
            "password": "TestPass123"
        })

        token = login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_add_favorite(self):
        response = self.client.post(
            "/api/users/favorites/toggle/",
            {"annonce_id": self.annonce.id}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.user.favorites.count(), 1)

    def test_remove_favorite(self):
        self.user.favorites.add(self.annonce)

        response = self.client.post(
            "/api/users/favorites/toggle/",
            {"annonce_id": self.annonce.id}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.user.favorites.count(), 0)

    def test_list_my_favorites(self):
        self.user.favorites.add(self.annonce)

        response = self.client.get("/api/users/favorites/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.annonce.id)
