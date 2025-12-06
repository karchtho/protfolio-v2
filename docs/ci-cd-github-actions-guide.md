# CI/CD avec GitHub Actions — Guide Complet pour Portfolio v2

> Guide pédagogique pour mettre en place l'intégration et le déploiement continus sur le projet portfolio-v2 avec GitHub Actions

**Auteur** : Guide pour Thomas
**Date** : Décembre 2025
**Stack** : Angular 21 + Node.js/Express + MySQL + Docker
**Cible** : VPS OVH

---

## 📚 Table des matières

1. [Introduction : Qu'est-ce que CI/CD ?](#1-introduction--quest-ce-que-cicd-)
2. [GitHub Actions : Les bases](#2-github-actions--les-bases)
3. [Notre stratégie CI/CD](#3-notre-stratégie-cicd)
4. [Prérequis : Configuration initiale](#4-prérequis--configuration-initiale)
5. [Workflow 1 : Tests et validation (Pull Requests)](#5-workflow-1--tests-et-validation-pull-requests)
6. [Workflow 2 : Build et déploiement (Production)](#6-workflow-2--build-et-déploiement-production)
7. [Tester localement avant de committer](#7-tester-localement-avant-de-committer)
8. [Comprendre le processus de déploiement](#8-comprendre-le-processus-de-déploiement)
9. [Sécurité et bonnes pratiques](#9-sécurité-et-bonnes-pratiques)
10. [Troubleshooting](#10-troubleshooting)
11. [Améliorations futures](#11-améliorations-futures)

---

## 1. Introduction : Qu'est-ce que CI/CD ?

### Le problème sans CI/CD

Imagine le workflow manuel actuel :

1. Tu codes une nouvelle feature sur ta machine
2. Tu commites et push sur GitHub
3. Tu te connectes en SSH à ton VPS
4. Tu fais `git pull` manuellement
5. Tu rebuilds les images Docker (`docker compose build`)
6. Tu redémarres les services (`docker compose up -d`)
7. Tu vérifies que tout marche
8. Si ça plante, tu dois rollback manuellement

**Problèmes :**
- ⏱️ **Temps perdu** : 5-10 minutes à chaque déploiement
- 🐛 **Erreurs humaines** : oubli de rebuild, mauvaise commande, etc.
- 🔍 **Pas de validation** : aucun test automatique avant déploiement
- 😰 **Stress** : et si tu casses la prod un vendredi soir ?
- 🔄 **Reproductibilité** : chaque déploiement est légèrement différent

### La solution : CI/CD

**CI (Continuous Integration)** = Intégration Continue
- À chaque commit, lance automatiquement les tests
- Vérifie que le code compile
- Empêche de merger du code cassé

**CD (Continuous Deployment)** = Déploiement Continu
- À chaque merge sur `main`, déploie automatiquement en production
- Processus standardisé et reproductible
- Rollback facile si problème

### Les bénéfices pour toi

✅ **Push to deploy** : tu push sur `main` → ça déploie tout seul
✅ **Qualité** : tests automatiques sur chaque PR
✅ **Confiance** : tu sais que si ça merge, ça marche
✅ **Historique** : chaque déploiement est tracé et versionné
✅ **Rapidité** : déploiement en 2-3 minutes au lieu de 10
✅ **Focus** : tu codes, GitHub Actions s'occupe du reste

---

## 2. GitHub Actions : Les bases

### Architecture

GitHub Actions fonctionne avec des **workflows** (fichiers YAML) qui définissent des **jobs** (groupes de tâches) composés de **steps** (actions individuelles).

```
Workflow (fichier .yml)
  └── Jobs (test, build, deploy)
       └── Steps (checkout code, install deps, run tests)
```

### Anatomie d'un workflow

```yaml
name: Mon Workflow                    # Nom affiché dans GitHub

on:                                   # Événements déclencheurs
  push:
    branches: [main]                  # Sur push vers main
  pull_request:
    branches: [main]                  # Sur PR vers main

jobs:                                 # Liste des jobs
  test:                               # Nom du job
    runs-on: ubuntu-latest            # Environnement d'exécution
    steps:                            # Liste des étapes
      - name: Checkout code           # Nom de l'étape
        uses: actions/checkout@v4     # Action pré-fabriquée

      - name: Install dependencies
        run: npm ci                   # Commande shell à exécuter

      - name: Run tests
        run: npm test
```

### Concepts clés

#### Triggers (`on:`)
Les événements qui lancent le workflow :
- `push` : à chaque push sur une branche
- `pull_request` : quand on ouvre/update une PR
- `workflow_dispatch` : déclenchement manuel depuis GitHub UI
- `schedule` : cron job (ex: tous les jours à minuit)

#### Jobs
- **Parallèles par défaut** : plusieurs jobs s'exécutent en même temps
- **Dépendances** : `needs: [job1]` pour exécuter après un autre job
- **Conditionnels** : `if: github.ref == 'refs/heads/main'` pour exécuter selon conditions

#### Steps
- **`uses:`** : utilise une action du marketplace (ex: `actions/checkout@v4`)
- **`run:`** : exécute une commande shell
- **`env:`** : définit des variables d'environnement

#### Secrets
Données sensibles stockées dans GitHub (Settings → Secrets and variables → Actions) :
- Jamais affichés dans les logs
- Accessibles via `${{ secrets.NOM_DU_SECRET }}`
- Exemples : mots de passe, clés SSH, tokens API

---

## 3. Notre stratégie CI/CD

### Objectifs

**Pour les Pull Requests (vers `main`) :**
1. ✅ Vérifier que le code compile (frontend + backend)
2. ✅ Lancer les tests unitaires (quand on en aura)
3. ✅ Linter le code (ESLint, Prettier)
4. ✅ Vérifier les vulnérabilités (`npm audit`)
5. ❌ **Ne PAS déployer** (c'est juste une validation)

**Pour les merges sur `main` :**
1. ✅ Refaire tous les checks de la PR (sécurité)
2. ✅ Builder les images Docker (frontend + backend)
3. ✅ Se connecter au VPS en SSH
4. ✅ Déployer la nouvelle version
5. ✅ Lancer les migrations de base de données
6. ✅ Vérifier que les services sont up (healthcheck)

### Architecture des workflows

Nous allons créer **2 workflows** :

```
.github/
  └── workflows/
       ├── ci.yml              # Tests et validation (PRs)
       └── deploy-production.yml   # Build et déploiement (main)
```

#### Workflow 1 : `ci.yml`
- **Trigger** : Pull Requests vers `main`
- **Jobs** : lint, test, build (frontend + backend)
- **Durée** : ~3-5 minutes
- **Objectif** : Valider avant merge

#### Workflow 2 : `deploy-production.yml`
- **Trigger** : Push sur `main`
- **Jobs** : build → deploy
- **Durée** : ~5-8 minutes
- **Objectif** : Mettre en production

### Flux de travail complet

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Tu crées une branche feature/nouvelle-fonctionnalite    │
│    git checkout -b feature/nouvelle-fonctionnalite          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Tu codes, commits, push                                  │
│    git add . && git commit -m "feat: ..." && git push      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Tu ouvres une Pull Request sur GitHub                   │
│    → Déclenche automatiquement ci.yml                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. GitHub Actions lance les tests                          │
│    ✅ Lint OK  ✅ Build OK  ✅ Tests OK                     │
│    → Badge vert sur la PR                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Tu merge la PR sur main (bouton GitHub)                 │
│    → Déclenche automatiquement deploy-production.yml       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. GitHub Actions build et déploie sur ton VPS             │
│    → Site mis à jour automatiquement sur karcherthomas.com │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Prérequis : Configuration initiale

Avant de créer les workflows, tu dois configurer certaines choses **une seule fois**.

### 4.1. Créer une clé SSH pour GitHub Actions

GitHub Actions aura besoin de se connecter à ton VPS en SSH. On va créer une paire de clés dédiée.

**Sur ta machine locale** (ou sur le VPS, peu importe) :

```bash
# Créer une nouvelle paire de clés SSH (sans passphrase pour l'automatisation)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# Afficher la clé publique (à copier)
cat ~/.ssh/github_actions_deploy.pub
```

**Sur ton VPS** :

```bash
# Se connecter au VPS
ssh ton-user@karcherthomas.com

# Ajouter la clé publique aux clés autorisées
echo "ssh-ed25519 AAAAC3... github-actions-deploy" >> ~/.ssh/authorized_keys

# Vérifier les permissions (important pour SSH)
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

**Récupérer la clé privée** (à mettre dans GitHub Secrets) :

```bash
# Afficher la clé privée
cat ~/.ssh/github_actions_deploy

# Copier TOUT le contenu (y compris les lignes BEGIN/END)
```

### 4.2. Configurer les GitHub Secrets

Va sur GitHub → Ton repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Crée les secrets suivants :

| Nom du Secret | Valeur | Description |
|--------------|--------|-------------|
| `VPS_SSH_HOST` | `karcherthomas.com` (ou IP) | Adresse de ton VPS |
| `VPS_SSH_USER` | `ton-username` | User SSH sur le VPS |
| `VPS_SSH_KEY` | Contenu de `github_actions_deploy` | Clé privée SSH (tout le fichier) |
| `VPS_PROJECT_PATH` | `/home/ton-user/portfolio-v2` | Chemin du projet sur le VPS |
| `DB_USER` | Contenu de `secrets/db_user.txt` | User MySQL (pour migrations) |
| `DB_PASSWORD` | Contenu de `secrets/db_password.txt` | Password MySQL |
| `DB_NAME` | Contenu de `secrets/db_name.txt` | Nom de la DB |
| `MYSQL_ROOT_PASSWORD` | Contenu de `secrets/mysql_root_password.txt` | Root password MySQL |

**Important** : Les secrets `DB_*` et `MYSQL_ROOT_PASSWORD` ne sont nécessaires que si tu veux lancer les migrations depuis GitHub Actions. Si tu préfères les lancer manuellement, tu peux les omettre.

### 4.3. Tester la connexion SSH

Vérifie que GitHub Actions pourra se connecter :

```bash
# Sur ta machine, teste avec la clé privée
ssh -i ~/.ssh/github_actions_deploy ton-user@karcherthomas.com

# Si ça marche sans demander de mot de passe → OK !
```

### 4.4. Structure des secrets sur le VPS

Assure-toi que ton VPS a bien la structure suivante :

```
/home/ton-user/portfolio-v2/
├── frontend/
├── backend/
├── database/
├── secrets/              # ← Secrets Docker
│   ├── db_user.txt
│   ├── db_password.txt
│   ├── db_name.txt
│   └── mysql_root_password.txt
└── docker-compose.prod.yml
```

Les fichiers `secrets/*.txt` doivent contenir **uniquement** la valeur, sans retour à la ligne superflu.

---

## 5. Workflow 1 : Tests et validation (Pull Requests)

### Objectif

Ce workflow se lance sur chaque **Pull Request vers `main`**. Il valide que le code est propre et fonctionnel **avant** de merger.

### Ce qu'il fait

1. **Checkout** le code
2. **Lint** frontend + backend (ESLint, Prettier)
3. **Build** frontend + backend (vérifier que ça compile)
4. **Tests** unitaires (quand tu en auras)
5. **Audit** de sécurité (`npm audit`)

### Création du fichier

**Commande à exécuter** :

```bash
# Créer le dossier .github/workflows
mkdir -p .github/workflows

# Créer le fichier ci.yml (tu vas y mettre le contenu ci-dessous)
touch .github/workflows/ci.yml
```

**Contenu de `.github/workflows/ci.yml`** :

```yaml
name: CI — Tests and Validation

# Déclenché sur les PRs vers main
on:
  pull_request:
    branches:
      - main

# Permissions minimales (sécurité)
permissions:
  contents: read
  pull-requests: write  # Pour commenter sur la PR si besoin

jobs:
  # ============================================
  # JOB 1 : Lint Frontend
  # ============================================
  lint-frontend:
    name: Lint Frontend (Angular)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: 'frontend/package-lock.json'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      # Optionnel : vérifier le format avec Prettier
      # - name: Check formatting
      #   run: npm run format:check

  # ============================================
  # JOB 2 : Lint Backend
  # ============================================
  lint-backend:
    name: Lint Backend (Node.js)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: 'backend/package-lock.json'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

  # ============================================
  # JOB 3 : Build Frontend
  # ============================================
  build-frontend:
    name: Build Frontend (Angular)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: 'frontend/package-lock.json'

      - name: Install dependencies
        run: npm ci

      - name: Build Angular app
        run: npm run build -- --configuration production

      # Optionnel : uploader l'artefact pour inspection
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: frontend-dist
          path: frontend/dist/
          retention-days: 7

  # ============================================
  # JOB 4 : Build Backend
  # ============================================
  build-backend:
    name: Build Backend (TypeScript)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: 'backend/package-lock.json'

      - name: Install dependencies
        run: npm ci

      - name: Build TypeScript
        run: npm run build

  # ============================================
  # JOB 5 : Tests Frontend (optionnel pour l'instant)
  # ============================================
  # test-frontend:
  #   name: Test Frontend (Vitest)
  #   runs-on: ubuntu-latest
  #   defaults:
  #     run:
  #       working-directory: ./frontend
  #   steps:
  #     - uses: actions/checkout@v4
  #     - uses: actions/setup-node@v4
  #       with:
  #         node-version: '20'
  #         cache: 'npm'
  #         cache-dependency-path: 'frontend/package-lock.json'
  #     - run: npm ci
  #     - run: npm test -- --run  # Vitest en mode CI

  # ============================================
  # JOB 6 : Security Audit
  # ============================================
  security-audit:
    name: Security Audit (npm audit)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Audit Frontend
        working-directory: ./frontend
        run: |
          npm ci
          npm audit --audit-level=moderate
        continue-on-error: true  # Ne fait pas échouer le workflow

      - name: Audit Backend
        working-directory: ./backend
        run: |
          npm ci
          npm audit --audit-level=moderate
        continue-on-error: true
```

### Explication du workflow

#### Structure globale

```yaml
on:
  pull_request:
    branches: [main]  # Se déclenche UNIQUEMENT sur les PRs vers main
```

Cela signifie : si tu ouvres une PR de `feature/xyz` vers `main`, ce workflow se lance automatiquement.

#### Jobs parallèles

Tous les jobs (`lint-frontend`, `lint-backend`, `build-frontend`, etc.) s'exécutent **en parallèle** par défaut. Cela accélère le workflow (2-3 minutes au lieu de 10).

#### `defaults.run.working-directory`

```yaml
defaults:
  run:
    working-directory: ./frontend
```

Cela signifie : toutes les commandes `run:` de ce job s'exécutent dans le dossier `./frontend`. Plus besoin de faire `cd frontend` à chaque fois.

#### Caching des dépendances

```yaml
uses: actions/setup-node@v4
with:
  node-version: '20'
  cache: 'npm'
  cache-dependency-path: 'frontend/package-lock.json'
```

GitHub Actions **met en cache** `node_modules` basé sur le hash de `package-lock.json`. Si le fichier n'a pas changé, il restore le cache → **gain de 30-60 secondes** par job.

#### `npm ci` vs `npm install`

```yaml
run: npm ci
```

`npm ci` est la version **CI-friendly** de `npm install` :
- Plus rapide (skip certaines vérifications)
- Supprime `node_modules` avant d'installer (installation propre)
- Utilise exactement les versions de `package-lock.json` (reproductible)

#### Artifacts

```yaml
- name: Upload build artifacts
  uses: actions/upload-artifact@v4
  with:
    name: frontend-dist
    path: frontend/dist/
    retention-days: 7
```

Cela permet de **télécharger** le build depuis GitHub UI (onglet Actions → workflow → artifacts). Utile pour inspecter ce qui a été compilé.

#### `continue-on-error: true`

```yaml
run: npm audit --audit-level=moderate
continue-on-error: true
```

Si `npm audit` trouve des vulnérabilités, ça **n'empêche pas** le workflow de réussir. C'est juste un warning. Tu peux retirer cette ligne si tu veux être strict.

### Tester le workflow

1. **Commiter le fichier** :
   ```bash
   git add .github/workflows/ci.yml
   git commit -m "chore: add CI workflow for pull requests"
   git push
   ```

2. **Créer une branche de test** :
   ```bash
   git checkout -b test/ci-workflow
   echo "test" >> README.md
   git commit -am "test: trigger CI"
   git push -u origin test/ci-workflow
   ```

3. **Ouvrir une Pull Request** sur GitHub (de `test/ci-workflow` vers `main`)

4. **Observer** : va sur l'onglet **Actions** de ton repo GitHub, tu devrais voir le workflow "CI — Tests and Validation" en cours d'exécution.

5. **Badge sur la PR** : sur ta PR, tu verras des checks verts ✅ si tout passe.

---

## 6. Workflow 2 : Build et déploiement (Production)

### Objectif

Ce workflow se lance sur chaque **push sur `main`** (typiquement après un merge de PR). Il build les images Docker et déploie sur ton VPS.

### Ce qu'il fait

1. **Checkout** le code
2. **Build** les images Docker (frontend + backend)
3. **Se connecter** au VPS en SSH
4. **Pull** le code sur le VPS
5. **Copier** les secrets Docker si nécessaire
6. **Rebuild** les images Docker sur le VPS (pour utiliser les secrets locaux)
7. **Lancer les migrations** de base de données
8. **Redémarrer** les services avec `docker compose up -d`
9. **Vérifier** que les services sont up (healthcheck)

### Création du fichier

**Commande à exécuter** :

```bash
touch .github/workflows/deploy-production.yml
```

**Contenu de `.github/workflows/deploy-production.yml`** :

```yaml
name: Deploy to Production

# Déclenché sur push vers main (après merge de PR)
on:
  push:
    branches:
      - main
  workflow_dispatch:  # Permet de lancer manuellement depuis GitHub UI

# Permissions minimales
permissions:
  contents: read

jobs:
  # ============================================
  # JOB 1 : Deploy to VPS
  # ============================================
  deploy:
    name: Deploy to VPS OVH
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://karcherthomas.com

    steps:
      # ──────────────────────────────────────────
      # 1. Checkout code
      # ──────────────────────────────────────────
      - name: Checkout code
        uses: actions/checkout@v4

      # ──────────────────────────────────────────
      # 2. Setup SSH key
      # ──────────────────────────────────────────
      - name: Setup SSH key
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.VPS_SSH_KEY }}" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H ${{ secrets.VPS_SSH_HOST }} >> ~/.ssh/known_hosts

      # ──────────────────────────────────────────
      # 3. Deploy to VPS
      # ──────────────────────────────────────────
      - name: Deploy application
        env:
          SSH_HOST: ${{ secrets.VPS_SSH_HOST }}
          SSH_USER: ${{ secrets.VPS_SSH_USER }}
          PROJECT_PATH: ${{ secrets.VPS_PROJECT_PATH }}
        run: |
          ssh -i ~/.ssh/deploy_key $SSH_USER@$SSH_HOST << 'ENDSSH'
            set -e  # Exit on error

            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "🚀 Starting deployment..."
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

            # Navigate to project directory
            cd ${{ secrets.VPS_PROJECT_PATH }}

            # Pull latest code
            echo "📥 Pulling latest code from GitHub..."
            git fetch origin
            git reset --hard origin/main

            # Stop services
            echo "🛑 Stopping services..."
            docker compose -f docker-compose.prod.yml down

            # Rebuild images (important: uses local secrets/)
            echo "🔨 Building Docker images..."
            docker compose -f docker-compose.prod.yml build --no-cache

            # Run database migrations
            echo "🗄️  Running database migrations..."
            docker compose -f docker-compose.prod.yml up -d mysql
            sleep 10  # Wait for MySQL to be ready
            # Migrations run automatically via /docker-entrypoint-initdb.d/

            # Start all services
            echo "🚀 Starting all services..."
            docker compose -f docker-compose.prod.yml up -d

            # Wait for services to be ready
            echo "⏳ Waiting for services to be healthy..."
            sleep 20

            # Check service health
            echo "🏥 Checking service health..."
            docker compose -f docker-compose.prod.yml ps

            # Cleanup old images
            echo "🧹 Cleaning up old Docker images..."
            docker image prune -f

            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "✅ Deployment completed successfully!"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          ENDSSH

      # ──────────────────────────────────────────
      # 4. Verify deployment
      # ──────────────────────────────────────────
      - name: Verify deployment
        run: |
          echo "🔍 Verifying deployment..."

          # Check if site is accessible
          HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://karcherthomas.com)

          if [ "$HTTP_STATUS" -eq 200 ]; then
            echo "✅ Site is accessible (HTTP $HTTP_STATUS)"
          else
            echo "❌ Site returned HTTP $HTTP_STATUS"
            exit 1
          fi

          # Check API health endpoint
          API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://karcherthomas.com/api/health)

          if [ "$API_STATUS" -eq 200 ]; then
            echo "✅ API is healthy (HTTP $API_STATUS)"
          else
            echo "⚠️  API health check failed (HTTP $API_STATUS)"
            # Don't fail deployment if API health endpoint doesn't exist yet
          fi

      # ──────────────────────────────────────────
      # 5. Cleanup SSH key
      # ──────────────────────────────────────────
      - name: Cleanup
        if: always()
        run: |
          rm -f ~/.ssh/deploy_key
```

### Explication du workflow

#### Trigger

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:  # Manuel trigger
```

- Se lance automatiquement sur **chaque push vers `main`**
- `workflow_dispatch` permet de lancer manuellement depuis GitHub UI (onglet Actions → workflow → Run workflow)

#### Environment

```yaml
environment:
  name: production
  url: https://karcherthomas.com
```

Définit un **environnement GitHub** appelé "production". Avantages :
- Les secrets peuvent être scopés à cet environnement
- Tu peux configurer des **reviewers** (ex: approuver manuellement avant déploiement)
- L'URL s'affiche dans l'interface GitHub

Pour activer les reviewers (optionnel) :
Settings → Environments → production → Required reviewers

#### SSH Connection

```yaml
- name: Setup SSH key
  run: |
    mkdir -p ~/.ssh
    echo "${{ secrets.VPS_SSH_KEY }}" > ~/.ssh/deploy_key
    chmod 600 ~/.ssh/deploy_key
    ssh-keyscan -H ${{ secrets.VPS_SSH_HOST }} >> ~/.ssh/known_hosts
```

**Explication ligne par ligne** :
1. `mkdir -p ~/.ssh` : crée le dossier `.ssh` dans le runner GitHub Actions
2. `echo "${{ secrets.VPS_SSH_KEY }}" > ~/.ssh/deploy_key` : écrit la clé privée depuis les secrets GitHub
3. `chmod 600 ~/.ssh/deploy_key` : permissions SSH strictes (sinon SSH refuse la clé)
4. `ssh-keyscan` : ajoute l'empreinte du VPS aux `known_hosts` (évite le prompt "Are you sure?")

#### Heredoc SSH

```yaml
ssh -i ~/.ssh/deploy_key $SSH_USER@$SSH_HOST << 'ENDSSH'
  # Commandes à exécuter sur le VPS
  cd /path/to/project
  git pull
  docker compose up -d
ENDSSH
```

Le **heredoc** (`<< 'ENDSSH'`) permet d'exécuter **plusieurs commandes** en une seule connexion SSH. Les guillemets autour de `'ENDSSH'` empêchent l'expansion des variables côté local (elles sont interprétées côté VPS).

#### Deployment Steps

```bash
git reset --hard origin/main  # Force pull (écrase les changements locaux)
docker compose down           # Stop les services
docker compose build --no-cache  # Rebuild les images (sans cache)
docker compose up -d mysql    # Start MySQL d'abord
sleep 10                      # Attendre que MySQL soit prêt
docker compose up -d          # Start tous les services
```

**Pourquoi `--no-cache` ?**
Force Docker à rebuilder complètement les images. Utile pour éviter les problèmes de cache (ex: anciennes dépendances npm).

**Pourquoi `sleep 10` ?**
Les migrations SQL (dans `database/migrations/`) s'exécutent automatiquement au démarrage de MySQL (via `/docker-entrypoint-initdb.d/`). On attend que MySQL soit prêt avant de lancer les autres services.

#### Health Check

```bash
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://karcherthomas.com)
if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Site is accessible"
else
  echo "❌ Site returned HTTP $HTTP_STATUS"
  exit 1
fi
```

Vérifie que le site répond avec HTTP 200. Si ça échoue, le workflow échoue → tu es notifié.

#### Cleanup

```yaml
- name: Cleanup
  if: always()
  run: rm -f ~/.ssh/deploy_key
```

`if: always()` signifie : **exécute même si le workflow échoue**. Important pour nettoyer la clé SSH du runner.

### Tester le workflow

1. **Commiter le fichier** :
   ```bash
   git add .github/workflows/deploy-production.yml
   git commit -m "chore: add production deployment workflow"
   git push origin main  # ⚠️ Attention : cela va déclencher un déploiement !
   ```

2. **Observer le déploiement** :
   - Va sur GitHub → Actions → "Deploy to Production"
   - Tu verras chaque étape s'exécuter en temps réel
   - Les logs SSH seront visibles (avec les emojis !)

3. **Vérifier que ça marche** :
   ```bash
   curl https://karcherthomas.com
   # Devrait afficher ton site
   ```

---

## 7. Tester localement avant de committer

Avant de committer tes workflows, tu peux les **tester localement** avec un outil appelé **act**.

### Installation de `act`

**Sur Linux** :
```bash
# Avec curl
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Ou avec un package manager
# Ubuntu/Debian
curl -s https://api.github.com/repos/nektos/act/releases/latest \
| grep "browser_download_url.*act_Linux_x86_64.tar.gz" \
| cut -d : -f 2,3 \
| tr -d \" \
| wget -qi -
tar xzf act_Linux_x86_64.tar.gz
sudo mv act /usr/local/bin/
```

**Sur macOS** :
```bash
brew install act
```

### Utilisation

```bash
# Lister les workflows disponibles
act -l

# Simuler un push sur main (déclenche deploy-production.yml)
act push -n  # -n = dry run (ne fait rien, affiche juste ce qui serait exécuté)

# Simuler une pull request (déclenche ci.yml)
act pull_request -n

# Exécuter réellement un workflow (sans -n)
act pull_request
```

**Limitations** :
- `act` utilise Docker pour simuler les runners GitHub
- Il ne peut pas accéder aux secrets GitHub (tu dois les passer manuellement)
- Les actions `ssh` ne marcheront pas localement (pas de connexion au VPS)

**Usage recommandé** : utilise `act` pour tester la **syntaxe** et les jobs de **build/test**, mais pas le déploiement SSH.

---

## 8. Comprendre le processus de déploiement

### Que se passe-t-il exactement quand tu push sur `main` ?

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Tu push sur main (ou merge une PR)                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. GitHub détecte le push et lance deploy-production.yml   │
│    → Un runner Ubuntu démarre (machine virtuelle éphémère) │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Checkout du code (actions/checkout@v4)                  │
│    → Le runner télécharge ton repo                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Setup SSH key                                            │
│    → Crée ~/.ssh/deploy_key avec la clé privée             │
│    → Ajoute ton VPS aux known_hosts                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Connexion SSH au VPS                                     │
│    → ssh -i ~/.ssh/deploy_key user@karcherthomas.com       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Sur le VPS : git reset --hard origin/main               │
│    → Force le code local à être identique à GitHub         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. docker compose down                                      │
│    → Stop les containers frontend, backend, mysql          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. docker compose build --no-cache                          │
│    → Rebuild les images Docker (frontend + backend)        │
│    → Compile Angular, compile TypeScript                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. docker compose up -d mysql                               │
│    → Démarre MySQL                                          │
│    → Exécute les migrations (*.sql dans /docker-entrypoint-initdb.d/) │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 10. sleep 10 (attendre que MySQL soit prêt)                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 11. docker compose up -d                                    │
│     → Démarre frontend + backend                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 12. Healthcheck : curl https://karcherthomas.com           │
│     → Vérifie que le site répond                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 13. Cleanup : rm -f ~/.ssh/deploy_key                      │
│     → Supprime la clé SSH du runner                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ ✅ Déploiement terminé ! Site mis à jour.                  │
└─────────────────────────────────────────────────────────────┘
```

### Durée estimée

- **CI (tests)** : ~3-5 minutes (jobs parallèles)
- **Deploy (production)** : ~5-8 minutes (build Docker + redémarrage)

**Total** : ~10-12 minutes du push au site mis à jour.

### Downtime ?

Oui, il y a un **petit downtime** (~20-30 secondes) pendant que :
1. `docker compose down` stop les services
2. `docker compose up -d` les redémarre

Pour éviter ça, il faudrait implémenter du **blue-green deployment** ou du **rolling update**, mais c'est plus complexe. Pour un portfolio perso, c'est acceptable.

---

## 9. Sécurité et bonnes pratiques

### ✅ Ce qu'on a fait

1. **Clé SSH dédiée** : utilisée uniquement pour GitHub Actions, pas ta clé perso
2. **Secrets GitHub** : jamais de credentials hardcodés dans le code
3. **Permissions minimales** : `permissions: contents: read` dans les workflows
4. **Cleanup SSH key** : suppression de la clé après utilisation
5. **`ssh-keyscan`** : évite le MITM (man-in-the-middle) attack

### ⚠️ Améliorations possibles

#### Utiliser OIDC au lieu de SSH key

**Problème actuel** : la clé SSH privée est stockée dans GitHub Secrets. Si GitHub est compromis, la clé l'est aussi.

**Solution** : utiliser OpenID Connect (OIDC) pour générer des tokens temporaires.

**Complexité** : moyenne (nécessite de configurer un serveur OIDC sur le VPS).

**Pour l'instant** : la clé SSH est suffisante pour un projet perso.

#### Rollback automatique

**Problème actuel** : si le déploiement échoue, le site peut être cassé.

**Solution** : détecter les erreurs et rollback automatiquement au commit précédent.

**Implémentation** :
```yaml
- name: Rollback on failure
  if: failure()
  run: |
    ssh -i ~/.ssh/deploy_key $SSH_USER@$SSH_HOST << 'ENDSSH'
      cd ${{ secrets.VPS_PROJECT_PATH }}
      git reset --hard HEAD~1
      docker compose up -d
    ENDSSH
```

#### Blue-Green Deployment

**Problème actuel** : downtime de 20-30 secondes pendant le redémarrage.

**Solution** : maintenir 2 environnements (blue + green), basculer le trafic sans downtime.

**Complexité** : élevée (nécessite un load balancer).

**Pour l'instant** : pas nécessaire pour un portfolio.

#### Notifications Slack/Discord

Être notifié sur Slack/Discord quand un déploiement réussit/échoue.

**Exemple** :
```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 10. Troubleshooting

### Erreur : "Permission denied (publickey)"

**Cause** : la clé SSH n'est pas correctement configurée.

**Solution** :
1. Vérifie que `VPS_SSH_KEY` dans GitHub Secrets contient **toute** la clé privée (y compris `-----BEGIN OPENSSH PRIVATE KEY-----`)
2. Vérifie que la clé publique est dans `~/.ssh/authorized_keys` sur le VPS
3. Teste manuellement :
   ```bash
   ssh -i ~/.ssh/github_actions_deploy ton-user@karcherthomas.com
   ```

### Erreur : "Host key verification failed"

**Cause** : l'empreinte SSH du VPS n'est pas dans `known_hosts`.

**Solution** : le `ssh-keyscan` devrait le faire automatiquement, mais tu peux le faire manuellement :
```bash
ssh-keyscan -H karcherthomas.com >> ~/.ssh/known_hosts
```

### Workflow échoue sur `npm audit`

**Cause** : des vulnérabilités détectées dans les dépendances.

**Solutions** :
1. Mettre à jour les dépendances :
   ```bash
   npm audit fix
   ```
2. Ou ignorer temporairement en ajoutant `continue-on-error: true` (comme dans le workflow)

### Build Docker échoue

**Cause** : souvent un problème de dépendances ou de contexte Docker.

**Debug** :
1. Vérifie les logs du workflow GitHub Actions
2. Reproduis localement :
   ```bash
   docker compose -f docker-compose.prod.yml build frontend
   ```
3. Si ça marche localement mais pas sur le VPS, vérifie l'espace disque :
   ```bash
   ssh ton-user@karcherthomas.com df -h
   ```

### MySQL migrations ne s'exécutent pas

**Cause** : les fichiers `.sql` dans `database/migrations/` ne sont pas copiés dans le container.

**Vérification** :
```yaml
# Dans docker-compose.prod.yml
volumes:
  - ./database/migrations:/docker-entrypoint-initdb.d:ro
```

**Note** : les migrations ne s'exécutent que si la DB est vide (première initialisation). Pour forcer :
```bash
docker compose down -v  # Supprime les volumes
docker compose up -d    # Recrée tout
```

### Site inaccessible après déploiement

**Debug** :
1. Vérifie que les services tournent :
   ```bash
   ssh ton-user@karcherthomas.com
   docker compose -f docker-compose.prod.yml ps
   ```

2. Vérifie les logs :
   ```bash
   docker compose -f docker-compose.prod.yml logs frontend
   docker compose -f docker-compose.prod.yml logs backend
   ```

3. Vérifie Nginx :
   ```bash
   sudo nginx -t  # Tester la config
   sudo systemctl status nginx
   ```

4. Vérifie le pare-feu :
   ```bash
   sudo ufw status
   # Doit autoriser 80 et 443
   ```

---

## 11. Améliorations futures

### Phase 1 : Tests automatiques

Quand tu auras des tests (Vitest pour Angular, Jest pour Node), décommente les jobs de test dans `ci.yml`.

**Frontend** :
```yaml
- name: Run Vitest
  run: npm test -- --run --coverage
```

**Backend** :
```yaml
- name: Run Jest
  run: npm test -- --coverage
```

### Phase 2 : Code coverage

Uploader les rapports de couverture vers Codecov.io pour voir quelles parties du code sont testées.

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  with:
    files: ./coverage/coverage-final.json
    token: ${{ secrets.CODECOV_TOKEN }}
```

### Phase 3 : Déploiement par environnement

Créer un environnement **staging** pour tester avant la prod.

```
develop → staging
main → production
```

**Workflow** :
- Push sur `develop` → déploie sur `staging.karcherthomas.com`
- Push sur `main` → déploie sur `karcherthomas.com`

### Phase 4 : Docker Registry

Actuellement, on rebuild les images **sur le VPS**. Pour accélérer, on peut :
1. Builder les images dans GitHub Actions
2. Les pusher sur Docker Hub ou GitHub Container Registry
3. Les puller sur le VPS

**Avantages** :
- Build plus rapide (GitHub Actions a plus de CPU)
- Traçabilité (chaque image est versionnée)
- Possibilité de rollback facile (pull une ancienne image)

**Inconvénient** :
- Complexité accrue
- Besoin d'un registry (Docker Hub gratuit pour 1 image privée)

### Phase 5 : Semantic versioning

Utiliser `semantic-release` pour générer automatiquement les versions et changelogs basés sur les commits.

```
feat: nouvelle feature → version 1.1.0
fix: bug fix → version 1.0.1
BREAKING CHANGE: → version 2.0.0
```

### Phase 6 : E2E tests dans CI

Lancer des tests end-to-end (Playwright, Cypress) avant de déployer.

```yaml
- name: Run E2E tests
  run: |
    npm run build
    npm run e2e
```

---

## 🎯 Récapitulatif

### Ce que tu as maintenant

✅ **CI automatique** : tests et validation sur chaque PR
✅ **CD automatique** : déploiement sur chaque push vers `main`
✅ **Sécurité** : SSH key dédiée, secrets GitHub
✅ **Traçabilité** : chaque déploiement est tracé dans GitHub Actions
✅ **Rollback** : `git reset --hard` à un commit précédent si besoin

### Workflow quotidien

```bash
# 1. Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# 2. Coder
# ...

# 3. Commiter et push
git add .
git commit -m "feat: ajouter nouvelle fonctionnalite"
git push -u origin feature/nouvelle-fonctionnalite

# 4. Ouvrir une PR sur GitHub
# → CI se lance automatiquement

# 5. Si les checks passent, merger la PR
# → Déploiement automatique sur production

# 6. Vérifier que le site est à jour
curl https://karcherthomas.com
```

### Commandes utiles

```bash
# Voir les workflows disponibles
ls .github/workflows/

# Voir les logs du dernier déploiement
# → GitHub.com → Actions → Deploy to Production → logs

# Lancer un déploiement manuellement
# → GitHub.com → Actions → Deploy to Production → Run workflow

# Rollback manuel (sur le VPS)
ssh ton-user@karcherthomas.com
cd /path/to/portfolio-v2
git reset --hard HEAD~1  # Revenir au commit précédent
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 📚 Ressources

- **GitHub Actions Docs** : https://docs.github.com/en/actions
- **Docker Compose Docs** : https://docs.docker.com/compose/
- **Semantic Release** : https://semantic-release.gitbook.io/
- **Act (local testing)** : https://github.com/nektos/act
- **GitHub Actions Marketplace** : https://github.com/marketplace?type=actions

---

**Félicitations !** 🎉 Tu as maintenant un pipeline CI/CD professionnel pour ton portfolio. Chaque push vers `main` déploie automatiquement ton site en production.

**Prochaine étape** : implémenter les tests unitaires pour avoir encore plus de confiance dans tes déploiements automatiques.
