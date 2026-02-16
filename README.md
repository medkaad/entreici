# EntreIci — Plateforme d’annonces & messagerie

EntreIci est une application web full-stack permettant à des particuliers de publier des annonces, discuter via messagerie privée et gérer leurs profils.

Projet construit avec **Django REST + React + Docker**.

---

## Fonctionnalités

### Authentification & profils

* Inscription / Connexion sécurisée (JWT)
* Profils publics utilisateurs
* Comptes vérifiés
* Système d’avis (reviews)
* Gestion des favoris

### Annonces

* Création, modification et suppression d’annonces
* Filtrage et recherche
* Réservation d’annonces
* Gestion des statuts

### Messagerie

* Conversations entre utilisateurs
* Envoi de messages privés
* Historique des discussions

---

## Stack technique

### Backend

* Python 3
* Django
* Django REST Framework
* SQLite (développement)
* Tests unitaires

### Frontend

* React
* React Router
* Context API (authentification)
* Tailwind CSS

### DevOps

* Docker
* Docker Compose

---

## Structure du projet

entreici-develop/
│
├── backend/
│ ├── annonces/
│ ├── chat/
│ ├── users/
│ └── config/
│
├── frontend/
└── docker-compose.yml

---

## Lancer le projet avec Docker (recommandé)

### 1. Cloner le projet

```bash
git clone <repo-url>
cd entreici-develop

### 2. Lancer les services
docker compose up --build

### 3. Accéder à l’application
Frontend : http://localhost:3000
Backend API : http://localhost:8000
Admin Django : http://localhost:8000/admin
```