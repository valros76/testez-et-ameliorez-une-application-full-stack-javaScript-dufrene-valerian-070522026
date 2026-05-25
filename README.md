# 🧘 Système de Gestion Yoga Studio

Une application web full-stack de pointe pour gérer les opérations d'un studio de yoga, incluant la planification des sessions, la gestion des professeurs et l'inscription des utilisateurs.

---

# 🛠️ Stack Technique

## Backend

- **Node.js 22 LTS** ou **Bun**
- **Express.js 4.x**
- **TypeScript 5.4+** (Mode Strict)
- **Prisma ORM**
- **PostgreSQL 16**
- **Zod** (validation)
- **JWT** (authentification)
- **bcrypt** (hachage des mots de passe)

## Frontend

- **React 19** (Hooks uniquement)
- **TypeScript 5.9+** (Mode Strict)
- **Vite 7.x**
- **TailwindCSS 4.x**
- **React Router 6.x**
- **Axios**

## Infrastructure & Outillage de Test

- **Docker + Docker Compose** (PostgreSQL)
- **Vitest** + Collecteur de couverture **V8** (Tests Unitaires & Intégration - Front & Back)
- **Cypress 13+** (Tests End-to-End)

---

# ✨ Fonctionnalités

## Authentification

- Inscription des utilisateurs
- Connexion des utilisateurs avec jetons JWT et gestion des payloads d'authentification

## Gestion des Sessions

- Liste de toutes les sessions de yoga avec affichage dynamique selon les droits d'accès
- Affichage détaillé d'une session (date, enseignant, nombre de participants, description)
- Création de nouvelles sessions (**Admin uniquement**)
- Mise à jour des sessions (**Admin uniquement**)
- Suppression des sessions (**Admin uniquement**)
- Rejoindre / quitter une session (Utilisateurs standards uniquement)

## Professeurs

- Affichage de la liste des professeurs
- Affichage des détails d'un professeur

## Profil Utilisateur

- Profil utilisateur détaillé
- Suppression du compte utilisateur
- Promotion automatique en tant qu'administrateur (Uniquement en environnement de développement)

---

# 📋 Prérequis

- Node.js 22 LTS / Bun ou supérieur
- Docker et Docker Compose
- npm, yarn ou bun

---

# 🚀 Installation et Configuration au Lancement

Suis ces étapes pour configurer et lancer le projet localement en prenant en compte les récentes optimisations et l'environnement strict de TypeScript.

## 1. Cloner le dépôt et accéder au dossier

```bash
git clone <url-du-depot>
cd p4-dfsjs-starter
```

---

## 2. Configurer les variables d'environnement (Backend)

Crée un fichier `.env` dans le répertoire `backend` :

```bash
cd backend
cp .env.example .env
```

La configuration par défaut est préconfigurée pour fonctionner avec Docker Compose :

```env
DATABASE_URL="postgresql://yogauser:yogapass@localhost:5432/yogastudio"
JWT_SECRET="your-secret-key-change-me-in-production"
PORT=8080
NODE_ENV=development
```

---

## 3. Installer les dépendances du Backend

```bash
npm install

# ou avec Bun
bun install
```

---

## 4. Installer et configurer les dépendances du Frontend

Bascule dans le dossier `frontend`, installe les modules et assure-toi que l'environnement global TypeScript est correctement configuré.

```bash
cd ../frontend
npm install

# ou avec Bun
bun install
```

⚠️ **Ajustement Suite aux Modifications :**

Pour éviter l'erreur de build `ts(2882)` liée aux imports de feuilles de style comme `index.css` ou aux variables d'environnement de Vite, un fichier de déclarations globales est requis.

Vérifie ou crée le fichier `src/vite-env.d.ts` avec le contenu suivant :

```ts
/// <reference types="vite/client" />

declare module '*.css';
```

---

# 🏗️ Initialisation de la Base de Données

Depuis la racine du projet, démarre l'instance PostgreSQL via Docker :

```bash
docker-compose up -d
```

Accède ensuite au dossier `backend` pour exécuter les migrations Prisma :

```bash
cd backend
npm run prisma:migrate
```

Injecte les données de test (Seed) dans la base :

```bash
npm run prisma:seed
```

Ceci génère automatiquement :

- 1 compte administrateur
- 1 compte utilisateur standard
- 3 professeurs
- 4 sessions

---

# 💻 Exécution de l'Application

## Démarrer le Backend (Terminal 1)

```bash
cd backend
npm run dev
```

L'API sera accessible sur :

```txt
http://localhost:8080
```

---

## Démarrer le Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Le serveur de développement Vite lancera l'application sur :

```txt
http://localhost:3000
```

---

# 🔐 Identifiants par Défaut

## Compte Administrateur

```txt
yoga@studio.com / test!1234
```

## Compte Utilisateur Standard

```txt
user@test.com / test!1234
```

---

# 📈 Liste des Modifications Apportées (Refontes Strictes)

# 💻 Partie Frontend (Typage Strict & Nettoyage Flux)

Afin de respecter les exigences d'un Mode Strict TypeScript (Type-Safe à 100%), une refonte majeure a été menée sur la partie Frontend pour éradiquer tous les types lâches ou implicites.

## Élimination Radicale du Type `any`

Tous les states React (`useState`) et les signatures de fonctions ont été réécrits avec des types stricts (`RegisterData`, `Session`, etc.).

## Sécurisation des Événements du DOM React

Utilisation des types génériques `ChangeEvent` et `FormEvent` de React sur l'ensemble des formulaires (`SessionForm`, `Login`, `Register`).

## Gestion des Gardes Contre le `null`

Intégration systématique de vérifications conditionnelles (`if (!user?.id)`) avant les requêtes réseau.

## Résolution des Conflits de Configuration

Ajout des métadonnées de modules dans `vite-env.d.ts` pour corriger l'erreur `ts(2882)`.

## Restauration de la Clarté des Logs de Test

Implémentation d'espions de console :

```ts
vi.spyOn(console, 'error').mockImplementation()
```

Cette approche masque les traces d'erreurs d'API simulées volontairement lors de la validation des blocs `catch`, gardant le terminal de test propre et lisible.

---

# ⚙️ Partie Backend (Architecture en Couches & Gestion d'Erreurs)

Afin de respecter les exigences d'une architecture robuste, une refonte majeure a été menée sur le Backend.

## Centralisation de la Gestion des Erreurs

Création de la classe `AppError` et du wrapper `catchAsync` pour supprimer 100% des blocs `try/catch` redondants.

## Découpage en Architecture N-Tier (3 Couches)

Isolation stricte des responsabilités entre :

- Contrôleurs
- Services
- Repositories

## Typage Strict Express

Résolution des erreurs de conversion `ts(2345)` sur les paramètres d'URL (`parseInt + as string`).

## Stratégie d'Isolation des Tests (Vitest)

Sandboxing via l'API native `vm` de Node.js pour une exécution étanche et un rapport de couverture V8 fiable.

---

# 🌐 Points d'Accès API (Endpoints)

| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Inscrire un nouvel utilisateur |
| POST | `/api/auth/login` | Se connecter |
| GET | `/api/session` | Récupérer toutes les sessions (Protégé) |
| GET | `/api/session/:id` | Récupérer une session par son ID |
| POST | `/api/session` | Créer une session (Admin uniquement) |
| PUT | `/api/session/:id` | Modifier une session (Admin uniquement) |
| DELETE | `/api/session/:id` | Supprimer une session (Admin uniquement) |
| POST | `/api/session/:id/participate/:userId` | Rejoindre une session |
| DELETE | `/api/session/:id/participate/:userId` | Quitter une session |
| GET | `/api/teacher` | Récupérer tous les professeurs |
| GET | `/api/teacher/:id` | Récupérer un professeur par son ID |
| GET | `/api/user/:id` | Récupérer les données utilisateur |
| DELETE | `/api/user/:id` | Supprimer un compte |

---

# 🗃️ Schéma de la Base de Données (Prisma)

```prisma
model User {
  id        Int                    @id @default(autoincrement())
  email     String                 @unique
  firstName String
  lastName  String
  password  String
  admin     Boolean                @default(false)
  sessions  SessionParticipation[]
}

model Teacher {
  id        Int       @id @default(autoincrement())
  firstName String
  lastName  String
  sessions  Session[]
}

model Session {
  id           Int                    @id @default(autoincrement())
  name         String
  date         DateTime
  description  String
  teacherId    Int
  teacher      Teacher                @relation(fields: [teacherId], references: [id])
  participants SessionParticipation[]
}

model SessionParticipation {
  sessionId Int
  userId    Int

  session   Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([sessionId, userId])
}
```

---

# 🧪 Tests & Couverture de Code

L'application intègre une suite de tests automatisés couvrant les composants de bout en bout et garantissant l'absence de régression.

---

# 1. Tests Unitaires & Intégration (Vitest + V8)

Les tests valident le fonctionnement isolé et intégré des services, routes, composants UI de formulaires et hooks.

## Seuil requis

- Minimum de 80% de couverture sur :
  - Statements
  - Branches
  - Functions
  - Lines

## Performance mesurée (Frontend)

- ~87.35% de couverture globale
- 100% sur les services critiques d'authentification

---

## Exécuter la couverture sur le Backend

```bash
cd backend
npm run test:coverage
```

---

## Exécuter la couverture sur le Frontend

```bash
cd frontend
bun run test:coverage
```

---

# 2. Tests End-to-End (Cypress)

Les scénarios E2E simulent avec précision les comportements réels sur l'ensemble des parcours de l'application, en séparant rigoureusement les privilèges applicatifs exigés par le plan de test.

## Scénarios Utilisateur Standard

Validation complète :

- Tunnel d'authentification
- Affichage du flux de sessions
- Workflow de participation
- Mise à jour dynamique de l'état graphique
- Désinscription d'une session

## Scénarios Administrateur

Validation de :

- L'affichage exclusif des fonctionnalités de gestion
- La visibilité du bouton de création
- La présence des boutons `Edit` et `Delete`
- Le masquage des fonctionnalités utilisateur standards

---

## Lancer Cypress (Interface Graphique)

```bash
cd frontend
npx cypress open
```

---

## Exécuter Cypress (Mode Headless)

```bash
cd frontend
npx cypress run
```

---

# 📝 Licence

Ce projet est sous licence **MIT**.