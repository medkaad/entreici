from django.test import TestCase
from django.contrib.auth import get_user_model
from annonces.models import Annonce
from chat.models import Conversation, Message

User = get_user_model()


class ChatModelTests(TestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(
            email="user1@test.com",
            username="user1",
            password="TestPass123"
        )

        self.user2 = User.objects.create_user(
            email="user2@test.com",
            username="user2",
            password="TestPass123"
        )

        self.annonce = Annonce.objects.create(
            user=self.user1,
            type="service_offer",
            title="Test annonce",
            description="Desc",
            category="Services",
        )

    def test_create_conversation(self):
        conversation = Conversation.objects.create(
            annonce=self.annonce
        )

        conversation.participants.add(self.user1, self.user2)

        self.assertEqual(conversation.participants.count(), 2)

    def test_create_message(self):
        conversation = Conversation.objects.create(
            annonce=self.annonce
        )
        conversation.participants.add(self.user1, self.user2)

        message = Message.objects.create(
            conversation=conversation,
            sender=self.user1,
            content="Bonjour"
        )

        self.assertEqual(message.content, "Bonjour")
