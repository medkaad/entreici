# 🏡 EntreIci — Marketplace locale solidaire (IA + anti-arnaque)

EntreIci est une plateforme web full-stack permettant aux habitants d’une même ville de publier des annonces, discuter via messagerie privée et s’entraider localement.

Le projet intègre :
- 🤖 Génération d’annonces avec IA locale (offline)
- 🛡️ Détection automatique des annonces frauduleuses
- 👵 Mode **Senior friendly**
- 💬 Messagerie privée
- ⭐ Système d’avis & réputation

Projet construit avec **Django REST + React + Docker + IA locale (Ollama)**.

---

# ✨ Fonctionnalités principales

## 🔐 Authentification & profils
- Inscription / Connexion sécurisée (JWT)
- Profils publics utilisateurs
- Comptes vérifiés & badges
- Système d’avis (reviews)
- Score de confiance utilisateur

---

## 🧾 Annonces locales
- Création / modification / suppression d’annonces
- Filtrage par ville et quartier
- Réservation d’annonces
- Workflow : active → en cours → terminée
- Gestion des favoris

---

## 🤖 IA locale (offline)
Fonctionne **sans OpenAI / sans coût** grâce à **Ollama**.

### ✨ Génération d’annonce assistée
L’utilisateur écrit 1–2 phrases → l’IA génère :
- titre optimisé
- description claire
- catégorie
- type d’annonce
- suggestion de prix

Endpoint :
```
POST /api/ai/annonce/
```

---

## 🛡️ Détection automatique des arnaques
Chaque annonce est analysée automatiquement :

Analyse détecte :
- numéros de téléphone
- emails
- liens externes
- paiements hors plateforme
- mots clés suspects (PayPal Friends, Western Union, IBAN…)

### Niveaux de risque
| Niveau | Action |
|---|---|
| 🟢 low | publication normale |
| 🟡 medium | avertissement utilisateur |
| 🔴 high | publication bloquée |

Stocké en base :
```
scam_score
scam_level
```

Badge visible sur les annonces :
- ⚠️ À vérifier
- 🚨 Risque arnaque

Endpoint :
```
POST /api/ai/scam-check/
```

---

## 💬 Messagerie privée
- Conversations liées aux annonces
- Messages automatiques (réservation, fin mission)
- Historique complet

---

## ⭐ Système d’avis
Après une mission terminée :
- L’utilisateur peut laisser une note (1–5)
- Mise à jour automatique :
  - score
  - nombre d’avis
  - badge utilisateur

---

## 👵 Mode Senior Friendly
Mode accessible activable globalement :
- Boutons XXL
- Contrastes élevés
- Textes plus grands
- Navigation simplifiée
- Messages explicatifs

Toggle global persistant (localStorage).

---

# 🧱 Stack technique

## Backend
- Python 3
- Django
- Django REST Framework
- JWT Auth
- SQLite (dev)
- Tests unitaires

## Frontend
- React
- React Router
- Context API (auth)
- Tailwind CSS

## IA locale
- Ollama
- Llama3

## DevOps
- Docker
- Docker Compose

---

# 📁 Structure du projet

```
entreici/
│
├── backend/
│   ├── annonces/
│   ├── chat/
│   ├── users/
│   ├── ai/
│   └── config/
│
├── frontend/
└── docker-compose.yml
```

---

# 🚀 Lancer le projet (Docker)

## 1️⃣ Cloner le repo
```bash
git clone https://github.com/medkaad/entreici.git
cd entreici
```

---

## 2️⃣ Lancer les services
```bash
docker compose up --build
```

Services démarrés :
- Frontend → http://localhost:3000
- Backend → http://localhost:8000
- Admin Django → http://localhost:8000/admin
- IA Ollama → http://localhost:11434

---

## 3️⃣ Télécharger le modèle IA
Dans un nouveau terminal :

```bash
docker compose exec ollama ollama pull llama3
```

---

## 4️⃣ Appliquer migrations
```bash
docker compose exec backend python manage.py migrate
```

---

# 🧪 Tests rapides

### Tester IA génération
```
POST /api/ai/annonce/
{
  "draft": "Je propose réparer ordinateur"
}
```

### Tester anti-arnaque
```
POST /api/ai/scam-check/
{
  "title": "Paiement PayPal Friends",
  "description": "Envoyez acompte + WhatsApp 06..."
}
```

---

# 🔮 Roadmap
- Modération admin des annonces suspectes
- Recherche intelligente par IA
- Assistant chat pour seniors
- Notifications temps réel

---

# 👨‍💻 Auteur
Projet portfolio – Développeur Full-Stack  
Stack : Django • React • Docker • IA locale

---

# 📜 Licence
Projet éducatif / portfolio.
