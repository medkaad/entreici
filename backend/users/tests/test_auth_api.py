from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthAPITests(APITestCase):

    def test_register_user(self):
        url = reverse("register")

        data = {
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "StrongPass123",
            "ville": "Villemomble",
            "quartier": "Centre",
        }

        response = self.client.post(url, data)

        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(email="newuser@example.com").exists())

    def test_login_user(self):
        user = User.objects.create_user(
            email="login@example.com",
            username="loginuser",
            password="TestPass123"
        )

        url = reverse("login")

        response = self.client.post(url, {
            "email": "login@example.com",
            "password": "TestPass123"
        })

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)

    def test_me_endpoint(self):
        user = User.objects.create_user(
            email="me@example.com",
            username="meuser",
            password="TestPass123"
        )

        login_url = reverse("login")
        response = self.client.post(login_url, {
            "email": "me@example.com",
            "password": "TestPass123"
        })

        token = response.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        me_url = reverse("me")
        response = self.client.get(me_url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["email"], "me@example.com")
