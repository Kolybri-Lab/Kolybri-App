---
id: 02_repository_structure
title: Structure du repo
sidebar_label: 02. Repository Structure
---

# 02. Structure du Depot

Ce document definit l'organisation des fichiers et dossiers de l'application Kolybri. Tout contributeur doit respecter cette arborescence pour maintenir le projet homogene et lisible.

---

## Architecture Globale

Le projet est structure selon une architecture hybride combinant des modules centraux et des modules par fonctionnalite (features). Tout le code source applicatif se trouve dans le dossier `src/`.

```text
ecole-directe-plus/
├── assets/             # Ressources statiques (fonts, images, lottie)
├── docs/               # Fichiers de documentation numerotes (ce dossier)
├── ios/ & android/     # Dossiers natifs generes par Expo
├── src/                 # Code source de l'application
└── tsconfig.json       # Configuration TypeScript du projet

```

---

## Organisation du dossier `src/`

Pour éviter la surcharge des répertoires globaux, le code est séparé entre les éléments globaux (partagés) et les modules spécifiques (features).

### 1. Composants Globaux (`src/components/`)

Contient uniquement les composants graphiques génériques et réutilisables dans l'ensemble de l'application, classés par catégorie :

- `core/` : Composants de base et abstractions de structure (Layouts bruts comme `Text` et `Stack` unifié).
- `display/` : Éléments visuels simples (Gradients, séparateurs, titres).
- `error/` : Composants de sentinelles et notifications d'erreur (`NetworkBanner.tsx`, `ErrorToast.tsx`, `ErrorBoundary.tsx`).
- `feedback/` : Indicateurs de chargement, spinners, Overlays.
- `form/` : Éléments d'interaction et de formulaire (CheckBox, Inputs).
- `layout/` : Structures de conteneurs complexes (ScrollViews, BottomSheet, Onboarding).
- `modal/` : Fenêtres contextuelles globales.
- `svg/` : Icônes, badges et logos vectoriels dynamiques (regroupés par thèmes `badges/`, `logos/`, `icons/`, `navigation/` avec des points d'entrée Barrel `index.js`).

### 2. Modules Applicatifs (`src/features/`)

Chaque grande fonctionnalité d'Ecole Directe (Notes, Devoirs, Emploi du temps, Messagerie) regroupe sa propre logique métier dans un sous-dossier de feature dédié. Un dossier de feature comprend :

- `resolver/` : Couche d'adaptation réseau et de mapping de données brutes d'API vers nos modèles (ex: `grades.js`).
- `models/` : Classes et structures de données métier (ex: `Grade.js`, `Discipline.js`).
- `components/` : Composants graphiques exclusifs à ce module (ex: `HomeworkCard.jsx`).
- `context/` : États partagés du module (React Context).
- `hooks/` : Logique métier isolée et locale (ex: `useSimulation.js`).
- `utils/` : Fonctions d'aide et de calcul pur spécifiques au domaine de la feature (ex: `streaks.js`, `averages.js`).

### 3. Dossiers Communs (`src/`)

- `constants/` : Configurations de l'API Ecole Directe, codes d'erreur et variables globales de l'appareil.
- `hooks/` : Hooks React globaux partagés par plusieurs modules (gestion du réseau, du thème ou des stores Zustand comme `useUserStore.ts`).
- `router/` : Configuration de la navigation React Navigation / Expo Router (navigateurs d'authentification et gestion des onglets clients).
- `screens/` : Pages principales de l'application appelées directement par le routeur. Elles agissent comme des conteneurs de haut niveau.
- `services/` : Couche réseau gérant les requêtes HTTP brutes et l'authentification (`authService.js`).
- `types/` : Fichiers de définitions de types TypeScript globaux (`.ts`).
- `utils/` : Fonctions pures utilitaires partagées globales (cryptographie, formatage de dates génériques, manipulations JSON).

---

## Principes de Conception (Feature-Driven Architecture)

L'application utilise une architecture orientée fonctionnalités (**Feature-Driven Architecture**). Ce choix implique plusieurs principes fondamentaux à respecter :

### 1. Haute Cohésion et Localité du Code

Tous les fichiers concourant à une même fonctionnalité métier (ex: les notes scolaires) sont stockés physiquement dans le même dossier (`src/features/grades/`).

- **Maintenance facilitée** : Un développeur travaillant sur les notes n'a pas à naviguer dans l'arborescence globale ; tout le contexte (UI locale, hooks, modèles, resolvers) est regroupé.
- **Cycle de vie clair** : Si une fonctionnalité doit être supprimée ou réécrite, il suffit de supprimer son répertoire de feature.

### 2. Gestion de la Duplication (DRY vs Cohesion)

Pour éviter de réinventer la roue tout en conservant le cloisonnement des features :

- **`src/components/` (Kit UI global)** : Contient les composants génériques, sans logique métier (ex: boutons, structures d'alignement, entrées de formulaire, icônes vectorielles). Ils forment le _Design System_ de l'application.
- **`src/features/[feature]/components/`** : Contient des composants spécifiques à la fonctionnalité qui ne seront jamais réutilisés ailleurs (ex: `HomeworkCard`).

### 3. Isolation de l'API Externe (Resolvers vs Utils)

- **La couche `resolver/`** (couplage fort) : Traduit et nettoie les clés d'API brutes d'EcoleDirecte pour les adapter sous forme de modèles métier propres à l'application. C'est le seul endroit de la feature qui connaît les structures de données externes.
- **La couche `utils/` ou `models/`** (calculs purs) : Contient la logique algorithmique et métier pure (ex: calcul des streaks de notes). Ce code ne manipule que nos modèles formatés et est totalement déconnecté de la structure brute de l'API.

---

## Regles de Nommage et Extensions

### 1. Extensions des fichiers

Dans le cadre de la transition vers du code entierement type et securise, les regles suivantes sont appliquees :

- `.tsx` : Obligatoire pour tout nouveau fichier contenant du JSX (Composants graphiques, Screens).
- `.ts` : Obligatoire pour toute logique pure (Hooks, Utils, Services, Types).
- _Note : Les fichiers `.js` et `.jsx` existants doivent etre migres vers TypeScript lors de chaque modification majeure effectuee sur ces derniers._

### 2. Casse des fichiers

- `PascalCase` : Applique aux composants graphiques et aux ecrans (ex: `HomeScreen.tsx`, `LoadingSpinner.tsx`).
- `camelCase` : Applique aux fichiers de logique, hooks, services et utilitaires (ex: `useHomeworks.ts`, `date.ts`).

