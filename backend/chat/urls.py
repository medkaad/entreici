from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ConversationViewSet, MessageViewSet

router = DefaultRouter()
router.register(r"conversations", ConversationViewSet, basename="conversation")

urlpatterns = router.urls + [
    path(
        "conversations/<int:conversation_pk>/messages/",
        MessageViewSet.as_view({
            "get": "list",
            "post": "create"
        }),
        name="conversation-messages"
    ),
]
