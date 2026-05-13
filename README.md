#  LANDELA — Système de Gestion Scolaire & Pointage NFC

LANDELA est une application web de gestion scolaire et de suivi des présences destinée aux établissements scolaires.

Le système permet de gérer :
- les élèves,
- le personnel,
- les présences,
- ainsi que le pointage automatique via cartes NFC.

L’objectif est de moderniser et simplifier la gestion administrative scolaire grâce à une architecture web moderne basée sur React et Laravel API.

---

#  Objectifs du Projet

LANDELA a pour objectif de :

- faciliter la gestion des élèves,
- gérer les présences et retards,
- automatiser le pointage avec NFC,
- centraliser les données scolaires,
- fournir un suivi en temps réel,
- améliorer l’organisation administrative.

---

#  Fonctionnalités Principales (MVP)

##  Gestion des Élèves
- Création des profils élèves
- Modification des informations
- Affichage des élèves par classe
- Association carte NFC ↔ élève
- Historique des présences

##  Gestion du Personnel
- Gestion des enseignants et employés
- Suivi des présences
- Filtrage par rôle/poste

## 🕒 Gestion des Présences
- Présence
- Absence
- Retard
- Historique des présences
- Calendrier de suivi

## 📡 Intégration NFC
- Lecture des cartes NFC
- Pointage automatique
- Identification rapide des utilisateurs

---

# 🛠️ Stack Technique

## Frontend
- React
- Tailwind CSS
- Axios
- React Router

## Backend
- Laravel API
- Laravel Sanctum
- API REST

## Base de Données
- MySQL

## Outils
- Git & GitHub
- Trello
- Swagger / OpenAPI
- Postman

---

#  Structure du Projet

```bash
landela-school-management/
│
├── frontend/        # Application React
├── backend/         # API Laravel
├── docs/            # Documentation UML, API, SCRUM
├── README.md
```

---

#  Architecture du Système

```text
Carte NFC
   ↓
Lecteur NFC
   ↓
API Laravel
   ↓
Base de données MySQL
   ↓
Dashboard React
```

---

#  Documentation API

La documentation API est gérée avec Swagger/OpenAPI.

Principaux endpoints :
- Authentification
- Élèves
- Personnel
- Présences
- NFC

---

#  Workflow Git

## Branches principales

```bash
main
dev
```

---

## Exemple de Feature Branch

```bash
feature/F01-student-create
feature/F02-attendance-mark
feature/F03-staff-management
```

---

#  Organisation SCRUM

Le projet suit la méthodologie SCRUM.

## Workflow
- Product Backlog
- Sprint Planning
- Développement par fonctionnalités
- Pull Requests
- Code Review

---

#  Installation du Projet

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Backend

```bash
cd backend
composer install
php artisan serve
```

---

#  Règles de Développement

- Code propre et lisible
- Composants React réutilisables
- Respect des conventions API REST
- Respect du nommage Git
- Validation des Pull Requests avant merge
- Commentaires pour les logiques complexes

---

#  Sécurité

- Authentification via Laravel Sanctum
- Protection des routes API
- Validation des données
- Gestion sécurisée du système NFC

---

#  Améliorations Futures (V2)

- Statistiques avancées
- Notifications Email
- Gestion avancée des badges NFC
- Application mobile
- Rapports détaillés

---

#  Collaboration Équipe

Le projet est développé en équipe avec :
- GitHub
- Trello
- Pull Requests
- SCRUM

---

# 📄 Licence

Projet développé dans un cadre éducatif et professionnel.
