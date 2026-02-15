from django.test import TestCase

# Create your tests here.
from django.test import TestCase
from django.contrib.auth import get_user_model
from users.models import UserProfile

User = get_user_model()


class UserModelTests(TestCase):

    def test_user_creation(self):
        user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="password123"
        )

        self.assertEqual(user.email, "test@example.com")
        self.assertTrue(user.check_password("password123"))

    def test_profile_created_automatically(self):
        user = User.objects.create_user(
            email="profile@example.com",
            username="profileuser",
            password="password123"
        )

        self.assertTrue(UserProfile.objects.filter(user=user).exists())

    def test_badge_logic(self):
        user = User.objects.create_user(
            email="badge@example.com",
            username="badgeuser",
            password="password123"
        )

        profile = user.profile
        profile.score = 4.7
        profile.total_reviews = 6
        profile.save()

        self.assertEqual(profile.badge, "Super voisin")
