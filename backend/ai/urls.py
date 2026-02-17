from django.urls import path
from .views import AIGenerateAnnonceView, ScamCheckView

urlpatterns = [
    path("annonce/", AIGenerateAnnonceView.as_view(), name="ai-generate-annonce"),
    path("scam-check/", ScamCheckView.as_view(), name="ai_scam_check"),
]
