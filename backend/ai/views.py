import json
import os
import requests

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .serializers import AIGenerateAnnonceSerializer


def _safe_json_loads(text: str):
    """Essaye d'extraire un JSON même si le modèle met du texte autour."""
    if not text:
        return None
    text = text.strip()

    # cas parfait
    try:
        return json.loads(text)
    except Exception:
        pass

    # essayer d'extraire le premier bloc {...}
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        chunk = text[start : end + 1]
        try:
            return json.loads(chunk)
        except Exception:
            return None

    return None


class AIGenerateAnnonceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AIGenerateAnnonceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        draft = serializer.validated_data["draft"].strip()

        # ✅ FIX: forcer ponctuation pour aider le modèle
        if not draft.endswith((".", "!", "?")):
            draft += "."

        ville = serializer.validated_data.get("ville", "")
        quartier = serializer.validated_data.get("quartier", "")
        type_hint = serializer.validated_data.get("type_hint", "")
        category_hint = serializer.validated_data.get("category_hint", "")
        price_hint = serializer.validated_data.get("price_hint", "")

        #  Modèle Ollama (gratuit) — contrôlé via .env
        model = os.environ.get("OLLAMA_MODEL", "llama3.2:1b")

        system = (
            "Tu es un assistant pour une marketplace locale entre particuliers, seniors friendly.\n"
            "Tu transformes un brouillon en annonce claire, courte, rassurante.\n"
            "Langage simple, phrases courtes.\n"
            "Tu dois répondre UNIQUEMENT en JSON valide (sans texte avant/après)."
        )

        user_prompt = f"""
Brouillon utilisateur:
\"\"\"{draft}\"\"\"

Contexte (si fourni):
- Ville: {ville}
- Quartier: {quartier}
- Indices: type_hint={type_hint}, category_hint={category_hint}, price_hint={price_hint}

Retourne un JSON strict avec ces clés EXACTES:
{{
  "title": "string (max 70)",
  "description": "string (max 700, simple, liste possible)",
  "type": "one of: service_offer | service_request | item_sale | item_request | urgent_help",
  "category": "string (max 40)",
  "price": number|null,
  "is_urgent": true|false
}}

Règles:
- Si le prix est inconnu, mets null.
- Si c'est clairement une urgence, is_urgent=true et type=urgent_help.
- category doit être simple (ex: Informatique, Jardinage, Bricolage, Aide à domicile, Transport, etc.).
- Ne mets aucun texte hors du JSON.
""".strip()

        try:
            # ✅ Appel IA interne Docker : service "ollama"
            r = requests.post(
                "http://ollama:11434/api/generate",
                json={
                    "model": model,
                    "prompt": f"{system}\n\n{user_prompt}",
                    "stream": False,
                    "options": {
                        "temperature": 0.3
                    },
                },
                timeout=180,
            )

            if r.status_code != 200:
                return Response(
                    {"detail": f"Erreur Ollama: {r.status_code} - {r.text}"},
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            result_text = r.json().get("response", "") or ""
            data = _safe_json_loads(result_text)

            if not data:
                return Response(
                    {
                        "detail": "Réponse IA non exploitable (pas du JSON).",
                        "raw": result_text[:400],
                    },
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            # ---- Nettoyage / garde-fous ----
            title = (data.get("title") or "")[:70].strip()
            description = (data.get("description") or "")[:700].strip()
            annonce_type = (data.get("type") or "service_offer").strip()
            category = (data.get("category") or "")[:40].strip()
            is_urgent = bool(data.get("is_urgent", False))

            price = data.get("price", None)
            if price == "" or price is False:
                price = None
            if isinstance(price, str):
                try:
                    price = float(price.replace(",", "."))
                except Exception:
                    price = None
            if isinstance(price, (int, float)) and price < 0:
                price = None

            allowed_types = {
                "service_offer",
                "service_request",
                "item_sale",
                "item_request",
                "urgent_help",
            }
            if annonce_type not in allowed_types:
                annonce_type = "service_offer"

            return Response(
                {
                    "title": title or "Annonce",
                    "description": description or draft,
                    "type": annonce_type,
                    "category": category or "Autre",
                    "price": price,
                    "is_urgent": is_urgent,
                },
                status=status.HTTP_200_OK,
            )

        except requests.Timeout:
            return Response(
                {"detail": "Timeout: l’IA met trop de temps à répondre."},
                status=status.HTTP_504_GATEWAY_TIMEOUT,
            )
        except Exception as e:
            return Response(
                {"detail": f"Erreur IA: {str(e)}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )
