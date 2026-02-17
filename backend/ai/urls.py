from django.urls import path
from .views import AIGenerateAnnonceView

urlpatterns = [
    path("annonce/", AIGenerateAnnonceView.as_view(), name="ai-generate-annonce"),
]
