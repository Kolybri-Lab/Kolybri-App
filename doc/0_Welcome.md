---
id: 01_Welcome
title: Bienvenue
sidebar_label: 01. Welcome
---

# Bienvenue sur le projet Colybri !

Ce document définit la façon dont vous pouvez contribuer au projet. Il est important de le lire attentivement avant de commencer à contribuer.

PS : Dans un éditeur de code comme VSCode pensez à faire Ctrl+Maj+V pour visionner le rendu de la doc.

---

## 🚀 Installation rapide

1. **Dépôt officiel** : Rendez-vous sur le GitHub officiel : [Kolybri-Lab/EcoleDirectePlus-Mobile](https://github.com/Kolybri-Lab/EcoleDirectePlus-Mobile)
2. **Fork** : Forkez le dépôt sur votre compte GitHub personnel.
3. **Clonage** : Clonez votre fork localement et installez les dépendances :
    ```bash
    git clone https://github.com/VOTRE_NOM_DUTILISATEUR/EcoleDirectePlus-Mobile.git
    cd EcoleDirectePlus-Mobile
    npm install
    ```

---

## 📱 Utilisation de l'aperçu de développement (Dev)

Pour tester l'application directement sur votre appareil :

1. **Téléchargement de l'application de développement** :
   Téléchargez l'application cliente sur votre téléphone Android depuis le lien suivant : https://github.com/Kolybri-Lab/Build-Dev-Expo/releases/tag/Build (il faudra parfois désactiver les sécurité de votre téléphone pour installer l'app).
2. **Lancement du serveur Expo** :
   Depuis la racine du projet dans votre terminal, exécutez la commande suivante :
    ```bash
    npx expo start
    ```
3. **Connexion** :
   Scannez le QR Code affiché dans votre terminal à l'aide de l'application installée à l'étape 1 en veillant à être sur le même réseau local (souvent le même wifi suffit).

---

## 🤝 Participation au projet

Le dépôt officiel est structuré autour de deux branches principales :

- `main` : Contient la version stable de production.
- `develop` : Branche d'intégration pour les nouvelles fonctionnalités et corrections.

> [!IMPORTANT]
> Pour participer, soumettez vos Pull Requests exclusivement depuis votre fork vers la branche `develop` du dépôt officiel. Toute PR ciblant `main` directement sera refusée.

