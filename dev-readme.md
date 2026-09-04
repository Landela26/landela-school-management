# LANDELA — Branche Dev

Branche de développement actif du projet LANDELA.
Toutes les nouvelles fonctionnalités passent par cette branche avant d'être mergées sur `main`.

---

# Environnement de Développement

## Prérequis
- Node.js >= 18
- PHP >= 8.2
- Composer
- MySQL
- Git

---

## Installation

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

---

# Workflow Git

## Règles
- Ne jamais push directement sur `main`
- Toujours partir de `dev` pour créer une feature branch
- Pull Request obligatoire pour merger sur `dev`

## Créer une feature branch
```bash
git checkout dev
git pull origin dev
git checkout -b feature/F01-nom-de-la-feature
```
## Nommage des branches
```bash
feature/F01-student-create
feature/F02-attendance-mark
fix/F01-student-form-bug
```
## Nommage des commits
```bash
feat: création du profil élève
fix: correction du formulaire de présence
refactor: restructuration des composants
chore: mise à jour des dépendances
```
---

# État d'avancement

## Sprint en cours
- [ ] F01 - Création profil élève
- [ ] F02 - Marquage des présences
- [ ] F03 - Gestion du personnel
- [ ] F04 - Intégration NFC

---
# Variables d'environnement

### Frontend (`frontend/.env`)
VITE_API_URL=http://localhost:8000/api

### Backend (`backend/.env`)
APP_NAME=Landela
DB_DATABASE=landela_db
DB_USERNAME=root
DB_PASSWORD=
SANCTUM_STATEFUL_DOMAINS=localhost:5173
---
``
