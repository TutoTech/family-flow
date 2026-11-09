# Guide de Déploiement et d'Exploitation — Stop-Repeat

Ce document détaille l'architecture de déploiement, les procédures d'exploitation, le protocole de rollback et les vérifications de santé pour Stop-Repeat (`family-flow`).

---

## 1. Architecture Globale

Le pipeline de déploiement et de sécurité de Stop-Repeat suit le standard industriel éprouvé sur PedagogIA :

```
[ Développeur ]
       │
       ▼ (git push)
[ GitHub : main ]
       ├──────────────────────────────────────────┐
       ▼                                          ▼
[ GitHub Actions : ci.yml ]             [ GitLab Ultimate : Mirror ]
  (Tests, Lint, deja_teste.py)           (SAST, Secrets, Deps, Container)
       │                                          │
       ▼ (succès)                                 ▼
[ GitHub Actions : image.yml ]          [ New Relic Security Event ]
  1. Construire : GHCR image
     (BuildKit secrets, Vite Sentry)
  2. Déployer : commit sur `production`
       │
       ▼ (webhook/poll)
[ Coolify (VPS Tutotech) ]
  Mode : Docker Compose
  Branche : `production`
  Build : AUCUN (zéro CPU)
  Pull : ghcr.io/tutotech/family-flow:<sha>
       │
       ▼
[ GitHub Actions : image.yml (suite) ]
  3. Vérifier : polling https://stop-repeat.tutotech.org/version.json
  4. Nettoyer : rétention des 30 dernières images GHCR
```

---

## 2. Déploiement Continu (CD)

### Déclenchement automatique
Chaque commit fusionné ou poussé sur `main` déclenche le workflow `.github/workflows/image.yml` :
1. **Construction & Publication** :
   - L'image Docker est construite avec Docker BuildKit et publiée sous `ghcr.io/tutotech/family-flow:<sha>` et `ghcr.io/tutotech/family-flow:main`.
   - Les sourcemaps sont transmises de manière sécurisée à Sentry via le secret BuildKit `sentry_auth_token` sans fuiter dans les layers Docker (`filesToDeleteAfterUpload: ["./dist/**/*.map"]`).
   - Le fichier `dist/version.json` est généré avec le SHA du commit et l'horodatage UTC.
2. **Épinglage sur la branche `production`** :
   - Le script `.github/scripts/compose_production.py` génère un fichier `docker-compose.yml` pointant explicitement sur `ghcr.io/tutotech/family-flow:<sha>`.
   - Le commit est poussé sur la branche orpheline `production`.
3. **Déploiement Coolify** :
   - Coolify détecte la mise à jour de la branche `production`.
   - Coolify exécute `docker compose pull` puis `docker compose up -d` sans reconstruire l'image sur le serveur.
4. **Vérification en ligne** :
   - Le script `.github/scripts/verifier_deploiement.py` sonde `https://stop-repeat.tutotech.org/version.json` jusqu'à validation de la version (timeout 5 minutes, tolérance aux erreurs transitoires 502/503).
5. **Nettoyage GHCR** :
   - Le script `.github/scripts/nettoyer_ghcr.py` conserve les 30 versions les plus récentes de l'image de package tout en sanctuarisant la version actuellement en production.

---

## 3. Procédure de Retour Arrière (Rollback)

En cas d'incident en production, le retour arrière est quasi-instantané (< 30 secondes) :

1. Se rendre dans l'onglet **Actions** du dépôt GitHub : `https://github.com/TutoTech/family-flow/actions/workflows/image.yml`.
2. Cliquer sur **Run workflow** :
   - **Commit SHA à déployer** : Renseigner le hash (7 à 40 caractères) de la version saine antérieure.
   - **skip_verifier** : Laisser à `false` (ou passer à `true` uniquement en cas d'urgence opérationnelle).
3. Cliquer sur **Run workflow**.

**Pourquoi c'est instantané ?**
L'image Docker du commit antérieur existant déjà sur GHCR, l'étape de construction est sautée (`existe=oui`). Le workflow met immédiatement à jour la branche `production` avec l'image épinglée. Coolify télécharge et démarre le conteneur immédiatement.

---

## 4. Test et Prévisualisation en Local

Pour tester l'image de production localement avant un déploiement :

```bash
# 1. Compiler l'image localement avec BuildKit
docker build -t family-flow:local .

# 2. Démarrer avec docker-compose
docker compose up -d

# 3. Vérifier le bon fonctionnement
curl -s http://localhost:8080/version.json
# Attendu: {"version":"dev","built_at":"..."}

# 4. Ouvrir dans le navigateur
# http://localhost:8080
```

---

## 5. Configuration Coolify

Paramètres de l'application `stop-repeat` sur Coolify :
- **Source** : GitHub (`TutoTech/family-flow`)
- **Branche surveillée** : `production`
- **Build Pack** : `Docker Compose`
- **Docker Compose Location** : `/docker-compose.yml`
- **Variables d'environnement / Secret** :
  - `GHCR_PULL_TOKEN` : Jeton d'accès GitHub Packages en lecture (stocké dans Infisical `serveur-tutotech/prod/stop-repeat/GHCR_PULL_TOKEN`).
- **Domaine** : `https://stop-repeat.tutotech.org`

---

## 6. Satellite de Sécurité GitLab Ultimate

Le miroir privé `tutotech.org/family-flow` sur GitLab bénéficie des 50 000 minutes annuelles gratuites du programme GitLab for Nonprofits :
- **SAST (Semgrep)** : Analyse statique de code à chaque synchronisation.
- **Secret Detection (Gitleaks)** : Analyse automatique des fuites potentielles de clés ou mots de passe.
- **Dependency Scanning (Gemnasium)** : Analyse des vulnérabilités dans l'arbre des dépendances npm.
- **Container Scanning (Trivy)** : Analyse des vulnérabilités de l'image `ghcr.io/tutotech/family-flow:main`.
- **DAST** : Analyse dynamique hebdomadaire planifiée sur `https://stop-repeat.tutotech.org`.
- **Télémétrie New Relic** : Envoi automatique du récapitulatif de sécurité à New Relic (`scripts/notify-newrelic.py`).

---

## 7. Gestion des Secrets (Infisical)

Tous les secrets et variables d'environnement de production sont centralisés dans **Infisical** :
- **Projet** : `serveur-tutotech`
- **Environnement** : `prod`
- **Dossier** : `/stop-repeat`

| Nom du Secret | Description |
|---|---|
| `VITE_SENTRY_DSN` | DSN Sentry pour la remontée d'erreurs |
| `SENTRY_AUTH_TOKEN` | Jeton d'authentification Sentry (sourcemaps) |
| `VITE_SUPABASE_URL` | URL de l'instance Supabase de production |
| `VITE_SUPABASE_PROJECT_ID` | Identifiant du projet Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clé publique anonyme Supabase |
| `GHCR_PULL_TOKEN` | Jeton de lecture GitHub Packages (registre GHCR) |
| `NEW_RELIC_LICENSE_KEY` | Clé New Relic pour la télémétrie |
