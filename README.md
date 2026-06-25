# 🌿 QualiSite

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5-gray?logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue?logo=docker)](https://www.docker.com/)


Site vitrine et outil de gestion interne pour l'entreprise **QualiSite** : backend **Express / TypeScript** + frontend **Next.js 16 (React 19)**.  
Développé dans le cadre d'un stage — projet d'apprentissage fullstack.

---

## Fonctionnalités

| Fonctionnalité | Détail |
|---|---|
| 🖼️ Vitrine publique | Présentation des projets réalisés et des services proposés |
| 📬 Formulaire de contact | Envoi de message avec sélection des services souhaités |
| 🔐 Authentification admin | JWT (access + refresh tokens), hashage Argon2 |
| 📁 Gestion des projets | CRUD, upload d'images, publication/dépublication |
| 🛠️ Gestion des services | CRUD avec ordre d'affichage et prix |
| 👥 Gestion des contacts | Suivi du statut (Nouveau → Traité → Archivé → Client) |
| 🧾 Facturation | Génération de factures PDF liées aux clients et services |
| 📧 Notifications email | Envoi via Resend à chaque nouveau contact |

---

## Déploiement (Docker)

C'est la méthode recommandée. Le `docker-compose.yml` lance le frontend (port **3000**), le backend (port **3001**) et une base PostgreSQL (port **5435**).

**1. Configurer l'environnement**

```bash
cp backend/.env.example backend/.env
# Renseigner JWT_SECRET, RESEND_API_KEY, etc.
```

**2. Lancer**

```bash
docker compose up --build -d
```

- Frontend : http://localhost:3000  
- Backend API : http://localhost:3001  
- Base de données : port 5435

---

## Variables d'environnement

| Variable | Obligatoire | Défaut | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | URL de connexion PostgreSQL |
| `JWT_SECRET` | ✅ | — | Clé secrète pour signer les tokens JWT |
| `JWT_ACCESS_EXPIRES_IN` | ❌ | `900` | Durée du token d'accès (en secondes) |
| `JWT_REFRESH_EXPIRES_IN` | ❌ | `604800` | Durée du refresh token (en secondes) |
| `RESEND_API_KEY` | ✅ | — | Clé API Resend pour l'envoi d'emails |
| `RESEND_EMAIL` | ✅ | — | Adresse expéditrice (`contact@qualisite.fr`) |
| `UPLOAD_URL` | ❌ | `http://localhost:3001/uploads` | URL publique des fichiers uploadés |
| `ALLOWED_ORIGINS` | ❌ | `http://localhost:3000` | Origines autorisées (CORS) |
| `PORT` | ❌ | `3001` | Port du backend |

---

## Développement local

### Backend (port 3001)

```bash
cd backend && npm install
npm run dev        # rechargement auto (tsx --watch)
```

Routes disponibles :

| Route | Description |
|---|---|
| `POST /api/auth/login` | Connexion admin |
| `POST /api/auth/refresh` | Renouvellement du token |
| `GET /api/projects` | Liste des projets publiés |
| `GET /api/services` | Liste des services actifs |
| `POST /api/contact` | Soumission du formulaire de contact |
| `GET /api/admin/contacts` | Contacts (admin) |
| `GET /api/admin/projects` | Projets (admin) |
| `GET /api/admin/services` | Services (admin) |

### Frontend (port 3000)

```bash
cd frontend && npm install
npm run dev
```

Ouvrir `http://localhost:3000`.

### Base de données

```bash
cd backend
npm run db:migrate    # Nouvelle migration Prisma
npm run db:seed       # Données de test
npm run db:reset      # Reset complet BDD
```

---

## Structure

```
QualiSite/
├── docker-compose.yml
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Modèle de données
│   │   └── migrations/             # Historique des migrations
│   └── src/
│       ├── app.ts                  # Point d'entrée Express
│       ├── controllers/            # Logique métier (auth, projets, services, contacts)
│       ├── routers/                # Définition des routes
│       ├── middlewares/            # Auth JWT, gestion d'erreurs, validation
│       ├── models/                 # Seeding BDD
│       └── lib/                    # Mailer, upload, token, logger
└── frontend/
    ├── app/
    │   ├── page.tsx                # Page d'accueil (vitrine)
    │   └── admin/                  # Backoffice (login, projets, services, contacts)
    └── components/                 # Composants réutilisables
```

---

## Modèle de données

| Entité | Rôle |
|---|---|
| `User` | Compte admin ou client |
| `Client` | Informations entreprise liées à un User |
| `Project` | Réalisation publiable avec images et services associés |
| `Service` | Prestation proposée (titre, description, prix) |
| `Contact` | Demande entrante via le formulaire public |
| `Message` | Thread de messages lié à un contact |
| `Invoice` | Facture liée à un client |
| `Image` | Fichier image lié à un projet |

---

## Stack

| Couche | Technologie |
|---|---|
| Frontend | Next.js 16 · React 19 · TypeScript · SCSS |
| Backend | Express 5 · Node.js · TypeScript |
| Base de données | PostgreSQL 16 · Prisma ORM |
| Auth | JWT (access + refresh) · Argon2 |
| Email | Resend |
| Upload / Images | Multer · Sharp |
| Tests | Vitest |
| Qualité code | ESLint · Prettier · Husky (pre-commit) |
| Infra | Docker · Docker Compose |
| CI/CD | GitHub Actions |

---

## Licence

Projet de stage — usage interne QualiSite.
