<!-- /autoplan restore point: "/home/user/Documents/GitHub/family-flow/.gstack/tmp/autoplan/main-autoplan-restore-20261109-223011.md" -->
# Plan d'implémentation : Alignement Infrastructure et CI/CD Stop-Repeat (standard PedagogIA)

## Implementation plan

### Contexte & Référence
Ce plan met en œuvre l'architecture validée dans `docs/designs/alignement-infrastructure-pedagogia.md` pour apporter à Stop-Repeat (repo `family-flow`, URL `stop-repeat.tutotech.org`) la parité complète avec les mécanismes industriels de PedagogIA :
1. Déploiement zéro-charge sur Coolify via image GHCR préconstruite et branche `production`.
2. Satellite de sécurité GitLab Ultimate (50 000 min/an) pour SAST, Secrets, Dépendances, Container Scanning et DAST.
3. Intégration et débogage Sentry avec sourcemaps déliées et traçage de version.
4. Rétention automatique des 30 dernières images GHCR et vérification post-déploiement en ligne.

### Étape 1 : Création du miroir de sécurité GitLab Ultimate
- Récupérer les identifiants nécessaires depuis Infisical en mémoire (`infisical:agents-vault/prod/pc-fixe/antigravity/GITLAB_PAT_TUTOTECH` et le PAT GitHub avec `repo:read`).
- Créer le projet privé `tutotech.org/family-flow` sur GitLab via `glab`.
- Configurer le pull-mirroring automatique depuis `https://github.com/TutoTech/family-flow` avec le PAT GitHub.
- Créer le pipeline `.gitlab-ci.yml` adapté à la stack Vite/React/Nginx :
  - Include des templates officiels : `Jobs/SAST.gitlab-ci.yml`, `Jobs/Secret-Detection.gitlab-ci.yml`, `Jobs/Dependency-Scanning.gitlab-ci.yml`, `Jobs/Container-Scanning.gitlab-ci.yml`, `Security/DAST.gitlab-ci.yml`.
  - Variables : `SECURE_LOG_LEVEL: "info"`, `CS_IMAGE: "ghcr.io/tutotech/family-flow:main"`, `DAST_WEBSITE: "https://stop-repeat.tutotech.org"`.
  - Configuration des identifiants GHCR (`CS_REGISTRY_USER`, `CS_REGISTRY_PASSWORD`) dans les variables CI/CD GitLab du projet pour le Container Scanning.
  - Règles pour DAST (hebdomadaire sur schedule ou manuel).
  - Job `.post` d'envoi de télémétrie de sécurité vers New Relic (`scripts/notify-newrelic.py`).

### Étape 2 : Configuration Sentry et Supabase pour la production
- Créer le projet frontend `stop-repeat-frontend` dans l'organisation Sentry `tutotech` (`https://de.sentry.io`).
- Configurer les variables et secrets GitHub :
  - Variables de dépôt : `VITE_SENTRY_DSN`, `SENTRY_ORG=tutotech`, `SENTRY_PROJECT=stop-repeat-frontend`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID`.
  - Secrets de dépôt : `SENTRY_AUTH_TOKEN`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Ajuster `Dockerfile` et `vite.config.ts` :
  - Vérifier que `dist/version.json` est généré lors du build Vite avec `{"version": "$COMMIT", "built_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"}`.
  - S'assurer que les build-args Supabase et Sentry sont transmis au `npm run build`.
  - S'assurer que les sourcemaps sont envoyées à Sentry puis purgées du bundle final (`filesToDeleteAfterUpload: ["./dist/**/*.map"]`).

### Étape 3 : Workflow GitHub Actions de build et déploiement (`image.yml`)
- Créer `.github/workflows/image.yml` calqué sur PedagogIA :
  - Déclenchement sur push sur `main` et workflow_dispatch.
  - Concurrency group `image-production` avec `cancel-in-progress: false`.
  - Job `construire` :
    - Vérification si l'image existe déjà (`docker manifest inspect`) pour éviter de recompiler lors d'un rollback.
    - Setup buildx et connexion GHCR.
    - Build et push de `ghcr.io/tutotech/family-flow:<commit>` et `:main` avec cache GitHub Actions (`type=gha`).
    - Injection des build-args Supabase (`VITE_SUPABASE_*`) et Sentry (`VITE_SENTRY_*`, `SENTRY_AUTH_TOKEN`).
  - Job `deployer` :
    - Vérification que le commit est toujours la tête de `main`.
    - Poussée de la branche `production` avec commit d'épinglage (`Déploiement de <sha>`).
  - Job `verifier` :
    - Boucle d'attente (timeout 15 min) interrogeant `https://stop-repeat.tutotech.org/version.json` pour confirmer que `.version == $COMMIT`.
  - Job `nettoyer` :
    - Exécution du script `.github/scripts/nettoyer_ghcr.py` pour purger les images au-delà des 30 plus récentes.

### Étape 4 : Scripts d'assistance et configuration Docker
- Créer `.github/scripts/compose_production.py` pour adapter `docker-compose.yml` en injectant l'image GHCR épinglée sur le commit.
- Créer `.github/scripts/nettoyer_ghcr.py` avec permissions `packages: write` et appels API GitHub Packages.
- Créer `.github/scripts/deja_teste.py` pour optimiser les passages CI sur `main`.
- Créer `docker-compose.yml` de production à la racine du dépôt.
- Ajouter la route `/version.json` dans la configuration `nginx.conf` avec en-têtes `Cache-Control: no-cache`.

### Étape 5 : Bascule Coolify et validation de bout en bout
- Dans l'interface Coolify, reconfigurer l'application `stop-repeat` :
  - Changer la branche suivie de `main` à `production`.
  - Définir le mode de déploiement sur Docker Compose.
  - Configurer `GHCR_PULL_TOKEN` pour l'authentification au registre GHCR.
- Fusionner sur `main`, observer le déclenchement de `image.yml`, la publication de l'image, la mise à jour de `production`, et la validation par `verifier`.
- Vérifier la réception des événements et sourcemaps dans Sentry.
- Vérifier le déclenchement du miroir GitLab et des scanners de sécurité Ultimate.


<!-- autoplan-accepted:ceo -->
- Sécuriser l'injection de SENTRY_AUTH_TOKEN lors de la compilation Docker via BuildKit secret ou build runner, empêchant toute fuite de jeton dans les métadonnées ARG.
- Restreindre le DAST GitLab CI aux audits planifiés hebdomadaires ou manuels ($DAST_RUN == "true").
- Réduire le timeout du job verifier à 5 minutes avec en-têtes Nginx Cache-Control no-store sur /version.json.
<!-- /autoplan-accepted:ceo -->

<!-- autoplan-accepted:dx -->
- Rendre glab non-interactif et injecter le PAT GitHub de manière sécurisée via l'API GitLab pour le miroir sans fuite dans les logs.
- Standardiser les scripts d'assistance (.github/scripts/) en Python standard library uniquement (sans pip externe) avec respect du contrat d'erreur agent-ready (what, fix, recovery, code, context) sur verifier_deploiement.py, nettoyer_ghcr.py et compose_production.py.
- Isoler l'étape nettoyer_ghcr.py avec continue-on-error: true, flag --dry-run par défaut en local et paramètre --keep configurable.
- Préserver l'environnement de développement local (séparation docker-compose.prod.yml ou template dédié) et documenter le runbook de déploiement/rollback dans docs/deployment.md.
- Prévoir un échappatoire skip_verifier dans workflow_dispatch et une dégradation gracieuse dans vite.config.ts en l'absence de SENTRY_AUTH_TOKEN.
<!-- /autoplan-accepted:dx -->

<!-- autoplan-accepted:eng -->
- Sécuriser l'injection de SENTRY_AUTH_TOKEN via BuildKit secret exclusivement (--mount=type=secret,id=sentry_auth_token) et supprimer ARG/ENV SENTRY_AUTH_TOKEN du Dockerfile.
- Conditionner la vérification de tête de main dans deployer aux seuls événements push, et autoriser le rollback sur commit ancêtre de main via workflow_dispatch.
- Réserver formellement deja_teste.py au workflow ci.yml (tests/lint) et l'exclure impérativement de image.yml.
- Générer dist/version.json via vite.config.ts alimenté par le build-arg APP_VERSION sans dépendance à l'arborescence .git dans le conteneur.
- Configurer la route Nginx location = /version.json avec try_files $uri =404 et no-store, et tolérer les codes 502/503 temporaires dans verifier_deploiement.py avec paramètre cache-buster.
- Valider la logique des scripts d'assistance par une suite de tests unitaires (tests/test_ci_scripts.py sans dépendance externe) et valider la génération de version.json dans ci.yml.
- Restreindre les privilèges du miroir GitLab à un Fine-Grained GitHub PAT limité à family-flow en lecture seule.
<!-- /autoplan-accepted:eng -->

## Review record

<!-- autoplan-accepted:ceo -->
- Sécuriser l'injection de SENTRY_AUTH_TOKEN lors de la compilation Docker via BuildKit secret ou build runner, empêchant toute fuite de jeton dans les métadonnées ARG.
- Restreindre le DAST GitLab CI aux audits planifiés hebdomadaires ou manuels ($DAST_RUN == "true").
- Réduire le timeout du job verifier à 5 minutes avec en-têtes Nginx Cache-Control no-store sur /version.json.
<!-- /autoplan-accepted:ceo -->
<!-- autoplan-accepted:dx -->
- Rendre glab non-interactif et injecter le PAT GitHub de manière sécurisée via l'API GitLab pour le miroir sans fuite dans les logs.
- Standardiser les scripts d'assistance (.github/scripts/) en Python standard library uniquement (sans pip externe) avec respect du contrat d'erreur agent-ready (what, fix, recovery, code, context) sur verifier_deploiement.py, nettoyer_ghcr.py et compose_production.py.
- Isoler l'étape nettoyer_ghcr.py avec continue-on-error: true, flag --dry-run par défaut en local et paramètre --keep configurable.
- Préserver l'environnement de développement local (séparation docker-compose.prod.yml ou template dédié) et documenter le runbook de déploiement/rollback dans docs/deployment.md.
- Prévoir un échappatoire skip_verifier dans workflow_dispatch et une dégradation gracieuse dans vite.config.ts en l'absence de SENTRY_AUTH_TOKEN.
<!-- /autoplan-accepted:dx -->
<!-- autoplan-accepted:eng -->
- Sécuriser l'injection de SENTRY_AUTH_TOKEN via BuildKit secret exclusivement (--mount=type=secret,id=sentry_auth_token) et supprimer ARG/ENV SENTRY_AUTH_TOKEN du Dockerfile.
- Conditionner la vérification de tête de main dans deployer aux seuls événements push, et autoriser le rollback sur commit ancêtre de main via workflow_dispatch.
- Réserver formellement deja_teste.py au workflow ci.yml (tests/lint) et l'exclure impérativement de image.yml.
- Générer dist/version.json via vite.config.ts alimenté par le build-arg APP_VERSION sans dépendance à l'arborescence .git dans le conteneur.
- Configurer la route Nginx location = /version.json avec try_files $uri =404 et no-store, et tolérer les codes 502/503 temporaires dans verifier_deploiement.py avec paramètre cache-buster.
- Valider la logique des scripts d'assistance par une suite de tests unitaires (tests/test_ci_scripts.py sans dépendance externe) et valider la génération de version.json dans ci.yml.
- Restreindre les privilèges du miroir GitLab à un Fine-Grained GitHub PAT limité à family-flow en lecture seule.
<!-- /autoplan-accepted:eng -->

## Implementation Tasks

Synthesized from this review's findings. Each task derives from a specific finding above. Run with Claude Code or Codex; checkbox as you ship.

- [x] **T1 (P1, human: ~1h / CC: ~10min)** — GitLab Security Satellite — Créer le miroir privé GitLab et déployer .gitlab-ci.yml avec scanners Ultimate
  - Surfaced by: Étape 1 & findings ENG-08, CAP4
  - Files: `.gitlab-ci.yml`, `scripts/notify-newrelic.py`
  - Verify: Pipeline GitLab s'exécute et passe au vert sur le miroir.
- [x] **T2 (P1, human: ~1h / CC: ~10min)** — Sentry & Docker BuildKit — Configurer Sentry frontend, sourcemaps et BuildKit secret pour SENTRY_AUTH_TOKEN
  - Surfaced by: Étape 2 & findings ENG-07, ENG-09
  - Files: `Dockerfile`, `vite.config.ts`
  - Verify: Build local `npm run build` génère `dist/version.json` sans erreur même sans token Sentry.
- [x] **T3 (P1, human: ~2h / CC: ~15min)** — GitHub Actions CD — Créer workflow image.yml (build, push GHCR, push production, verifier, nettoyer)
  - Surfaced by: Étape 3 & findings ENG-01, ENG-03, CAP6
  - Files: `.github/workflows/image.yml`
  - Verify: Déclenchement manuel par `workflow_dispatch` fonctionne de bout en bout.
- [x] **T4 (P1, human: ~1.5h / CC: ~15min)** — Helper Scripts & Nginx — Développer les scripts Python standard library et la route Nginx /version.json
  - Surfaced by: Étape 4 & findings ENG-04, ENG-10, CAP6
  - Files: `.github/scripts/compose_production.py`, `.github/scripts/nettoyer_ghcr.py`, `.github/scripts/verifier_deploiement.py`, `.github/scripts/deja_teste.py`, `nginx.conf`, `docker-compose.prod.yml`
  - Verify: `tests/test_ci_scripts.py` passe avec 100% de succès.
- [x] **T5 (P2, human: ~45min / CC: ~10min)** — CI Test Suite — Créer la suite de tests unitaires des scripts et valider la génération de version.json dans ci.yml
  - Surfaced by: Findings ENG-02, ENG-05, ENG-06
  - Files: `tests/test_ci_scripts.py`, `.github/workflows/ci.yml`
  - Verify: `python3 -m unittest discover -s tests` passe au vert.
- [x] **T6 (P2, human: ~45min / CC: ~10min)** — Documentation — Rédiger le runbook opérationnel de déploiement et de rollback
  - Surfaced by: Findings DX-Documentation, Rollback Runbook
  - Files: `docs/deployment.md`
  - Verify: Fichier markdown complet et liens valides.
- [x] **T7 (P1, human: ~30min / CC: ~5min)** — Coolify Configuration — Reconfigurer Stop-Repeat sur Coolify pour déployer la branche production via Docker Compose
  - Surfaced by: Étape 5 & Recette finale
  - Files: Interface Coolify
  - Verify: `curl -s https://stop-repeat.tutotech.org/version.json` renvoie le SHA du commit déployé.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | CLEAR | mode: HOLD, 0 critical gaps, 3 obligations accepted |
| Outside Review | `codex-plan-review` | Independent 2nd opinion | 0 | unavailable | codex CLI not installed |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR | 0 issues, 0 critical gaps, 7 obligations accepted |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | SKIPPED | skipped (no UI scope detected) |
| DX Review | `/plan-devex-review` | Developer experience gaps | 1 | CLEAR | score: 6/10 → 8/10, TTHW: 1m → 1m, 5 obligations accepted |

OUTSIDE COVERAGE: codex unavailable (CLI not installed)
VERDICT: CEO + DX + ENG CLEARED — ready to implement

NO UNRESOLVED DECISIONS
