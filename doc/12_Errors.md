---
id: 12_errors
title: Gestion et Centralisation des Erreurs
sidebar_label: 12. Errors
---

# 12. Gestion et Centralisation des Erreurs

Ce document détaille le système centralisé de gestion, normalisation et affichage des erreurs de l'application Kolybri.

---

## Architecture et Principes Clés

Le système repose sur un flux uni-directionnel absolu :

1. **Couche Réseau (`fetchApi.ts` & `errorNormalizer.ts`)** : Intercepte toutes les erreurs HTTP et codes retour EcoleDirecte pour les convertir sous forme de types discriminés TypeScript.
2. **Store Volatil (`useErrorStore.ts`)** : Centralise les erreurs actives en mémoire avec un mécanisme automatique de dédoublonnage (10 secondes) et de mise à jour des horodatages.
3. **Sentinelles UI (`NetworkBanner.tsx`, `ErrorToast.tsx`)** : Affichent de manière réactive les erreurs selon leur sévérité.
4. **React ErrorBoundary & Crash View (`ErrorBoundary.tsx`, `CrashScreen.tsx`)** : Interceptent les crashs fatals du composant React et les exceptions JS globales non gérées pour proposer un redémarrage propre de l'application.

---

## 1. Modèle de Données et Types (`src/types/errors.ts`)

```typescript
export interface NetworkAppError {
    type: "network";
    message: string;
    isRetryable: true;
    originalError?: unknown;
}

export interface ApiBusinessAppError {
    type: "api-business";
    code: number;
    message: string;
    feature?: string;
    isRetryable?: boolean;
}

export interface AuthAppError {
    type: "auth";
    reason: "invalid_credentials" | "session_expired";
    code: number;
    message: string;
}

export interface UnknownAppError {
    type: "unknown";
    message: string;
    endpoint?: string;
    originalError?: unknown;
}

export type AppError =
    NetworkAppError | ApiBusinessAppError | AuthAppError | UnknownAppError;

export interface EnrichedAppError {
    id: string;
    timestamp: number;
    durationMs?: number | null; // null = persistant jusqu'à action utilisateur
    error: AppError;
}
```

---

## 2. Dictionnaire des Codes API (`src/constants/api/codes.js`)

Le dictionnaire regroupe les correspondances entre les codes de retour d'EcoleDirecte et leurs explications en français lisibles :

- **`250`** : Authentification à deux facteurs requise (A2F).
- **`505` / `522`** : Identifiant et/ou mot de passe invalide.
- **`520` / `525`** : Token invalide ou expiré (connexion requise).
- **`403`** : Limites d'appel d'API atteintes.
- **`517`** : Version d'API périmée.
- **`535`** : Établissement fermé ou indisponible.
- **`40129`** : Format JSON de la requête invalide.

La fonction `getApiMessage(code)` permet de traduire un code en message explicatif affichable.

---

## 3. Normalisation des Erreurs (`src/services/errorNormalizer.ts`)

Le normaliseur prend n'importe quel échec (erreur réseau, réponse API non-200 ou erreur inattendue) et retourne une structure `AppError` normalisée :

- **`normalizeApiError(code, message)`** : Convertit les codes 505/522 en `AuthAppError`, et les codes métiers en `ApiBusinessAppError`.
- **`normalizeNetworkError(error)`** : Marque l'erreur en `NetworkAppError`.
- **`createUnknownError(error, endpoint)`** : Fallback pour toute erreur indéfinie.

---

## 4. Store Centralisé Volatil (`src/hooks/useErrorStore.ts`)

Store Zustand non-persistant (`create<ErrorState>()`) qui gère l'état global des erreurs :

- **`pushError(error, durationMs)`** : Empile une erreur. Si l'erreur est un doublon dans une fenêtre de 10s, elle met à jour son timestamp au lieu de se dupliquer.
- **`dismissError(id)`** : Supprime une erreur spécifique par son ID.
- **`clearNetworkErrors()`** : Purge toutes les erreurs réseau (ex: au retour de la connexion WiFi/4G).
- **`clearAll()`** : Purge toutes les erreurs actives.

---

## 5. Composants UI & Sentinelles

### A. `NetworkBanner.tsx`

- S'affiche en haut de l'écran lorsque le réseau est coupé ou qu'une `NetworkAppError` est présente dans le store.
- Masquage automatique au rétablissement du réseau avec animation Reanimated fluide.

### B. `ErrorToast.tsx`

- Notification flottante en bas d'écran avec animations Reanimated à 120 FPS.
- Centrage vertical dynamique selon la taille du contenu.
- Cliquer sur le toast l'agrandit pour révéler :
    - La description de l'erreur (`ErrorDescription`).
    - Le code numérique et sa signification (`ErrorDetails` + `getApiMessage`).
    - Des boutons d'action universels : **"Réessayer"** (relance la requête TanStack Query / rafraîchit) et **"Ignorer"** (ferme le toast).

### C. `ErrorBoundary.tsx` & `CrashScreen.tsx`

- **`ErrorBoundary.tsx`** : Composant de classe React enveloppant la navigation dans `AuthNavigator.jsx`.
    - Intercepte les crashs de rendu JSX ainsi que 100% des exceptions JS globales via `ErrorUtils.setGlobalHandler`.
    - Effectue un `useErrorStore.getState().clearAll()` et relance l'application à chaud via `DevSettings.reload()` lors du clic sur le bouton de redémarrage.
- **`CrashScreen.tsx`** (`src/screens/Crash/CrashScreen.tsx`) : Écran complet de crash affichant l'icône d'alerte, un message explicatif et un `<ScrollView>` adaptatif (`flexGrow: 0`, `maxHeight: "60%"`, `contentContainerStyle={{ padding: 12 }}`) permettant de consulter les stack traces très longues sans tronquage.

