---
id: 14_timetable
title: Emploi du temps
sidebar_label: 02. Timetable
---

# Feature Timetable (Emploi du temps)

La feature **Timetable** gère l'affichage complet de l'emploi du temps de l'élève, la mise en page des cours avec leurs couleurs thématiques, le calcul dynamique des hauteurs et positions, la virtualisation légère du scroll vertical, le décompte du temps ainsi que la navigation vers les détails d'un cours.

---

## 1. Exportation & Point d'entrée Public (`src/features/timetable/index.ts`)

Pour respecter l'isolation des fonctionnalités (**Feature-Driven Architecture**), tous les composants externes accèdent à la feature uniquement via son point d'entrée public `src/features/timetable/index.ts` :

```ts
export { useTimetable } from "./hooks/useTimetable";
export * from "./types";
```

---

## 2. Modèle de Données & Typage (`src/features/timetable/types.ts`)

Le typage définit la structure des données reçues depuis l'API ÉcoleDirecte et leur formatage interne pour Kolybri :

- **`ApiTimetableCourse`** : Structure brute renvoyée par le serveur ÉcoleDirecte (`start_date`, `end_date`, `prof`, `salle`, `codeMatiere`, `isAnnule`, `dispense`, etc.).
- **`CourseTime`** : Représente une date et une heure séparées (`{ date: "YYYY-MM-DD", time: "HH:mm" }`).
- **`FormattedCourse`** : Modèle nettoyé et enrichi pour le composant UI (contient `webId`, `libelle`, `teacher`, `room`, `color`, `textColor`, ainsi que `placing` et `height` sous forme de pourcentages).
- **`TimetableDay`** : Représente une journée complète (`date`, `iSODate`, `isJustNoon`, `courses`).
- **`TimetableResolverParams`** : Paramètres d'entrée du resolver (`token`, `offset`).

---

## 3. Algorithmes & Resolver

La conversion entre le serveur externe et nos composants d'interface est assurée par le resolver et ses utilitaires algorithmiques.

### Resolver principal (`src/features/timetable/resolver/timetable.ts`)

- Reçoit un `token` et un `offset` de semaine (ex: `0` pour cette semaine, `1` pour la prochaine, `-1` pour la précédente).
- Calcule le lundi de la semaine demandée via `getPreviousMonday` et `addDaysToDateString`.
- Envoie une requête POST à `https://api.ecoledirecte.com/v3/E/{USER_ID}/emploidutemps.awp` sur une période exacte de 7 jours (lundi au dimanche).
- En cas de vacances ou de réponse vide, fait appel à `fillHolidays` pour générer automatiquement une journée spéciale `"CONGÉS"`.
- Transmet les cours à `sortedTimetable` pour le calcul de layout.

### Utilitaires de Layout (`src/features/timetable/utils/layout.js`)

- **`convertData`** : Attribue un identifiant unique `webId`, associe chaque matière à une couleur via `useColorStore`, calcule le contraste du texte (`textColor` clair/sombre), et trie les cours chronologiquement.
- **`sizeTimetable` & `getTimePercentage`** : Calcule le positionnement en pourcentage (`placing`) et la hauteur (`height`) de chaque cours en fonction du premier et dernier cours de la journée. Gère également le flag `isJustNoon` (cours se terminant avant midi).
- **`otherEdits`** : Génère le libellé de date lisible en français (`iSODate`, ex: _"Lundi 12 Octobre"_).

### Gestion des Vacances (`src/features/timetable/utils/holidays.js`)

- **`fillHolidays`** : Génère des objets `TimetableDay` de remplacement pour les jours où aucun cours n'est prévu, affichant un bloc `"CONGÉS"`.

---

## 4. Hook & Store de Données de la Feature (`src/features/timetable/hooks/useTimetable.ts`)

Le hook **`useTimetable`** constitue la couche d'accès aux données de la feature. Il encapsule la logique React Query, la gestion de l'état des offsets et l'agrégation des semaines.

### Interface & Signature

```ts
function useTimetable(token: string): {
    data: TimetableDay[];
    extendForward: () => void;
    extendBackward: () => void;
    resetRange: () => void;
    isLoading: boolean;
    isError: boolean;
    range: { min: number; max: number };
};
```

### Rôle des propriétés retournées

- **`data`** : Tableau de toutes les journées de cours fusionnées, dédoublonnées et triées par date chronologique.
- **`extendForward()`** : Méthode pour demander le chargement de la semaine suivante (augmente `range.max`). Protégée par un guard si la dernière requête est en cours de chargement.
- **`extendBackward()`** : Méthode pour demander le chargement de la semaine précédente (diminue `range.min`). Protégée par un guard si la première requête est en cours de chargement.
- **`resetRange()`** : Réinitialise la plage aux 3 semaines réelles initiales (`{ min: -1, max: 1 }`).
- **`isLoading`** : `true` si au moins une requête de semaine est en cours de chargement.
- **`isError`** : `true` si au moins une requête de semaine a échoué.
- **`range`** : Objet représentant les bornes actuelles des offsets de semaines chargées (`min` et `max`).

---

## 5. Mécanique de Persistance, Scroll Infini & Virtualisation

| Type                  | Semaines concernées                                                                                 | Stratégie de stockage                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Persistées** 🔒     | Offset `-1` (semaine précédente)<br>Offset `0` (semaine courante)<br>Offset `1` (semaine prochaine) | Sauvegardées sur disque via MMKV (`shouldDehydrateQuery`). Disponibles immédiatement au démarrage hors-ligne. |
| **Non-persistées** ☁️ | Tous les autres offsets (`<-1` ou `>1`)                                                             | Conservées uniquement en mémoire de session. Disparaissent au redémarrage de l'app.                           |

### Configuration dans `QueryProvider.tsx`

```ts
shouldDehydrateQuery: (query) => {
    if (query.queryKey[0] === "timetable") {
        const offset = query.queryKey[1];
        const isPersistableOffset = offset === -1 || offset === 0 || offset === 1;
        return isPersistableOffset && query.state.status === "success";
    }
    return defaultShouldDehydrateQuery(query);
};
```

### Optimisations du Scroll Infini & Virtualisation Légère

1. **Virtualisation Fenêtrée (`isVisible`)** :
    - Seules 5 journées consécutives sont physiquement rendues à l'écran (`Math.abs(index - currentIndex) <= 2` : jour courant + 2 avant + 2 après).
    - Les journées hors fenêtre retournent un conteneur `<View>` totalement vide de même hauteur, réduisant la charge processeur/mémoire à ~0 ms pour les jours éloignés.

2. **Ajustement Instantané sans Saut (`adjustForPrepend`)** :
    - Suivi de la première date du tableau via `prevFirstDateRef`.
    - Lors d'un _prepend_ (insertion de jours passés au début du tableau), `adjustForPrepend(addedAtStart)` est appelé pour ajuster simultanément `pageIndex` et `translateY.value` de $-N \times \text{height}$. Le décalage visuel reste exactement de **0 pixel**, éliminant tout clignotement ou affichage de la mauvaise page.

3. **Réconciliation par Clé Unique Date (`key={currentDay.date}`)** :
    - Chaque `DayShedule` est identifié par sa date ISO (`currentDay.date`), permettant à React d'effectuer une réconciliation optimale des composants lors de l'extension du tableau.

---

## 6. Dépendances de la Feature

La feature s'appuie sur un ensemble d'éléments externes (stores, composants UI du kit global et librairies).

### A. Stores Externes

- **`useColorStore` (`src/hooks/useColorStore.ts`)** : Attribution dynamique des couleurs de matières basées sur le Nombre d'Or avec stockage persistant MMKV.
- **`useUserStore` (`src/hooks/useUserStore.ts`)** : Fournit le token d'authentification de l'utilisateur pour les requêtes API.
- **`useTabPadding` (`src/hooks/useTabPadding.ts`)** : Calcul des espacements de sécurité en bas d'écran (TabBar).

### B. Composants Globaux / Kit UI

- **`VerticalScrollView` (`src/components/layout/VerticalScrollView.jsx`)** : Composant de défilement vertical custom par page avec détection de geste Reanimated. Expose `scrollToIndex` et `adjustForPrepend` via `useImperativeHandle`. Annule les animations en cours au toucher (`onStart`), positionne directement sans `withSpring` pendant le drag (`onUpdate`) et calcule le snap par vitesse/distance (`onEnd`).
- **`CustomTopHeader` & `SwipeBackWrapper` (`src/components/index.js`)** : Header de retour et conteneur de balayage pour fermer la fiche de cours.
- **`Text` (`src/components/core/index.ts`)** : Composant typographique standard du Design System Kolybri.
- **Icônes Vectorielles (`src/components/svg/index.js`)** : `RoadFinish`, `Clock`, `DoorOpen`, `Hourglass`, `Peoples`, `Person`, `Trash`, `PenSquare`, `BellOff`.

### C. Librairies Tierces

- **`@tanstack/react-query` & `@tanstack/react-query-persist-client`** : Gestion du cache réseau et persistance MMKV.
- **`react-native-reanimated` & `react-native-gesture-handler`** : Animations fluides et gestes de swipe.
- **`@react-navigation/native` & `@react-navigation/native-stack`** : Navigation stack et hooks `useFocusEffect`, `useNavigation`, `useTheme`.
- **`dayjs`** : Manipulations chronologiques et calculs de décomptes de temps.

---

## 7. Présentation des Écrans (`src/screens/Client/Timetable/`)

La feature comprend **3 composants d'écran complémentaires** :

```
TimetableScreen (Navigator)
 ├── TimetableContent (Vue principale - Carousel vertical de jours)
 └── CourseDetails (Détails d'un cours sélectionné)
```

### A. `TimetableScreen.jsx` (Navigator de la Feature)

- Composé d'un `NativeStackNavigator`.
- Gère la navigation entre la vue principale `TimetableContent` (route par défaut) et la fiche de détails `CourseDetails` avec animation de glissement (`slide_from_right`).

### B. `TimetableContent.jsx` (Vue Principale & Scroll Infini)

- **Carousel Vertical (`VerticalScrollView`)** : Chaque jour occupe 100% de la hauteur de l'écran avec un système de swipe à la "TikTok".
- **Bandeau Header & Date** : Affiche la date du jour affiché (`activeDate`). Un _long-press_ sur la bulle de date ramène l'utilisateur directement au jour d'aujourd'hui.
- **Gestion de la Stabilité du Scroll** : Utilise `prevFirstDateRef` et `adjustForPrepend` pour absorber l'insertion de jours passés (prepend) avec zéro pixel de saut visuel.
- **Virtualisation par Fenêtre Glissante** : Calcule `isVisible` ($\pm 2$ jours autour du jour actif) pour alléger l'arbre React Native.
- **Extensions automatiques** : Déclenche `extendForward()` à 4 jours de la fin et `extendBackward()` à 4 jours du début.
- **Reset au Blur** : Réinitialise la plage mémoire aux 3 semaines réelles lorsqu'on quitte l'écran via `useFocusEffect`.

### C. `CourseDetails.jsx` (Fiche de Détails d'un Cours)

- Accessible au clic sur n'importe quelle boîte de cours dans `TimetableContent`.
- **Décompte dynamique temps réel** : Calcule et rafraîchit chaque seconde le temps restant avant le début du cours (_"Dans 2 heures 15 minutes"_ ou _"Il y a 30 minutes"_).
- **Indicateurs de Statut** : Affiche des badges et icônes spécifiques si le cours est **Annulé** (`Trash`), **Modifié** (`PenSquare`) ou **Dispensé** (`BellOff`).
- **Informations Complémentaires** : Affiche la durée totale (`Hourglass`), l'enseignant (`Person`), la salle (`DoorOpen`) et le groupe (`Peoples`).

---

## 8. Présentation des Composants Locaux

Les composants visuels spécifiques à la feature sont déclarés au sein de `TimetableContent.jsx` et enveloppés par `React.memo` pour maximiser les performances de rendu :

### A. `DayShedule` (`React.memo`)

- Conteneur d'une journée complète d'emploi du temps.
- Reçoit la propriété `isVisible`. Si `false`, retourne une simple `<View>` vide ajustée à la hauteur de l'écran. Si `true`, rend tous les cours de la journée et mesure les dimensions du conteneur parent (`timetableViewDims`).

### B. `CourseBox` (`React.memo`)

- Carte visuelle d'un cours individuel avec fond coloré et bordures adaptées au thème.
- Gère la détection du chevauchement de la salle et du nom du cours (`overlap`).
- Affiche le badge d'annulation/dispense en superposition en cas de modification.
- Déclenche la navigation vers `CourseDetails` lors d'un clic.

