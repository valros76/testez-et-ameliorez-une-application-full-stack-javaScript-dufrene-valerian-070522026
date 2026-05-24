# 🧘 Système de Gestion Yoga Studio

Une application web full-stack pour gérer les opérations d'un studio de yoga, incluant la planification des sessions, la gestion des professeurs et l'inscription des utilisateurs.

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
- **Vitest** + Collecteur de couverture **V8**

---

# ✨ Fonctionnalités

## Authentification
- Inscription des utilisateurs
- Connexion des utilisateurs avec jetons JWT

## Gestion des Sessions
- Liste de toutes les sessions de yoga
- Affichage des détails d'une session
- Création de nouvelles sessions (**Admin uniquement**)
- Mise à jour des sessions (**Admin uniquement**)
- Suppression des sessions (**Admin uniquement**)
- Rejoindre/quitter une session (Utilisateurs standards)

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

# 💻 Partie Frontend (Typage Strict)

Afin de respecter les exigences d'un Mode Strict TypeScript (Type-Safe à 100%), une refonte majeure a été menée sur la partie Frontend pour éradiquer tous les types lâches ou implicites.

## Modifications appliquées

### Élimination Radicale du Type `any`

Tous les states React (`useState`) et les signatures de fonctions qui utilisaient explicitement ou implicitement `any` ont été réécrits avec des types stricts issus de `../types` (`RegisterData`, `Session`, `SessionFormData`).

### Sécurisation des Événements du DOM React

Les gestionnaires d'événements ont été typés avec précision en exploitant les types génériques de React au lieu de contourner le compilateur (`ChangeEvent`, `FormEvent`).

### Gestion des Gardes Contre le `null` et l'Asynchronisme

Intégration systématique de vérifications conditionnelles (`if (!user?.id)`) avant le déclenchement des requêtes réseau (`POST`, `PUT`, `DELETE`) et isolation des fonctions de récupération de données à l’intérieur des hooks `useEffect`.

### Résolution des Conflits de Configuration Globale

Résolution de l'erreur `ts(2882)` via l'ajout de métadonnées de modules dans `vite-env.d.ts` et correction de la surcharge défectueuse de l'interface `ViteImportMeta` dans `Profile.tsx`.

---

# ⚙️ Partie Backend (Architecture en Couches & Gestion d'Erreurs)

Afin de respecter les exigences d'une architecture logicielle robuste, scalable et conforme aux bonnes pratiques professionnelles, une refonte majeure a été menée sur la partie Backend.

## Modifications appliquées

### Centralisation de la Gestion des Erreurs

Création de la classe `AppError` et du wrapper de fonctions `catchAsync`.

Cette approche a permis de supprimer 100% des blocs `try/catch` redondants dans les contrôleurs. Toutes les exceptions sont désormais interceptées et unifiées par un `errorMiddleware` global placé en fin de cycle Express.

### Découpage en Architecture N-Tier (3 Couches)

Isolation complète des responsabilités.

Les contrôleurs ne contiennent plus aucune logique métier ni d'accès à la base de données. Les règles métiers (hachage, validations de données, droits d'accès) sont déportées dans la couche Services (`src/services/`) et l'accès direct à l'ORM Prisma est encapsulé dans la couche Repositories (`src/repositories/`).

### Typage Strict Express & Routage Moderne

Résolution des erreurs de conversion `ts(2345)` sur les paramètres d'URL en forçant le typage strict (`as string`) lors de l'utilisation de `parseInt()`.

Modernisation de `src/routes/index.ts` en passant les méthodes de contrôleurs par référence directe pour éliminer les fonctions fléchées incomplètes (`erreurs ts(2554)`).

### Stratégie d'Isolation des Tests (Vitest)

Optimisation de l'infrastructure de test contre les fuites de mémoire provoquées par les mocks.

Le test de `auth.middleware.ts` s'appuie désormais sur un sandboxing applicatif via l'API native `vm` de Node.js, ce qui garantit une exécution étanche et un rapport de couverture V8 fiable à 100% sans collision de cache de modules.

---

# 🌐 Points d'Accès API (Endpoints)

## Authentification

| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Inscrire un nouvel utilisateur |
| POST | `/api/auth/login` | Se connecter et obtenir le jeton JWT |

---

## Sessions

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/session` | Récupérer toutes les sessions (Protégé) |
| GET | `/api/session/:id` | Récupérer une session par son ID (Protégé) |
| POST | `/api/session` | Créer une session (Admin uniquement) |
| PUT | `/api/session/:id` | Modifier une session (Admin uniquement) |
| DELETE | `/api/session/:id` | Supprimer une session (Admin uniquement) |
| POST | `/api/session/:id/participate/:userId` | Rejoindre une session (Protégé) |
| DELETE | `/api/session/:id/participate/:userId` | Quitter une session (Protégé) |

---

## Professeurs

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/teacher` | Récupérer tous les professeurs (Protégé) |
| GET | `/api/teacher/:id` | Récupérer un professeur par son ID (Protégé) |

---

## Utilisateurs

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/user/:id` | Récupérer les données d'un utilisateur (Protégé) |
| DELETE | `/api/user/:id` | Supprimer un compte utilisateur (Protégé) |
| POST | `/api/user/promote-admin` | S'auto-promouvoir Administrateur (Protégé - `NODE_ENV=development` uniquement) |

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
  createdAt DateTime               @default(now())
  updatedAt DateTime               @updatedAt
  sessions  SessionParticipation[]
}

model Teacher {
  id        Int       @id @default(autoincrement())
  firstName String
  lastName  String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  sessions  Session[]
}

model Session {
  id           Int                    @id @default(autoincrement())
  name         String
  date         DateTime
  description  String
  teacherId    Int
  teacher      Teacher                @relation(fields: [teacherId], references: [id])
  createdAt    DateTime               @default(now())
  updatedAt    DateTime               @updatedAt
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

# ⚙️ Scripts de Développement

## Backend

```bash
npm run dev
```

Lance le serveur de développement avec nodemon.

```bash
npm run build
```

Compile le TypeScript en JavaScript.

```bash
npm start
```

Démarre le serveur de production.

```bash
npm run prisma:generate
```

Génère le client Prisma.

```bash
npm run prisma:migrate
```

Exécute les migrations de base de données.

```bash
npm run prisma:seed
```

Injecte les données initiales.

```bash
npm run prisma:studio
```

Ouvre l'interface graphique Prisma Studio.

```bash
npm run test:coverage
```

Exécute la suite séquentielle de tests et compile la couverture V8.

---

## Frontend

```bash
npm run dev
```

Lance le serveur de développement Vite.

```bash
npm run build
```

Compile l'application pour la production.

```bash
npm run preview
```

Prévisualise le build de production localement.

---

# 🧪 Tests & Couverture de Code

Le projet intègre une suite robuste de tests automatisés gérée par Vitest.

## Tests Unitaires

Validation des services isolés, des dépôts Prisma, du middleware d'erreur et du middleware d'authentification (évalué via sandbox).

## Tests d'Intégration

Validation de bout en bout du comportement des contrôleurs et des endpoints de l'API.

---

## Exécuter toute la suite de tests avec rapport de couverture

Depuis le dossier `backend`, exécutez le script d'isolation séquentiel :

```bash
npm run test:coverage

# ou avec Bun
bun run test:coverage
```

Ce script orchestre l'exécution isolée des tests unitaires pour le moteur V8, puis enchaîne sur les tests d'intégration sans écraser ni polluer le cache de couverture.

---

## Exécuter manuellement une suite ciblée

```bash
# Tests Unitaires uniquement
npx vitest run tests/unit/

# Tests d'Intégration uniquement
npx vitest run tests/integration/
```

---

# 🔍 Dépannage (Troubleshooting)

## Problème de connexion à la base de données

```bash
# Vérifier si le conteneur PostgreSQL tourne
docker ps

# Redémarrer le conteneur PostgreSQL
docker-compose restart postgres

# Consulter les fichiers de logs du conteneur
docker-compose logs postgres
```

---

## Ports réseau déjà utilisés (8080 ou 3000)

```bash
# Identifier le processus qui occupe le port 8080
lsof -i :8080

# Tuer le processus problématique
kill -9 <PID>
```

---

## Problèmes liés à Prisma

```bash
# Réinitialiser entièrement la base
# Attention : supprime toutes les données !
npx prisma migrate reset

# Regénérer proprement le client Prisma
npx prisma generate
```

---

# 📝 Licence

Ce projet est sous licence **MIT**.