# 🧘 Système de Gestion Yoga Studio

Une application web full-stack pour gérer les opérations d'un studio de yoga, incluant la planification des sessions, la gestion des professeurs et l'inscription des utilisateurs.

---

## 🛠️ Stack Technique

### Backend
* **Node.js 22 LTS**
* **Express.js 4.x**
* **TypeScript 5.4+** (Mode Strict)
* **Prisma ORM**
* **PostgreSQL 16**
* **Zod** (validation)
* **JWT** (authentification)
* **bcrypt** (hachage des mots de passe)

### Frontend
* **React 19** (Hooks uniquement)
* **TypeScript 5.9+** (Mode Strict)
* **Vite 7.x**
* **TailwindCSS 4.x**
* **React Router 6.x**
* **Axios**

### Infrastructure
* **Docker + Docker Compose**
* Conteneur PostgreSQL

---

## ✨ Fonctionnalités

### Authentification
* Inscription des utilisateurs
* Connexion des utilisateurs avec jetons JWT

### Gestion des Sessions
* Liste de toutes les sessions de yoga
* Affichage des détails d'une session
* Création de nouvelles sessions (**Admin uniquement**)
* Mise à jour des sessions (**Admin uniquement**)
* Suppression des sessions (**Admin uniquement**)
* Rejoindre/quitter une session (Utilisateurs standards)

### Professeurs
* Affichage de la liste des professeurs
* Affichage des détails d'un professeur

### Profil Utilisateur
* Profil utilisateur détaillé
* Suppression du compte utilisateur

---

## 📋 Prérequis

* Node.js 22 LTS ou supérieur
* Docker et Docker Compose
* npm ou yarn

---

## 🚀 Installation et Configuration au Lancement

Suis ces étapes pour configurer et lancer le projet localement en prenant en compte les récentes optimisations et l'environnement strict de TypeScript.

### 1. Cloner le dépôt et accéder au dossier
git clone <url-du-depot>
cd p4-dfsjs-starter

### 2. Configurer les variables d'environnement (Backend)
Crée un fichier .env dans le répertoire backend :

cd backend
cp .env.example .env

La configuration par défaut est préconfigurée pour fonctionner avec Docker Compose :

DATABASE_URL="postgresql://yogauser:yogapass@localhost:5432/yogastudio"
JWT_SECRET="your-secret-key-change-me-in-production"
PORT=8080
NODE_ENV=development

### 3. Installer les dépendances du Backend
npm install

### 4. Installer et configurer les dépendances du Frontend
Bascule dans le dossier frontend, installe les modules et assure-toi que l'environnement global TypeScript est correctement configuré.

cd ../frontend
npm install

⚠️ Ajustement Suite aux Modifications : Pour éviter l'erreur de build ts(2882) liée aux imports de feuilles de style comme index.css ou aux variables d'environnement de Vite, un fichier de déclarations globales est requis.

Vérifie ou crée le fichier src/vite-env.d.ts avec le contenu suivant :

/// <reference types="vite/client" />
declare module '*.css';

---

## 🏗️ Initialisation de la Base de Données

Depuis la racine du projet, démarre l'instance PostgreSQL via Docker :

docker-compose up -d

Accède au dossier backend pour exécuter les migrations Prisma :

cd backend
npm run prisma:migrate

Injecte les données de test (Seed) dans la base :

npm run prisma:seed

Ceci génère automatiquement : 1 compte administrateur, 1 compte utilisateur standard, 3 professeurs et 4 sessions.

---

## 💻 Exécution de l'Application

### Démarrer le Backend (Terminal 1)
cd backend
npm run dev

L'API sera accessible sur http://localhost:8080

### Démarrer le Frontend (Terminal 2)
cd frontend
npm run dev

Le serveur de développement Vite lancera l'application sur http://localhost:3000

---

## 🔐 Identifiants par Défaut

* **Compte Administrateur :** yoga@studio.com / test!1234
* **Compte Utilisateur Standard :** user@test.com / test!1234

---

## 📈 Liste des Modifications Apportées (Refonte Frontend & Typage)

Afin de respecter les exigences d'un Mode Strict TypeScript (Type-Safe à 100%), une refonte majeure a été menée sur la partie Frontend pour éradiquer tous les types lâches ou implicites. Voici le détail des modifications appliquées :

### 1. Élimination Radicale du Type any
Tous les states React (useState) et les signatures de fonctions qui utilisaient explicitement ou implicitement any ont été réécrits avec des types stricts issus de ../types.

* **Register.tsx :** Le state formData est désormais typé avec l'interface RegisterData.
* **Sessions.tsx & SessionDetail.tsx :** Les listes et entités uniques utilisent désormais exclusivement le type structurel Session.
* **SessionForm.tsx :** Création d'une interface locale dédiée SessionFormData pour contrôler les champs éditables du formulaire.

### 2. Sécurisation des Événements du DOM React
Les gestionnaires d'événements ont été typés avec précision en exploitant les types génériques de React au lieu de contourner le compilateur :

* handleChange dans les formulaires utilise désormais ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>.
* handleSubmit est strictement lié à FormEvent<HTMLFormElement>.

### 3. Gestion des Gardes Contre le null et l'Asynchronisme
* Intégration systématique de vérifications conditionnelles (if (!user?.id)) avant le déclenchement des requêtes réseau (POST, PUT, DELETE) pour parer aux comportements imprévus si la session utilisateur expire.
* Isolation des fonctions de récupération de données (fetchSession, fetchTeachers) à l’intérieur des hooks useEffect pour stabiliser le cycle de vie des composants et éviter les dépendances de rendu instables.

### 4. Résolution des Conflits de Configuration Globale
* **Erreur ts(2882) (Import CSS) :** Résolue via l'ajout de métadonnées de modules dans vite-env.d.ts.
* **Erreur ts(2430) (Interface ViteImportMeta) :** Suppression de l'ancienne surcharge locale défectueuse dans Profile.tsx au profit de l'injection native des types clients de Vite (/// <reference types="vite/client" />), permettant l'utilisation transparente et sécurisée de import.meta.env.DEV.

---

## 🌐 Points d'Accès API (Endpoints)

### Authentification
* POST /api/auth/register - Inscrire un nouvel utilisateur
* POST /api/auth/login - Se connecter et obtenir le jeton JWT

### Sessions
* GET /api/session - Récupérer toutes les sessions (Protégé)
* GET /api/session/:id - Récupérer une session par son ID (Protégé)
* POST /api/session - Créer une session (Admin uniquement)
* PUT /api/session/:id - Modifier une session (Admin uniquement)
* DELETE /api/session/:id - Supprimer une session (Admin uniquement)
* POST /api/session/:id/participate/:userId - Rejoindre une session (Protégé)
* DELETE /api/session/:id/participate/:userId - Quitter une session (Protégé)

### Professeurs
* GET /api/teacher - Récupérer tous les professeurs (Protégé)
* GET /api/teacher/:id - Récupérer un professeur par son ID (Protégé)

### Utilisateurs
* GET /api/user/:id - Récupérer les données d'un utilisateur (Protégé)
* DELETE /api/user/:id - Supprimer un compte utilisateur (Protégé)

---

## 🗃️ Schéma de la Base de Données (Prisma)

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

---

## ⚙️ Scripts de Développement

### Backend
* `npm run dev` : Lance le serveur de dev avec nodemon
* `npm run build` : Compile le TypeScript en JavaScript
* `npm start` : Démarre le serveur de production
* `npm run prisma:generate` : Génère le client Prisma
* `npm run prisma:migrate` : Exécute les migrations de base de données
* `npm run prisma:seed` : Injecte les données initiales
* `npm run prisma:studio` : Ouvre l'interface graphique Prisma Studio

### Frontend
* `npm run dev` : Lance le serveur de développement Vite
* `npm run build` : Compile l'application pour la production
* `npm run preview` : Prévisualise le build de production localement

---

## 🧪 Tests

Le projet intègre une suite de tests automatisés :

* **Tests Unitaires :** Validation des composants isolés et des utilitaires.
* **Tests d'Intégration :** Validation du comportement des endpoints de l'API.
* **Tests End-to-End (E2E) :** Validation des parcours utilisateurs critiques.

Exécute les scripts de tests correspondants à l'aide de la commande `npm run test` dans chaque dossier respectif.

---

## 🔍 Dépannage (Troubleshooting)

### Problème de connexion à la base de données
# Vérifier si le conteneur PostgreSQL tourne
docker ps

# Redémarrer le conteneur PostgreSQL
docker-compose restart postgres

# Consulter les fichiers de logs du conteneur
docker-compose logs postgres

### Ports réseau déjà utilisés (8080 ou 3000)
# Identifier le processus qui occupe le port 8080
lsof -i :8080

# Tuer le processus problématique
kill -9 <PID>

### Problèmes liés à Prisma
# Réinitialiser entièrement la base (Attention : supprime toutes les données !)
npx prisma migrate reset

# Regénérer proprement le client Prisma
npx prisma generate

---

## 📝 Licence

Ce projet est sous licence MIT.