# 🛑 Stop Repeat

> **Application familiale de gestion des tâches, récompenses et responsabilisation des enfants.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-ff69b4)](https://lovable.dev)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

---

## 📖 À propos

**Stop Repeat** est une application web pensée pour les familles souhaitant instaurer une routine positive pour leurs enfants. Elle permet aux parents de créer des tâches récurrentes, de suivre leur réalisation, d'attribuer des récompenses et d'appliquer des pénalités éducatives — le tout dans une interface ludique et motivante.

L'application a été **principalement vibe-codée avec [Lovable](https://lovable.dev)**, qui a généreusement rendu sa plateforme gratuite lors de l'événement **International Women's Day #SheBuilds** 💜.

---

## ✨ Fonctionnalités

### 👨‍👩‍👧‍👦 Gestion familiale
- **Création de foyer** avec code d'invitation pour rejoindre la famille
- **Multi-profils** : parents et enfants sur un même compte
- **Changement de profil** rapide (Account Switcher) avec code PIN de sécurité
- **Impersonation parentale** : un parent peut consulter le tableau de bord d'un enfant

### ✅ Tâches et routines
- **Modèles de tâches** récurrentes (quotidiennes, hebdomadaires, jours de semaine, week-end, personnalisé)
- **Instances de tâches** générées automatiquement chaque jour
- **Workflow de validation** : l'enfant marque la tâche comme faite → le parent valide ou rejette
- **Preuve photo** optionnelle pour certaines tâches
- **Rappels automatiques** via notifications push
- **Calendrier familial** pour visualiser les tâches sur la semaine/mois

### 🏆 Récompenses et motivation
- **Système de points** : chaque tâche validée rapporte des points
- **Boutique de récompenses** créée par les parents, échangeables contre des points
- **Niveaux et progression** (XP, barres de progression)
- **Badges** déblocables avec célébrations animées
- **Streak (série)** : bonus de points pour les jours consécutifs sans pénalité
- **Objectifs d'épargne** : l'enfant peut économiser pour un objectif à long terme
- **Portefeuille virtuel** avec conversion points → monnaie réelle (configurable)

### ⚠️ Pénalités éducatives
- **Règles de la maison** définies par les parents
- **Application de pénalités** avec commentaire et historique complet
- **Seuil d'alerte** configurable (nombre de pénalités par jour)
- **Impact sur les points et le portefeuille**

### 📊 Suivi et statistiques
- **Graphiques hebdomadaires** : tâches complétées, points gagnés, pénalités
- **Historique d'activité** détaillé (tâches, récompenses, pénalités)
- **Tableau de bord parent** avec vue d'ensemble de tous les enfants
- **Tableau de bord enfant** avec progression personnelle

### 🔔 Notifications
- **Notifications push** (Web Push via Service Worker)
- **Rappels de tâches** automatiques avant l'heure limite
- **Centre de notifications** intégré avec badge de compteur

### 🌍 Internationalisation
- **Français** et **Anglais** entièrement supportés
- Détection automatique de la langue du navigateur
- Sélecteur de langue dans la navbar et les paramètres

### 🎨 Interface utilisateur
- **Thème clair / sombre** avec bascule
- **Design responsive** (mobile, tablette, desktop)
- **Animations et célébrations** (confettis, badges, montée de niveau)
- **Éditeur d'avatar** pour personnaliser les profils
- **Composants shadcn/ui** pour une UI cohérente et accessible

### 💳 Monétisation
- **Plan gratuit** : 1 parent, 1 enfant
- **Plan Famille** (10€ unique) : 2 parents, enfants illimités, statistiques avancées, calendrier
- **Paiement Stripe** intégré
- **Codes d'activation** pour offrir le plan premium

### 🔐 Sécurité
- **Authentification email/mot de passe** avec vérification d'email
- **OAuth** (Google, Apple) via Lovable Cloud
- **Row Level Security (RLS)** sur toutes les tables
- **Rôles séparés** (table `user_roles`) pour éviter l'escalade de privilèges
- **Code PIN** pour le changement de profil
- **Suppression de compte** avec confirmation

---

## 🏗️ Architecture technique

### Stack

| Couche | Technologie |
|---|---|
| **Frontend** | React 18, TypeScript 5, Vite 5 |
| **UI** | Tailwind CSS 3, shadcn/ui, Radix UI, Lucide Icons |
| **State** | TanStack React Query, React Context |
| **Backend** | Lovable Cloud (Supabase) |
| **Auth** | Supabase Auth + Lovable Cloud Auth |
| **Paiement** | Stripe (via Edge Functions) |
| **i18n** | i18next + react-i18next |
| **Graphiques** | Recharts |

### Structure du projet

```
src/
├── assets/              # Images (logo, illustrations)
├── components/
│   ├── auth/            # Formulaires login, signup, reset password
│   ├── dashboard/       # Composants du tableau de bord (parent & enfant)
│   ├── landing/         # Sections de la page d'accueil
│   └── ui/              # Composants shadcn/ui réutilisables
├── hooks/               # Hooks métier (useAuth, useTasks, useRewards…)
├── i18n/                # Fichiers de traduction (fr.json, en.json)
├── integrations/        # Clients Supabase et Lovable (auto-générés)
├── pages/               # Pages de l'application (routes)
└── lib/                 # Utilitaires (cn, helpers)

supabase/
└── functions/           # Edge Functions (paiement, notifications, reset…)
```

### Base de données

Les tables principales :

- `families` — Foyers familiaux avec plan et code d'invitation
- `profiles` — Profils utilisateurs liés à une famille
- `user_roles` — Rôles (parent/enfant) séparés pour la sécurité
- `task_templates` — Modèles de tâches récurrentes
- `task_instances` — Instances quotidiennes de tâches
- `rewards` / `reward_redemptions` — Récompenses et échanges
- `house_rules` / `penalties_log` — Règles et pénalités
- `child_stats` / `child_badges` — Points, niveaux, badges
- `savings_goals` — Objectifs d'épargne
- `notifications` / `device_tokens` — Notifications push
- `family_settings` — Paramètres personnalisables par famille

---

## 🚀 Installation locale

### Prérequis

- [Node.js](https://nodejs.org/) ≥ 18 (recommandé : via [nvm](https://github.com/nvm-sh/nvm))
- npm ou bun

### Lancement

```bash
# 1. Cloner le dépôt
git clone https://github.com/votre-org/stop-repeat.git
cd stop-repeat

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`.

### Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement avec hot reload |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualisation du build |
| `npm run test` | Lancer les tests (Vitest) |
| `npm run lint` | Vérification ESLint |

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/ma-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout de ma fonctionnalité'`)
4. Pushez (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une Pull Request

---

## 📄 Licence

Ce projet est distribué sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👤 Auteur

**Nicolas BODAINE**

Projet offert au nom de l'association **TutoTech** 🎓

---

## 💜 Remerciements

- **[Lovable](https://lovable.dev)** — Cette application a été principalement vibe-codée grâce à Lovable, qui a généreusement rendu sa plateforme gratuite lors de l'**International Women's Day #SheBuilds**. Merci pour cette initiative inspirante !
- **[shadcn/ui](https://ui.shadcn.com/)** — Pour les composants UI élégants et accessibles
- **[Supabase](https://supabase.com/)** — Pour l'infrastructure backend open-source
- **[TutoTech](https://tutotech.fr)** — Association au service de l'inclusion numérique
