# MyCenter Academy App UI

MyCenter Academy App UIest une interface d'administration Angular pour la gestion des membres de l'académie MyCenter.

---

## 🚀 Fonctionnalités principales

- 🔐 Authentification sécurisée avec gardes (`AuthGuard`, `NoAuthGuard`)
- 🌍 Internationalisation complète avec Transloco
- 🧩 Architecture modulaire avec lazy loading
- 🧭 Navigation centralisée avec `navigation.data.ts`
- 🎨 UI moderne basée sur Tailwind CSS et Fuse Angular
- 🗃️ Gestion utilisateurs, présence, calendrier, tournois et paramètres
- 📊 Modules d'applications métiers : SVault, Veeam 365, IaaS, etc.
- 📱 **Progressive Web App (PWA)** : Installable sur mobile et desktop, fonctionne hors ligne

---

## 🛠️ Lancer le projet en local

### 1. Prérequis

- Node.js (v18+ recommandé)
- Angular CLI (`npm install -g @angular/cli`)
- NVM recommandé pour la gestion de versions Node

### 2. Installation

```bash
npm install
```

### 3. Démarrer le serveur de dev

```bash
ng serve
```

Accès via : [http://localhost:4200](http://localhost:4200)

---

## 🧪 Tests

### Unitaires

```bash
ng test
```

### End-to-End (à configurer)

```bash
ng e2e
```

---

## 🧱 Structure du projet

```
src/
├── app/
│   ├── core/             # Services, auth, icons, i18n, navigation
│   ├── layout/           # Composants de layout et navigation
│   ├── modules/
│   │   └── admin/
│   │       └── apps/     # Fonctionnalités métier
│   ├── app.routes.ts     # Définition des routes principales
│   └── app.component.ts  # Point d'entrée Angular
├── assets/               # Fichiers publics (icônes, favicons)
└── environments/         # Configs env prod/dev
```

---

## 📱 Progressive Web App (PWA)

L'application est entièrement compatible PWA, permettant :

### Installation sur mobile
1. Ouvrez l'application dans votre navigateur mobile (Chrome, Safari, Firefox)
2. Suivez les instructions pour "Ajouter à l'écran d'accueil"
3. L'application s'ouvrira comme une app native

### Fonctionnement hors ligne
- Service Worker intégré pour la mise en cache intelligente
- Accès aux données récemment consultées même sans connexion
- Synchronisation automatique lors de la reconnexion

### Caractéristiques PWA
- Icônes optimisées pour tous les appareils (72x72 à 512x512)
- Thème couleur personnalisé (#1976d2)
- Mode standalone (plein écran sans barre de navigation du navigateur)
- Support iOS avec icônes Apple Touch

---

## 📦 Scripts utiles

- `ng generate component <name>` : Générer un nouveau composant
- `ng build` : Compiler l'application
- `ng lint` : Linter le code (si config ESLint)
- `npm run i18n:extract` : Extraire les traductions (si configuré)

---

## 📄 Licence

Voir `LICENSE.md`.

---

## 🙏 Crédits

Basé sur Angular CLI, Transloco, Tailwind CSS, Fuse Angular.
