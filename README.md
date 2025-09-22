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
