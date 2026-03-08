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

## ☁️ Hébergement sur Microsoft Azure (auto-hébergement sans Lovable)

Ce tutoriel détaillé vous guide **pas à pas** pour déployer votre propre instance de Stop Repeat sur **Microsoft Azure**, en remplacement complet de Lovable Cloud. Il est rédigé pour les **débutants** — chaque étape est expliquée.

### 📋 Vue d'ensemble de l'architecture cible

| Composant | Service Azure / Tiers |
|---|---|
| **Frontend (SPA React)** | Azure Static Web Apps |
| **Base de données PostgreSQL** | Supabase (self-hosted ou cloud) OU Azure Database for PostgreSQL |
| **Authentification** | Supabase Auth (auto-hébergé) |
| **Edge Functions** | Azure Functions (Node.js / Deno) |
| **Stockage fichiers (photos)** | Azure Blob Storage |
| **Paiement** | Stripe (inchangé) |
| **Notifications push** | Votre propre serveur ou Azure Functions |
| **DNS / Domaine** | Azure DNS ou votre registrar |

> **⚠️ Important** : L'application utilise actuellement Lovable Cloud (qui s'appuie sur Supabase). Pour migrer, vous devez remplacer **trois éléments clés** :
> 1. L'hébergement du frontend (remplacé par Azure Static Web Apps)
> 2. Le backend Supabase (auto-hébergé ou Supabase cloud gratuit)
> 3. L'authentification OAuth Lovable (`@lovable.dev/cloud-auth-js`) qui doit être remplacée par l'OAuth natif de Supabase

---

### 📝 Étape 0 — Prérequis

Avant de commencer, assurez-vous d'avoir :

1. **Un compte Microsoft Azure** — [Créer un compte gratuit](https://azure.microsoft.com/free/) (200$ de crédits offerts pendant 30 jours)
2. **Azure CLI** installé sur votre machine :
   ```bash
   # macOS
   brew install azure-cli

   # Windows (winget)
   winget install Microsoft.AzureCLI

   # Linux (Ubuntu/Debian)
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```
3. **Node.js ≥ 18** installé ([télécharger](https://nodejs.org/))
4. **Git** installé
5. **Un compte GitHub** (Azure Static Web Apps se connecte à GitHub pour le CI/CD)
6. **Un compte Stripe** avec vos clés API ([dashboard.stripe.com](https://dashboard.stripe.com))
7. **Un projet Supabase** — soit [Supabase Cloud](https://supabase.com) (gratuit), soit [auto-hébergé](https://supabase.com/docs/guides/self-hosting)

---

### 📝 Étape 1 — Créer votre projet Supabase externe

L'application dépend fortement de Supabase (base de données, auth, edge functions, storage). Vous avez **deux options** :

#### Option A : Supabase Cloud (recommandé pour les débutants)

1. Allez sur [app.supabase.com](https://app.supabase.com) et créez un compte
2. Cliquez **« New Project »**
3. Choisissez un nom (ex: `stop-repeat`), un mot de passe pour la base, et une région **Europe West** (pour la latence)
4. Une fois le projet créé, allez dans **Settings → API** et notez :
   - `Project URL` → c'est votre `VITE_SUPABASE_URL`
   - `anon public` key → c'est votre `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `service_role` key → gardez-la secrète, elle sera utilisée dans les Edge Functions

#### Option B : Supabase auto-hébergé sur un VPS / VM Azure (utilisateurs avancés)

Si vous souhaitez un contrôle total sans dépendre de Supabase Cloud, vous pouvez auto-héberger Supabase sur une **VM Azure** (ou tout autre VPS : OVH, Hetzner, DigitalOcean, etc.) avec Docker Compose. Cela demande plus de travail mais vous donne une indépendance complète.

> **⚠️ Prérequis** : Être à l'aise avec Linux, SSH, Docker et la configuration réseau. Prévoyez ~1-2h de setup.

**B.1 — Créer une VM Azure :**

```bash
# Créer un groupe de ressources
az group create --name rg-supabase --location westeurope

# Créer la VM (Ubuntu 22.04, taille B2s minimum — 2 vCPU, 4 Go RAM)
az vm create \
  --resource-group rg-supabase \
  --name vm-supabase \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard

# Ouvrir les ports nécessaires
az vm open-port --resource-group rg-supabase --name vm-supabase --port 80 --priority 1001
az vm open-port --resource-group rg-supabase --name vm-supabase --port 443 --priority 1002
az vm open-port --resource-group rg-supabase --name vm-supabase --port 8000 --priority 1003
```

> **💡 Taille de VM** : `Standard_B2s` (2 vCPU, 4 Go RAM) est le **minimum absolu** pour faire tourner Supabase. Pour un usage familial (~10 utilisateurs), c'est suffisant. Pour plus de confort, choisissez `Standard_B2ms` (8 Go RAM). Coût : ~15-30€/mois.
>
> **💡 Autre VPS** : Si vous n'utilisez pas Azure, créez simplement un VPS Ubuntu 22.04 avec au minimum 4 Go de RAM chez votre hébergeur préféré (OVH VPS, Hetzner, DigitalOcean Droplet, etc.) et passez directement à l'étape B.2.

**B.2 — Se connecter à la VM et installer Docker :**

```bash
# Récupérer l'IP publique de la VM (Azure uniquement)
az vm show --resource-group rg-supabase --name vm-supabase -d --query publicIps -o tsv

# Se connecter en SSH
ssh azureuser@VOTRE_IP_PUBLIQUE

# Sur la VM : Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker (méthode officielle recommandée)
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin git

# Ajouter votre user au groupe docker (évite de taper sudo à chaque fois)
sudo usermod -aG docker azureuser

# Déconnectez-vous et reconnectez-vous pour que ça prenne effet
exit
ssh azureuser@VOTRE_IP_PUBLIQUE

# Vérifiez que Docker fonctionne
docker --version
docker compose version
```

**B.3 — Cloner et configurer Supabase :**

```bash
# Cloner le repo officiel de Supabase
git clone --depth 1 https://github.com/supabase/supabase.git
cd supabase/docker

# Copier le fichier d'environnement
cp .env.example .env
```

Éditez le fichier `.env` avec `nano .env` et configurez ces valeurs **critiques** :

```env
############
# Secrets — CHANGEZ OBLIGATOIREMENT CES VALEURS !
############

# Clé JWT secrète — Générez-en une avec : openssl rand -base64 32
JWT_SECRET=votre-cle-jwt-secrete-de-32-caracteres-minimum

# Clé anon (utilisée côté client) — voir B.3bis ci-dessous pour la générer
ANON_KEY=eyJhbG...votre_anon_key

# Clé service_role (admin, ne jamais exposer côté client) — voir B.3bis
SERVICE_ROLE_KEY=eyJhbG...votre_service_role_key

# Mot de passe PostgreSQL — Générez avec : openssl rand -base64 24
POSTGRES_PASSWORD=un-mot-de-passe-tres-solide

# Dashboard Supabase (interface web d'administration)
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=un-autre-mot-de-passe-solide

############
# URLs — Adaptez à votre domaine ou IP
############

# L'URL publique de votre instance (IP de la VM ou votre domaine)
SITE_URL=https://supabase.votre-domaine.com
API_EXTERNAL_URL=https://supabase.votre-domaine.com
SUPABASE_PUBLIC_URL=https://supabase.votre-domaine.com

# Si vous n'avez pas encore de domaine, utilisez temporairement l'IP :
# SITE_URL=http://VOTRE_IP_PUBLIQUE:8000

############
# SMTP — OBLIGATOIRE pour les emails d'authentification (voir B.6)
############
SMTP_ADMIN_EMAIL=admin@votre-domaine.com
SMTP_HOST=smtp.votre-fournisseur.com
SMTP_PORT=587
SMTP_USER=votre-email@votre-domaine.com
SMTP_PASS=votre-mot-de-passe-smtp
SMTP_SENDER_NAME=Stop Repeat
```

**B.3bis — Générer les clés JWT `ANON_KEY` et `SERVICE_ROLE_KEY` :**

> **⚠️ Étape critique** : Les clés `ANON_KEY` et `SERVICE_ROLE_KEY` sont des JWT signés avec votre `JWT_SECRET`. Vous **devez** les générer vous-même. Voici comment faire :

1. **D'abord**, choisissez votre `JWT_SECRET` et notez-le :
   ```bash
   openssl rand -base64 32
   # Exemple de sortie : K7gNU3sdo+OL0wNhqoVWhr3g6s1xYv72ol/pe/Unols=
   ```

2. **Ensuite**, allez sur [jwt.io](https://jwt.io) pour générer les clés :

   **Pour `ANON_KEY`** :
   - Algorithm : `HS256`
   - Payload :
     ```json
     {
       "role": "anon",
       "iss": "supabase",
       "iat": 1672531200,
       "exp": 1830297600
     }
     ```
   - Dans le champ "Verify Signature", entrez votre `JWT_SECRET`
   - Copiez le token JWT généré → c'est votre `ANON_KEY`

   **Pour `SERVICE_ROLE_KEY`** :
   - Même procédure mais avec le payload :
     ```json
     {
       "role": "service_role",
       "iss": "supabase",
       "iat": 1672531200,
       "exp": 1830297600
     }
     ```
   - Copiez le token JWT généré → c'est votre `SERVICE_ROLE_KEY`

3. **Alternative en ligne de commande** (si vous avez Node.js sur votre machine locale) :
   ```bash
   # Installer jsonwebtoken
   npm install -g jsonwebtoken

   # Générer ANON_KEY
   node -e "console.log(require('jsonwebtoken').sign({role:'anon',iss:'supabase',iat:1672531200,exp:1830297600},'VOTRE_JWT_SECRET'))"

   # Générer SERVICE_ROLE_KEY
   node -e "console.log(require('jsonwebtoken').sign({role:'service_role',iss:'supabase',iat:1672531200,exp:1830297600},'VOTRE_JWT_SECRET'))"
   ```

> **⚠️ Gardez votre `SERVICE_ROLE_KEY` secrète !** Elle a un accès admin total à votre base. Ne la mettez jamais dans du code côté client.

**B.4 — Lancer Supabase :**

```bash
# Depuis le dossier supabase/docker
docker compose up -d

# Vérifier que tous les conteneurs tournent (il devrait y en avoir ~15)
docker compose ps
```

Vous devriez voir environ 15 conteneurs dont : `supabase-kong`, `supabase-auth`, `supabase-rest`, `supabase-db`, `supabase-storage`, `supabase-studio`, `supabase-edge-functions`, etc.

> **💡 Vérification rapide** : Accédez à `http://VOTRE_IP:8000` dans votre navigateur. Vous devriez voir le dashboard Supabase Studio. Connectez-vous avec `DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD`.

> **🔧 En cas de problème** : Consultez les logs des conteneurs :
> ```bash
> # Logs de tous les conteneurs
> docker compose logs
>
> # Logs d'un conteneur spécifique
> docker compose logs auth    # Pour les problèmes d'authentification
> docker compose logs rest    # Pour les problèmes d'API REST
> docker compose logs db      # Pour les problèmes de base de données
> docker compose logs functions  # Pour les Edge Functions
> ```

**B.5 — Configurer HTTPS avec Caddy (obligatoire en production) :**

En production, vous **devez** utiliser HTTPS. Le plus simple est d'installer [Caddy](https://caddyserver.com) comme reverse proxy (il gère automatiquement les certificats SSL Let's Encrypt) :

```bash
# Installer Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Configurer Caddy
sudo nano /etc/caddy/Caddyfile
```

Contenu du `Caddyfile` :

```
supabase.votre-domaine.com {
    reverse_proxy localhost:8000
}
```

```bash
# Redémarrer Caddy — il obtiendra automatiquement un certificat Let's Encrypt
sudo systemctl restart caddy

# Vérifier que Caddy tourne
sudo systemctl status caddy
```

> **⚠️ Prérequis DNS** : Créez un enregistrement **A** chez votre registrar DNS (OVH, Cloudflare, Gandi, etc.) pointant `supabase.votre-domaine.com` vers l'IP publique de votre VM.
>
> Exemple chez votre registrar :
> ```
> Type: A    Nom: supabase    Valeur: 20.13.45.67    TTL: 300
> ```
> Attendez 5-15 minutes pour la propagation DNS avant de redémarrer Caddy.

**B.6 — Configurer l'envoi d'emails (SMTP) — OBLIGATOIRE :**

> **⚠️ Étape souvent oubliée !** Sans SMTP configuré, les emails de confirmation d'inscription, de réinitialisation de mot de passe et de changement d'email **ne seront pas envoyés**. Les utilisateurs ne pourront pas confirmer leur compte.

Supabase Auth a besoin d'un serveur SMTP pour envoyer les emails. Voici vos options :

| Fournisseur SMTP | Plan gratuit | Facilité |
|---|---|---|
| [Resend](https://resend.com) | 3 000 emails/mois | ⭐⭐⭐ Très simple |
| [Brevo (ex-Sendinblue)](https://brevo.com) | 300 emails/jour | ⭐⭐⭐ |
| [Mailgun](https://mailgun.com) | 1 000 emails/mois (essai) | ⭐⭐ |
| Gmail SMTP | 500/jour | ⭐ (nécessite "App password") |

**Exemple avec Resend (recommandé) :**

1. Créez un compte sur [resend.com](https://resend.com)
2. Ajoutez et vérifiez votre domaine (Resend vous guidera avec les enregistrements DNS)
3. Créez une API key
4. Dans le fichier `.env` de Supabase (étape B.3), configurez :
   ```env
   SMTP_HOST=smtp.resend.com
   SMTP_PORT=465
   SMTP_USER=resend
   SMTP_PASS=re_VOTRE_API_KEY
   SMTP_SENDER_NAME=Stop Repeat
   SMTP_ADMIN_EMAIL=noreply@votre-domaine.com
   ```
5. Redémarrez Supabase : `docker compose restart`

**Exemple avec Gmail (rapide pour tester) :**

1. Activez la [vérification en 2 étapes](https://myaccount.google.com/signinoptions/two-step-verification) sur votre compte Google
2. Créez un [mot de passe d'application](https://myaccount.google.com/apppasswords) (sélectionnez "Autre" → "Supabase")
3. Configurez :
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=votre-email@gmail.com
   SMTP_PASS=le-mot-de-passe-dapplication-genere
   SMTP_SENDER_NAME=Stop Repeat
   SMTP_ADMIN_EMAIL=votre-email@gmail.com
   ```

> **💡 Vérification** : Après avoir configuré le SMTP et redémarré Supabase (`docker compose restart`), testez en créant un compte sur votre application. Vous devriez recevoir un email de confirmation.

**B.7 — Installer les extensions PostgreSQL nécessaires :**

L'application utilise `pg_net` (pour les appels HTTP depuis les triggers, nécessaire pour les notifications push) et `pg_cron` (pour les tâches planifiées). Sur Supabase auto-hébergé, connectez-vous à PostgreSQL :

```bash
# Se connecter au PostgreSQL du conteneur
docker compose exec db psql -U supabase_admin -d postgres
```

```sql
-- Activer les extensions
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Vérifier qu'elles sont installées
SELECT extname, extversion FROM pg_extension WHERE extname IN ('pg_net', 'pg_cron');

-- Si pg_net n'est pas disponible, l'alternative est documentée à l'étape 8
-- Si pg_cron n'est pas disponible, voir l'étape 15 pour les alternatives CRON
\q
```

> **⚠️ Si `pg_net` n'est pas disponible** : Cette extension est pré-compilée dans l'image Docker Supabase. Si elle manque, vérifiez que vous utilisez bien l'image officielle `supabase/postgres`. Sans `pg_net`, les notifications push en temps réel (trigger `send_push_on_notification`) ne fonctionneront pas automatiquement. L'alternative est de déclencher la fonction `send-push` côté application au lieu du trigger SQL.

**B.8 — Configurer les secrets des Edge Functions :**

> **⚠️ Étape critique souvent manquée !** Les Edge Functions Supabase ont besoin de variables d'environnement (secrets) pour fonctionner. Sur Supabase auto-hébergé, ces secrets sont définis dans le fichier `docker-compose.yml` ou via des fichiers `.env`.

Éditez le fichier `supabase/docker/.env` et ajoutez ces variables qui seront accessibles par les Edge Functions :

```env
# Dans le fichier .env de Supabase Docker, ajoutez :

# Stripe (pour le paiement du plan Famille)
STRIPE_SECRET_KEY=sk_live_votre_cle_stripe

# Notifications push VAPID (générez avec : npx web-push generate-vapid-keys)
VAPID_PUBLIC_KEY=BNh3v...votre_cle_publique
VAPID_PRIVATE_KEY=dGhpc...votre_cle_privee
VAPID_EMAIL=mailto:admin@votre-domaine.com
```

Puis redémarrez le conteneur Edge Functions :
```bash
docker compose restart functions
```

> **💡 Note** : Les variables `SUPABASE_URL`, `SUPABASE_ANON_KEY`, et `SUPABASE_SERVICE_ROLE_KEY` sont automatiquement injectées par Supabase dans les Edge Functions. Vous n'avez pas besoin de les configurer manuellement.

**B.9 — Créer le bucket de stockage :**

Sur Supabase auto-hébergé, vous devez créer le bucket de stockage manuellement. Accédez au dashboard Supabase Studio (`https://supabase.votre-domaine.com`) :

1. Allez dans **Storage** (menu de gauche)
2. Cliquez **« New Bucket »**
3. Nom : `task-evidence`
4. Cochez **« Public bucket »**
5. Cliquez **« Create »**

Ou bien via SQL :
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('task-evidence', 'task-evidence', true);
```

**B.10 — Déployer les Edge Functions :**

Sur Supabase auto-hébergé, les Edge Functions sont gérées par le conteneur `supabase-edge-functions`. Copiez vos fonctions dans le bon répertoire :

```bash
# Depuis votre machine locale (pas la VM)
# Copiez le dossier supabase/functions/ vers la VM
scp -r supabase/functions/ azureuser@VOTRE_IP:~/supabase/docker/volumes/functions/

# Sur la VM, redémarrez le conteneur edge-functions
ssh azureuser@VOTRE_IP
cd ~/supabase/docker
docker compose restart functions

# Vérifier que les fonctions sont chargées
docker compose logs functions | tail -20
```

> **💡 Vérification** : Testez une Edge Function simple :
> ```bash
> curl -X POST https://supabase.votre-domaine.com/functions/v1/push-vapid-key \
>   -H "Authorization: Bearer VOTRE_ANON_KEY"
> ```
> Vous devriez recevoir `{"publicKey":"..."}` si VAPID est configuré, ou une erreur explicite sinon.

**B.11 — Notes de vos valeurs :**

Pour la suite du tutoriel, vos valeurs seront :

| Variable | Valeur pour l'Option B |
|---|---|
| `VITE_SUPABASE_URL` | `https://supabase.votre-domaine.com` (ou `http://VOTRE_IP:8000`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Votre `ANON_KEY` générée en B.3bis |
| `service_role key` | Votre `SERVICE_ROLE_KEY` générée en B.3bis |

**B.12 — Configurer l'authentification Supabase (URLs de redirection) :**

> **⚠️ Si vous oubliez cette étape, la connexion OAuth et les liens dans les emails ne fonctionneront pas.**

Accédez au dashboard Supabase Studio → **Authentication → URL Configuration** :

1. **Site URL** : `https://app.votre-domaine.com` (l'URL de votre frontend)
2. **Redirect URLs** : ajoutez :
   - `https://app.votre-domaine.com/**`
   - `https://app.votre-domaine.com/dashboard`
   - `http://localhost:5173/**` (pour le développement local)

**B.13 — Maintenance et sauvegardes :**

```bash
# Mettre à jour Supabase (nouvelles versions)
cd ~/supabase/docker
git pull
docker compose pull
docker compose up -d

# Sauvegarder la base de données
docker compose exec db pg_dump -U supabase_admin postgres > backup_$(date +%Y%m%d).sql

# Restaurer une sauvegarde
cat backup_20260308.sql | docker compose exec -T db psql -U supabase_admin postgres
```

> **💡 Automatiser les sauvegardes** : Créez un cron job sur la VM :
> ```bash
> # Créer le dossier de sauvegardes
> mkdir -p ~/backups
>
> crontab -e
> # Ajouter cette ligne (sauvegarde quotidienne à 3h du matin)
> 0 3 * * * cd ~/supabase/docker && docker compose exec -T db pg_dump -U supabase_admin postgres > ~/backups/backup_$(date +\%Y\%m\%d).sql
>
> # Optionnel : supprimer les sauvegardes de plus de 30 jours
> 0 4 * * * find ~/backups -name "backup_*.sql" -mtime +30 -delete
> ```

> **💡 Sauvegardes sur Azure Blob Storage** (recommandé pour ne pas perdre les sauvegardes si la VM tombe) :
> ```bash
> # Installer Azure CLI sur la VM
> curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
> az login
>
> # Créer un conteneur de stockage pour les sauvegardes
> az storage container create --name backups --account-name votrecompte
>
> # Script de sauvegarde + upload (à mettre dans le crontab)
> #!/bin/bash
> BACKUP_FILE=~/backups/backup_$(date +%Y%m%d).sql
> cd ~/supabase/docker && docker compose exec -T db pg_dump -U supabase_admin postgres > $BACKUP_FILE
> az storage blob upload --container-name backups --file $BACKUP_FILE --name $(basename $BACKUP_FILE) --account-name votrecompte
> ```

> **⚠️ Coûts estimés** : VM B2s (~15€/mois) + disque (~5€/mois) + IP publique (~3€/mois) = **~23€/mois**. Plus cher que Supabase Cloud (gratuit pour un petit projet) mais vous avez un contrôle total sur vos données.

---

### 📝 Étape 2 — Appliquer le schéma de base de données

Toutes les migrations SQL se trouvent dans le dossier `supabase/migrations/`. Vous devez les appliquer à votre nouveau projet Supabase.

#### Méthode 1 : Avec la CLI Supabase (recommandé)

```bash
# 1. Installer la CLI Supabase
npm install -g supabase

# 2. Se connecter à Supabase
supabase login

# 3. Lier votre projet distant
supabase link --project-ref VOTRE_PROJECT_REF

# 4. Appliquer toutes les migrations
supabase db push
```

> **💡 Où trouver le `project-ref` ?**
> Dans l'URL de votre dashboard Supabase : `https://supabase.com/dashboard/project/VOTRE_PROJECT_REF`

#### Méthode 2 : Manuellement via le SQL Editor

1. Allez dans votre dashboard Supabase → **SQL Editor**
2. Ouvrez chaque fichier dans `supabase/migrations/` **dans l'ordre chronologique** (les noms commencent par un timestamp)
3. Copiez-collez le contenu et exécutez chaque migration une par une

> **⚠️ Respectez l'ordre** : les migrations sont numérotées chronologiquement et peuvent dépendre les unes des autres.

---

### 📝 Étape 3 — Configurer les secrets Supabase

Les Edge Functions de l'application ont besoin de certains secrets. Dans votre dashboard Supabase, allez dans **Settings → Edge Functions → Secrets** et ajoutez :

| Secret | Description | Où le trouver |
|---|---|---|
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | [Dashboard Stripe → API Keys](https://dashboard.stripe.com/apikeys) |
| `VAPID_PUBLIC_KEY` | Clé publique VAPID (Web Push) | Générer avec `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | Clé privée VAPID (Web Push) | Même commande que ci-dessus |
| `VAPID_EMAIL` | Email pour les notifications push | Votre email (ex: `mailto:admin@example.com`) |

Pour générer les clés VAPID :

```bash
npx web-push generate-vapid-keys
```

Cela affichera quelque chose comme :
```
Public Key:  BNh3v...abc
Private Key: dGhpc...xyz
```

---

### 📝 Étape 4 — Déployer les Edge Functions Supabase

Les Edge Functions du dossier `supabase/functions/` doivent être déployées sur votre projet Supabase. Voici ce que fait chacune d'elles :

| Fonction | Rôle |
|---|---|
| `create-payment` | Crée une session Stripe Checkout pour le paiement du plan Famille |
| `verify-payment` | Vérifie si l'utilisateur a payé et met à jour le plan de la famille |
| `delete-account` | Supprime le compte utilisateur et toutes ses données associées |
| `redeem-activation-code` | Valide et applique un code d'activation premium |
| `daily-task-reset` | Génère les instances de tâches du jour pour toutes les familles |
| `task-reminders` | Envoie des rappels de tâches avant l'heure limite |
| `send-push` | Envoie des notifications push Web aux appareils enregistrés |
| `push-vapid-key` | Expose la clé publique VAPID pour l'inscription push côté client |

```bash
# Assurez-vous d'être lié à votre projet
supabase link --project-ref VOTRE_PROJECT_REF

# Déployer toutes les fonctions d'un coup
supabase functions deploy create-payment
supabase functions deploy verify-payment
supabase functions deploy delete-account
supabase functions deploy redeem-activation-code
supabase functions deploy daily-task-reset
supabase functions deploy task-reminders
supabase functions deploy send-push
supabase functions deploy push-vapid-key
```

> **💡 Astuce** : Vous pouvez aussi déployer toutes les fonctions avec :
> ```bash
> supabase functions deploy
> ```

> **⚠️ Si vous êtes sur l'Option B (auto-hébergé)** : Les Edge Functions Supabase utilisent Deno et sont exécutées par le conteneur `supabase-edge-functions`. Vérifiez que ce conteneur est bien démarré avec `docker compose ps`. Si vous rencontrez des erreurs, consultez les logs : `docker compose logs functions`.

---

### 📝 Étape 5 — Configurer le Storage Supabase

L'application utilise un bucket de stockage `task-evidence` pour les photos de preuve.

1. Dans le dashboard Supabase → **Storage**
2. Cliquez **« New Bucket »**
3. Nom : `task-evidence`
4. Cochez **« Public bucket »** (les photos sont accessibles via URL signée)
5. Ajoutez les policies RLS suivantes via le SQL Editor :

```sql
-- Permettre aux utilisateurs authentifiés d'uploader
CREATE POLICY "Users can upload evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'task-evidence');

-- Permettre aux membres de la famille de voir les photos
CREATE POLICY "Family can view evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'task-evidence');
```

---

### 📝 Étape 6 — Configurer l'authentification Supabase

#### 6.1 — Auth email/mot de passe

Dans le dashboard Supabase → **Authentication → Providers** :
- **Email** : activé par défaut ✅
- Désactivez « Confirm email » si vous voulez un onboarding rapide (optionnel)

#### 6.2 — OAuth Google (remplace Lovable Cloud Auth)

> **⚠️ C'est le changement le plus important.** L'application utilise actuellement `@lovable.dev/cloud-auth-js` pour l'OAuth Google. Ce package **ne fonctionnera pas** en dehors de Lovable. Vous devez le remplacer par l'OAuth natif de Supabase.

**A. Créer un projet Google Cloud :**

1. Allez sur [console.cloud.google.com](https://console.cloud.google.com)
2. Créez un nouveau projet (ou utilisez un existant)
3. Allez dans **APIs & Services → Credentials**
4. Cliquez **« Create Credentials » → « OAuth client ID »**
5. Type : **Web application**
6. Nom : `Stop Repeat`
7. **Authorized redirect URIs** : ajoutez `https://VOTRE_PROJET.supabase.co/auth/v1/callback`
8. Notez le **Client ID** et le **Client Secret**

**B. Configurer Google dans Supabase :**

1. Dashboard Supabase → **Authentication → Providers → Google**
2. Activez Google
3. Collez votre **Client ID** et **Client Secret**
4. Sauvegardez

**C. Modifier le code source :**

Le fichier `src/integrations/lovable/index.ts` utilise `@lovable.dev/cloud-auth-js` qui est **spécifique à Lovable**. Remplacez son contenu par :

```typescript
// src/integrations/lovable/index.ts
// Remplacement de l'OAuth Lovable par l'OAuth natif Supabase
import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple", opts?: SignInOptions) => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: opts?.redirect_uri || window.location.origin + "/dashboard",
        },
      });

      if (error) {
        return { error };
      }

      // Supabase gère la redirection automatiquement
      return { redirected: true };
    },
  },
};
```

Puis désinstallez le package Lovable :

```bash
npm uninstall @lovable.dev/cloud-auth-js
```

#### 6.3 — OAuth Apple (optionnel)

La connexion via Apple nécessite un [Apple Developer Account](https://developer.apple.com) (99$/an).

**A. Configurer Apple Developer :**

1. Connectez-vous sur [developer.apple.com](https://developer.apple.com) → **Certificates, Identifiers & Profiles**
2. Créez un **App ID** (si pas déjà fait) avec le capability **Sign In with Apple**
3. Créez un **Services ID** :
   - Identifier : `com.votre-domaine.stoprepeat` (exemple)
   - Activez **Sign In with Apple**
   - Dans la configuration, ajoutez :
     - **Domains** : `VOTRE_PROJET.supabase.co`
     - **Return URLs** : `https://VOTRE_PROJET.supabase.co/auth/v1/callback`
4. Créez une **Key** avec la capability **Sign In with Apple**
5. Téléchargez le fichier `.p8` et notez le **Key ID**

**B. Configurer Apple dans Supabase :**

1. Dashboard Supabase → **Authentication → Providers → Apple**
2. Activez Apple
3. Renseignez : **Services ID**, **Team ID**, **Key ID**, et le contenu du fichier `.p8**
4. Sauvegardez

> **💡** : Si vous ne prévoyez pas de support Apple, vous pouvez simplement retirer le bouton « Continuer avec Apple » des composants `LoginForm.tsx` et `SignupForm.tsx`.

---

### 📝 Étape 7 — Configurer les variables d'environnement du frontend

Créez un fichier `.env` à la racine du projet (ou `.env.production` pour la production) :

```env
VITE_SUPABASE_URL=https://VOTRE_PROJET.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...votre_anon_key
VITE_SUPABASE_PROJECT_ID=VOTRE_PROJECT_REF
```

> **⚠️ Ne committez JAMAIS** ce fichier sur GitHub. Ajoutez `.env` à votre `.gitignore`. Sur Azure Static Web Apps, vous configurerez ces variables dans les **Application Settings**.

---

### 📝 Étape 8 — Modifier la fonction `send_push_on_notification`

La fonction SQL `send_push_on_notification` contient en dur l'URL du projet Supabase Lovable Cloud et la clé anon. Vous devez la mettre à jour avec **vos propres valeurs**.

Exécutez cette migration SQL dans le SQL Editor de votre Supabase :

```sql
CREATE OR REPLACE FUNCTION public.send_push_on_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM net.http_post(
    url := 'https://VOTRE_PROJET.supabase.co/functions/v1/send-push',
    body := jsonb_build_object(
      'user_id', NEW.user_id,
      'title', NEW.title,
      'body', NEW.body,
      'type', NEW.type,
      'metadata', NEW.metadata
    ),
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer VOTRE_ANON_KEY"}'::jsonb
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$function$;
```

> **Remplacez** `VOTRE_PROJET` et `VOTRE_ANON_KEY` par les valeurs de votre projet Supabase.

---

### 📝 Étape 9 — Mettre à jour le Price ID Stripe

Le fichier `supabase/functions/create-payment/index.ts` contient un Price ID Stripe en dur :

```typescript
const FAMILY_PLAN_PRICE_ID = "price_1T8n4uRtcZeziopYZiwgCS2J";
```

Ce Price ID est lié au compte Stripe du projet original. **Vous devez créer votre propre produit et prix dans Stripe** :

1. Allez sur [dashboard.stripe.com/products](https://dashboard.stripe.com/products)
2. Cliquez **« Add product »**
3. Nom : `Plan Famille`, Prix : `10.00 EUR`, Type : **One-time**
4. Une fois créé, copiez le **Price ID** (commence par `price_`)
5. Remplacez la valeur dans `supabase/functions/create-payment/index.ts`

---

### 📝 Étape 10 — Builder le frontend

```bash
# 1. Installer les dépendances
npm install

# 2. Builder pour la production
npm run build
```

Cela crée un dossier `dist/` contenant les fichiers statiques de l'application.

> **💡 Vérification** : Testez localement avant de déployer :
> ```bash
> npm run preview
> ```
> L'app devrait tourner sur `http://localhost:4173`.

---

### 📝 Étape 11 — Créer l'Azure Static Web App

#### Option A : Via le portail Azure (interface graphique)

1. Connectez-vous sur [portal.azure.com](https://portal.azure.com)
2. Cliquez **« Créer une ressource »** → cherchez **« Static Web App »**
3. Remplissez les informations :
   - **Abonnement** : votre abonnement Azure
   - **Groupe de ressources** : créez-en un (ex: `rg-stop-repeat`)
   - **Nom** : `stop-repeat`
   - **Plan** : Free (suffisant pour commencer)
   - **Région** : West Europe
   - **Source** : GitHub
4. Connectez votre compte GitHub et sélectionnez votre repo
5. Dans **Build Details** :
   - **Build Preset** : `Vite`
   - **App location** : `/`
   - **Output location** : `dist`
6. Cliquez **« Créer »**

Azure va automatiquement créer un workflow GitHub Actions dans `.github/workflows/`.

#### Option B : Via Azure CLI

```bash
# 1. Se connecter à Azure
az login

# 2. Créer un groupe de ressources
az group create --name rg-stop-repeat --location westeurope

# 3. Créer la Static Web App
az staticwebapp create \
  --name stop-repeat \
  --resource-group rg-stop-repeat \
  --source https://github.com/VOTRE_USER/stop-repeat \
  --location westeurope \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --login-with-github
```

---

### 📝 Étape 12 — Configurer les variables d'environnement sur Azure

Les variables d'environnement (secrets) ne doivent **jamais** être dans le code. Configurez-les dans Azure :

#### Via le portail Azure :

1. Allez dans votre Static Web App → **Configuration**
2. Ajoutez ces **Application settings** :

| Nom | Valeur |
|---|---|
| `VITE_SUPABASE_URL` | `https://VOTRE_PROJET.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Votre clé `anon` Supabase |
| `VITE_SUPABASE_PROJECT_ID` | Votre Project Ref Supabase |

#### Via Azure CLI :

```bash
az staticwebapp appsettings set \
  --name stop-repeat \
  --resource-group rg-stop-repeat \
  --setting-names \
    VITE_SUPABASE_URL=https://VOTRE_PROJET.supabase.co \
    VITE_SUPABASE_PUBLISHABLE_KEY=votre_anon_key \
    VITE_SUPABASE_PROJECT_ID=votre_project_ref
```

> **⚠️ Important pour Vite** : Les variables `VITE_*` sont injectées **au build time** et non au runtime. Cela signifie que le workflow GitHub Actions doit avoir accès à ces variables lors du build. Modifiez le fichier `.github/workflows/azure-static-web-apps-*.yml` généré pour ajouter les variables d'environnement :
>
> ```yaml
> - name: Build And Deploy
>   uses: Azure/static-web-apps-deploy@v1
>   with:
>     # ... autres paramètres
>     app_location: "/"
>     output_location: "dist"
>   env:
>     VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
>     VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}
>     VITE_SUPABASE_PROJECT_ID: ${{ secrets.VITE_SUPABASE_PROJECT_ID }}
> ```
>
> Et ajoutez ces secrets dans **GitHub → Settings → Secrets and variables → Actions**.

---

### 📝 Étape 13 — Configurer le routing SPA

Azure Static Web Apps doit rediriger toutes les routes vers `index.html` pour que React Router fonctionne. Créez un fichier `staticwebapp.config.json` à la racine du projet :

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "/favicon.ico", "/robots.txt", "/sw-push.js"]
  },
  "globalHeaders": {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "mimeTypes": {
    ".json": "application/json",
    ".js": "application/javascript",
    ".css": "text/css"
  }
}
```

Committez et pushez ce fichier — Azure le détectera automatiquement.

---

### 📝 Étape 14 — Configurer un domaine personnalisé (optionnel)

1. Dans le portail Azure → votre Static Web App → **Custom domains**
2. Cliquez **« Add »**
3. Entrez votre domaine (ex: `app.stoprepeat.fr`)
4. Azure vous demandera de créer un enregistrement **CNAME** chez votre registrar DNS :
   ```
   CNAME  app  →  stop-repeat-xxxxx.azurestaticapps.net
   ```
5. Azure provisionne automatiquement un **certificat SSL** gratuit

> **⚠️ N'oubliez pas** de mettre à jour les URLs de redirection dans Supabase Auth !
> - Dashboard Supabase → **Authentication → URL Configuration**
> - **Site URL** : `https://app.stoprepeat.fr` (votre domaine personnalisé)
> - **Redirect URLs** : ajoutez `https://app.stoprepeat.fr/**` et `https://app.stoprepeat.fr/dashboard`
> - Si vous avez configuré Google OAuth, mettez aussi à jour les **Authorized redirect URIs** dans la console Google Cloud

---

### 📝 Étape 15 — Créer les triggers de base de données

> **⚠️ Étape critique !** Les migrations SQL créent les **fonctions** mais pas toujours les **triggers** qui les appellent. Sans triggers, les automatismes (notifications, badges, points, etc.) ne fonctionneront pas.

Exécutez ces commandes SQL dans le SQL Editor de votre Supabase pour créer tous les triggers nécessaires :

```sql
-- 1. Trigger : Créer un profil et un rôle automatiquement quand un utilisateur s'inscrit
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Trigger : Initialiser child_stats quand un rôle "child" est assigné
CREATE OR REPLACE TRIGGER on_child_role_assigned
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_child_role_assigned();

-- 3. Trigger : Créer les settings, règles et récompenses par défaut quand une famille est créée
CREATE OR REPLACE TRIGGER on_new_family_created
  AFTER INSERT ON public.families
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_family();

-- 4. Trigger : Générer les tâches exemple quand un enfant rejoint une famille
CREATE OR REPLACE TRIGGER on_child_joined_family
  AFTER UPDATE OF family_id ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_seed_example_tasks();

-- 5. Trigger : Quand une tâche est validée → ajouter points + wallet
CREATE OR REPLACE TRIGGER on_task_validated
  AFTER UPDATE ON public.task_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_task_validated();

-- 6. Trigger : Notification aux parents quand un enfant complète une tâche
CREATE OR REPLACE TRIGGER on_task_completed_notification
  AFTER UPDATE ON public.task_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_task_completed_notification();

-- 7. Trigger : Notification à l'enfant quand une tâche lui est assignée
CREATE OR REPLACE TRIGGER on_task_created_notification
  AFTER INSERT ON public.task_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_task_created_notification();

-- 8. Trigger : Notification quand une récompense est approuvée
CREATE OR REPLACE TRIGGER on_reward_approved_notification
  AFTER UPDATE ON public.reward_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_reward_approved_notification();

-- 9. Trigger : Déduire les points quand une récompense est approuvée
CREATE OR REPLACE TRIGGER on_redemption_approved
  AFTER UPDATE ON public.reward_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_redemption_approved();

-- 10. Trigger : Notification aux parents quand un enfant demande une récompense
CREATE OR REPLACE TRIGGER on_redemption_requested_notification
  AFTER INSERT ON public.reward_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_redemption_requested_notification();

-- 11. Trigger : Quand une pénalité est enregistrée → déduire points/wallet
CREATE OR REPLACE TRIGGER on_penalty_logged
  AFTER INSERT ON public.penalties_log
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_penalty_logged();

-- 12. Trigger : Notification à l'enfant quand il reçoit une pénalité
CREATE OR REPLACE TRIGGER on_penalty_notification
  AFTER INSERT ON public.penalties_log
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_penalty_notification();

-- 13. Trigger : Vérifier et attribuer les badges après mise à jour des stats
CREATE OR REPLACE TRIGGER on_check_badges
  AFTER UPDATE ON public.child_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_award_badges();

-- 14. Trigger : Envoyer une notification push quand une notification est insérée
CREATE OR REPLACE TRIGGER on_send_push_notification
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.send_push_on_notification();

-- 15. Trigger : Limiter le nombre de membres par famille selon le plan
CREATE OR REPLACE TRIGGER on_enforce_family_limits
  BEFORE UPDATE OF family_id ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_family_member_limits();

-- 16. Trigger : Mettre à jour updated_at automatiquement
CREATE OR REPLACE TRIGGER set_updated_at ON public.profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER set_updated_at ON public.families
  BEFORE UPDATE ON public.families
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER set_updated_at ON public.task_instances
  BEFORE UPDATE ON public.task_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER set_updated_at ON public.rewards
  BEFORE UPDATE ON public.rewards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER set_updated_at ON public.reward_redemptions
  BEFORE UPDATE ON public.reward_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

> **💡 Important** : Si les migrations SQL (`supabase db push`) ont déjà créé ces triggers, les commandes `CREATE OR REPLACE TRIGGER` les mettront simplement à jour sans erreur. Vous pouvez les exécuter sans risque.

---

### 📝 Étape 16 — Configurer les CRON jobs (tâches planifiées)

L'application a besoin de **deux jobs CRON** quotidiens :

| Job | Fonction appelée | Heure recommandée | Rôle |
|---|---|---|---|
| Génération des tâches | `daily-task-reset` | 05:00 UTC | Crée les instances de tâches du jour pour chaque famille |
| Rappels de tâches | `task-reminders` | Toutes les 15 min | Envoie des rappels avant l'heure limite des tâches |

#### Option A : Avec `pg_cron` (Supabase Cloud ou auto-hébergé)

```sql
-- Activer l'extension pg_cron (dans le SQL Editor Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Job 1 : Génération des tâches tous les jours à 5h du matin (UTC)
SELECT cron.schedule(
  'daily-task-generation',
  '0 5 * * *',
  $$
  SELECT public.generate_daily_task_instances(id)
  FROM public.families
  WHERE id IN (SELECT DISTINCT family_id FROM public.profiles WHERE family_id IS NOT NULL);
  $$
);

-- Job 2 : Rappels de tâches toutes les 15 minutes (appelle l'Edge Function task-reminders)
SELECT cron.schedule(
  'task-reminders',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://VOTRE_SUPABASE_URL/functions/v1/task-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer VOTRE_ANON_KEY"}'::jsonb
  );
  $$
);

-- Vérifier que les jobs sont bien créés
SELECT * FROM cron.job;
```

#### Option B : Avec `crontab` Linux (si vous avez un VPS — Option B)

```bash
crontab -e
# Ajouter ces lignes :

# Génération des tâches tous les jours à 5h UTC
0 5 * * * curl -s -X POST https://VOTRE_SUPABASE_URL/functions/v1/daily-task-reset -H "Authorization: Bearer VOTRE_ANON_KEY" -H "Content-Type: application/json" >> /var/log/cron-tasks.log 2>&1

# Rappels de tâches toutes les 15 minutes
*/15 * * * * curl -s -X POST https://VOTRE_SUPABASE_URL/functions/v1/task-reminders -H "Authorization: Bearer VOTRE_ANON_KEY" -H "Content-Type: application/json" >> /var/log/cron-reminders.log 2>&1
```

#### Option C : Avec une Azure Function Timer Trigger

1. Dans le portail Azure → **Créer une ressource** → **Function App**
2. Runtime : **Node.js 18**, Plan : **Consumption** (gratuit jusqu'à 1M exécutions/mois)
3. Créez deux fonctions avec des **Timer triggers** :

**Fonction 1 — daily-task-reset (tous les jours à 5h UTC) :**
- Schedule (CRON) : `0 0 5 * * *`

**Fonction 2 — task-reminders (toutes les 15 min) :**
- Schedule (CRON) : `0 */15 * * * *`

Code commun :
```javascript
const https = require('https');

module.exports = async function (context, myTimer) {
  // Remplacez par le chemin de la fonction correspondante
  const functionPath = context.functionName === 'daily-task-reset'
    ? '/functions/v1/daily-task-reset'
    : '/functions/v1/task-reminders';

  const options = {
    hostname: 'VOTRE_PROJET.supabase.co',
    path: functionPath,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer VOTRE_ANON_KEY',
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      context.log(`${context.functionName}: ${res.statusCode}`);
      resolve();
    });
    req.on('error', reject);
    req.end();
  });
};
```

---

### 📝 Étape 17 — Activer le Realtime (si nécessaire)

Si l'application utilise les abonnements temps réel Supabase (pour les notifications en direct), activez le realtime sur les tables concernées :

```sql
-- Activer le realtime pour la table notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Optionnel : activer pour d'autres tables si besoin
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_instances;
```

---

### 📝 Étape 18 — Vérification finale

Utilisez cette checklist pour vérifier que tout fonctionne :

- [ ] **Frontend** : L'application se charge sur l'URL Azure Static Web Apps
- [ ] **Inscription** : Un utilisateur peut s'inscrire par email
- [ ] **Email de confirmation** : L'email de confirmation arrive bien (vérifiez les spams)
- [ ] **Connexion** : Un utilisateur peut se connecter après confirmation
- [ ] **OAuth Google** : Le bouton « Continuer avec Google » fonctionne
- [ ] **Création de famille** : Un parent peut créer une famille (les règles et récompenses par défaut apparaissent)
- [ ] **Rejoindre une famille** : Un enfant peut rejoindre avec le code d'invitation
- [ ] **Tâches** : Les tâches apparaissent dans le tableau de bord enfant
- [ ] **Validation** : Un parent peut valider une tâche → les points sont ajoutés
- [ ] **Récompenses** : L'enfant peut demander une récompense → le parent l'approuve
- [ ] **Pénalités** : Un parent peut appliquer une pénalité → les points sont déduits
- [ ] **Paiement Stripe** : Le paiement du plan Famille fonctionne (testez en mode test Stripe)
- [ ] **Notifications push** : Les notifications arrivent dans le navigateur
- [ ] **Upload photo** : L'upload de preuve photo fonctionne (vérifiez le bucket Storage)
- [ ] **CRON** : Le lendemain, vérifiez que les tâches du jour ont été générées automatiquement
- [ ] **Thème sombre** : Le toggle clair/sombre fonctionne
- [ ] **i18n** : Le changement de langue FR/EN fonctionne
- [ ] **Reset mot de passe** : La fonctionnalité « Mot de passe oublié » envoie bien l'email

---

### 🔧 Récapitulatif des modifications de code nécessaires

| Fichier | Modification | Raison |
|---|---|---|
| `src/integrations/lovable/index.ts` | Remplacer par OAuth Supabase natif | `@lovable.dev/cloud-auth-js` ne fonctionne que sur Lovable |
| `.env` | Mettre vos propres clés Supabase | Pointe vers votre projet Supabase |
| `supabase/functions/create-payment/index.ts` | Changer le `FAMILY_PLAN_PRICE_ID` | Price ID Stripe propre à votre compte |
| `staticwebapp.config.json` | Créer ce fichier (routing SPA) | Nécessaire pour Azure Static Web Apps |
| Fonction SQL `send_push_on_notification` | Mettre à jour l'URL et la clé | Pointe vers votre projet Supabase |
| `package.json` | Retirer `@lovable.dev/cloud-auth-js` | Dépendance spécifique à Lovable |
| `vite.config.ts` | Retirer `lovable-tagger` (optionnel) | Dépendance spécifique à Lovable |

---

### ⚠️ Cas particuliers et pièges courants

#### 1. Variables Vite au build time
Les variables `VITE_*` sont **intégrées dans le bundle JS à la compilation**. Si vous changez une variable, vous devez **rebuilder** l'application. C'est différent des variables d'environnement côté serveur.

#### 2. CORS Supabase
Si vous obtenez des erreurs CORS, vérifiez que l'URL de votre frontend Azure est bien autorisée. Par défaut, Supabase autorise toutes les origines (`*`), mais si vous avez restreint les origines, ajoutez votre domaine Azure.

#### 3. Service Worker (notifications push)
Le fichier `public/sw-push.js` doit être servi depuis la racine du domaine. Azure Static Web Apps le fait automatiquement si le fichier est dans `dist/`. Vérifiez que l'URL `https://votre-app.azurestaticapps.net/sw-push.js` est accessible.

#### 4. Supabase Edge Functions vs Azure Functions
Les Edge Functions dans `supabase/functions/` sont déployées **sur Supabase**, pas sur Azure. Si vous souhaitez tout héberger sur Azure, vous devrez réécrire ces fonctions en **Azure Functions** (Node.js), ce qui est un travail conséquent. Le plus simple est de garder Supabase (Cloud ou auto-hébergé) pour les Edge Functions.

#### 5. Le package `lovable-tagger`
Le package `lovable-tagger` (devDependency) ajoute un badge "Edit in Lovable" en développement. Il est inoffensif en production (il n'est chargé qu'en mode `development`), mais vous pouvez le supprimer :
```bash
npm uninstall lovable-tagger
```
Et retirez-le de `vite.config.ts` :
```typescript
// Avant
plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
// Après
plugins: [react()],
```

#### 6. Extension `pg_net` pour les notifications push
La fonction SQL `send_push_on_notification` utilise `net.http_post()` qui nécessite l'extension PostgreSQL `pg_net`. Cette extension est **pré-installée sur Supabase Cloud** mais devra être installée manuellement si vous auto-hébergez PostgreSQL (voir étape B.7).

#### 7. Limites du plan gratuit Azure Static Web Apps
Le plan **Free** offre : 100 Go de bande passante/mois, 2 environnements de staging, 0.5 Go de stockage. Pour un usage familial, c'est largement suffisant.

#### 8. Emails en spam
Si les emails de confirmation arrivent en spam, c'est souvent parce que votre domaine d'envoi n'a pas les enregistrements DNS corrects (SPF, DKIM, DMARC). Utilisez un service SMTP réputé comme Resend ou Brevo qui gère cela automatiquement.

#### 9. Le fichier `src/integrations/supabase/client.ts`
Ce fichier lit les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` au build time. Assurez-vous que votre `.env` est correctement configuré **avant** de lancer `npm run build`.

#### 10. Mode test Stripe
Pour tester le paiement sans carte réelle, utilisez les clés **test** de Stripe (commencent par `sk_test_` et `pk_test_`). Stripe fournit des numéros de carte de test comme `4242 4242 4242 4242` (date future, CVC quelconque).

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

- **[Lovable](https://lovable.dev)** — Cette application a été principalement vibe-codée grâce à Lovable, qui a généreusement rendu sa plateforme gratuite le 08/03/2026 lors de l'**International Women's Day #SheBuilds** en partenariat avec Anthropic et Stripe. Merci pour cette initiative inspirante !
- **[shadcn/ui](https://ui.shadcn.com/)** — Pour les composants UI élégants et accessibles
- **[Supabase](https://supabase.com/)** — Pour l'infrastructure backend open-source
- **[TutoTech](https://tutotech.org)** — Association au service de l'inclusion numérique
