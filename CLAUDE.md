# CLAUDE.md — Portfolio Angular (Thomas)

## 🎯 Contexte du projet

Portfolio personnel full-stack :
- **Frontend** : Angular 21 (standalone, signals, zoneless par défaut, Vitest)
- **Backend** : Node.js + Express (API REST custom)
- **Base de données** : MySQL (requêtes SQL brutes via mysql2)
- **Styling** : SCSS custom
- **Tests** : Intégrés dès le début (Vitest côté Angular, Jest/Vitest côté Node)
- **Déploiement** : Docker → VPS OVH

### Objectifs à terme
- Afficher et gérer des articles/projets
- Admin panel pour CRUD des contenus
- Héberger des projets annexes (apps LAMP, serveur MCP) via Docker

---

## 🧑‍🏫 Mode d'interaction : Enseignant

### Principes
1. **Expliquer avant de montrer** : chaque concept est introduit avec le "pourquoi" avant le "comment"
2. **Guider, pas autocompléter** : donner des bouts de code à copier/adapter, mais Thomas écrit lui-même
3. **Donner du code quand nécessaire** : pas d'hésitation à fournir des snippets à copier, mais pas de fichiers entiers générés automatiquement
4. **Valider la compréhension** : poser des questions, proposer des mini-défis
5. **Bonnes pratiques 2025** : Angular 21 (standalone, signals, zoneless), TypeScript strict, ESLint, tests systématiques

### Format des réponses
- Expliquer le concept ou l'étape
- Donner le code à copier si nécessaire
- Indiquer où le placer et pourquoi
- Proposer un "checkpoint" pour vérifier que ça marche
- Inclure les tests correspondants quand pertinent

### Préférences d'exécution
- **Thomas exécute lui-même les commandes** : donner les commandes à copier, pas les exécuter automatiquement
- Fournir : la commande, les étapes, les résultats attendus
- Thomas interrompra si besoin d'aide ou si erreur

### Ce qu'on évite
- Générer des fichiers complets sans explication
- Autocomplétion ou scaffolding massif
- Sauter des étapes "parce que c'est évident"
- Exécuter des commandes sans demander (sauf recherche/lecture de code)

---

## 📁 Structure prévue du projet

```
portfolio/
├── frontend/                 # Angular 21
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # Composants standalone réutilisables
│   │   │   ├── pages/        # Pages/routes (lazy loaded)
│   │   │   ├── services/     # Services (API calls)
│   │   │   ├── models/       # Interfaces TypeScript
│   │   │   └── utils/        # Helpers, fonctions utilitaires
│   │   ├── styles/           # SCSS globaux, variables, mixins
│   │   └── environments/
│   ├── Dockerfile
│   └── vitest.config.ts
│
├── backend/                  # Node.js + Express
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/         # Logique métier
│   │   ├── repositories/     # Accès SQL (mysql2)
│   │   ├── middleware/
│   │   ├── config/
│   │   └── utils/
│   ├── tests/
│   └── Dockerfile
│
├── database/
│   ├── migrations/           # Scripts SQL versionnés
│   └── seeds/                # Données de test
│
├── docker-compose.yml        # Orchestration dev
├── docker-compose.prod.yml   # Orchestration prod
├── .env.example
└── README.md
```

---

## 🛤️ Roadmap (ordre suggéré)

### Phase 1 : Setup environnement ✅
- [x] Initialiser le repo Git avec .gitignore approprié
- [x] Installer Angular CLI v21, créer le projet frontend (zoneless, SCSS, Vitest)
- [x] Initialiser le projet Node/Express backend avec TypeScript
- [x] Setup Docker (Dockerfiles + docker-compose avec MySQL)
- [x] Vérifier que tout tourne en local
- [ ] Premier test qui passe (front + back) — *À valider*

### Phase 2 : Backend API ✅
- [x] Structure Express (routes, controllers, services, repositories)
- [x] Connexion MySQL avec mysql2 (pool de connexions)
- [x] Premières migrations SQL
- [x] CRUD projets : endpoints REST
- [x] Environment variables refactoring (backend/.env structure)
- [x] Docker secrets support (production-ready with secrets.ts)
- [x] Angular runtime configuration (build once, deploy anywhere)
- [x] Docker dev & prod environments fully functional
- [ ] Validation des données (express-validator ou Zod)
- [ ] Gestion d'erreurs centralisée
- [ ] Tests unitaires des repositories et controllers

### Phase 3 : Frontend Angular (EN COURS)
- [ ] Comprendre les standalone components
- [ ] Routing avec lazy loading
- [ ] Service HTTP pour appeler l'API
- [ ] Signals pour la gestion d'état
- [ ] Afficher la liste des projets
- [ ] Page détail d'un projet
- [ ] Tests des composants avec Vitest

### Phase 4 : Intégration & Style
- [x] Connexion front ↔ back (environnements, proxy dev) — *Configuration en place*
- [ ] Architecture SCSS (variables, mixins, structure)
- [ ] Design responsive mobile-first
- [ ] Animations de base

### Phase 5 : Admin Panel
- [ ] Authentification JWT (login, tokens, refresh)
- [ ] Guards Angular pour routes protégées
- [ ] Interface CRUD admin
- [ ] Upload d'images (optionnel)

### Phase 6 : Déploiement OVH
- [x] Docker Compose production optimisé — *docker-compose.prod.yml avec secrets*
- [ ] Reverse proxy (Nginx ou Traefik)
- [ ] HTTPS avec Let's Encrypt
- [ ] CI/CD avec GitHub Actions
- [x] Variables d'environnement sécurisées — *Docker secrets configurés*

### Phase 7 : Hébergement projets annexes
- [ ] Containeriser les projets LAMP existants
- [ ] Intégrer au docker-compose global
- [ ] Configuration sous-domaines ou chemins
- [ ] Monitoring basique

---

## 🌐 Langue

Tout le projet est en **anglais** :
- Code (variables, fonctions, classes)
- Commits et messages Git
- Commentaires et documentation
- Contenu du site (textes, articles)
- README et docs techniques

Les échanges dans Claude Code peuvent rester en français.

---

## 📚 Conventions de code

### TypeScript (front & back)
- **Strict mode** activé (`"strict": true`)
- Interfaces/types pour tous les modèles de données
- Pas de `any` sauf cas exceptionnel documenté
- Préférer `unknown` à `any` quand le type est vraiment inconnu

### Angular 21
- **Standalone components** uniquement (c'est le défaut maintenant)
- **Signals** pour l'état réactif (signal, computed, effect)
- **Zoneless** par défaut (pas de zone.js)
- Lazy loading systématique des routes
- Services injectés via `inject()` plutôt que constructor DI
- Tests avec **Vitest** (intégré par défaut dans CLI v21)

### SCSS
- Variables dans `_variables.scss`
- Mixins réutilisables dans `_mixins.scss`
- Approche BEM pour le nommage des classes
- Mobile-first (media queries min-width)

### Express / Node
- Architecture en couches : routes → controllers → services → repositories
- Repositories pour isoler l'accès SQL
- Middleware pour auth, validation, error handling
- Variables d'environnement via dotenv
- Tests avec Jest ou Vitest

### SQL (mysql2)
- Requêtes préparées systématiquement (sécurité injection SQL)
- Migrations versionnées dans `database/migrations/`
- Nommage : snake_case pour tables et colonnes
- Transactions pour opérations multiples

### Git
- Commits conventionnels : `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Branches : `main` (prod), `develop`, `feature/*`, `fix/*`
- PR obligatoires pour merge sur main (quand applicable)
- **Pas de co-authoring** : ne pas ajouter de mention `Co-authored-by` dans les commits (c'est le projet de Thomas, Claude est un outil d'assistance)

### Docker
- Multi-stage builds pour images optimisées
- Un service = un container
- Volumes nommés pour persistance MySQL
- Networks dédiés pour isolation

### Tests
- Écrire le test en même temps que la feature
- Nommage : `*.spec.ts` pour Angular, `*.test.ts` pour Node
- Coverage minimal visé : 70%

---

## 🔧 Stack technique détaillée

### Frontend
- Angular 21
- TypeScript 5.8+
- SCSS
- Vitest + Testing Library
- ESLint + Prettier

### Backend
- Node.js 22 LTS
- Express 5.x
- TypeScript 5.8+
- mysql2 (avec pool)
- express-validator ou Zod
- Jest ou Vitest
- ESLint + Prettier

### Infrastructure
- Docker + Docker Compose
- MySQL 8
- Nginx (reverse proxy)
- GitHub Actions (CI/CD)

---

## 🚀 Prochaine étape

**Phase 3 — Frontend Angular : Afficher les projets**

L'API backend est fonctionnelle et l'environnement est production-ready ! Maintenant on passe au frontend :

1. **Service HTTP** pour appeler l'API
2. **Composant ProjectCard** — afficher une carte de projet
3. **Page Projects** — lister tous les projets depuis l'API
4. **Styling & responsive** — SCSS mobile-first

Objectif : afficher les 3 projets depuis l'API dans des cartes visuellement attrayantes.

---

## 📝 Notes techniques importantes

### Environment Variables Architecture (Décembre 2025)

**Structure finale implémentée :**
```
backend/
  .env            # Docker Compose (committed with dev-safe values)
  .env.local      # Local npm run dev (gitignored)
  .env.example    # Template (committed)
```

**Principes clés :**
- **Dev local** : `npm run dev` charge `backend/.env.local` via dotenv
- **Dev Docker** : Compose utilise `backend/.env` via `env_file:`
- **Production** : Docker secrets montés dans `/run/secrets/` (lecture via `secrets.ts`)
- **Frontend** : Runtime config injection via `generate-config.sh` → `config.js` (build once, deploy anywhere)

**Leçons apprennées :**
- MySQL auto-escape les underscores dans `MYSQL_DATABASE` lors de la création de users → éviter les `_` dans les noms de DB
- `env_file:` dans docker-compose ne permet pas la substitution `${}` dans `environment:` → hardcoder les valeurs pour MySQL
- SSL désactivé pour réseau Docker interne (même serveur) est sécurisé
- Angular `environment.ts` = build-time → utiliser runtime injection pour vraie flexibilité

**Documentation complète :**
- Setup & troubleshooting : [docs/SETUP.md](docs/SETUP.md)
- Secrets management guide : [docs/technical/secrets-management-guide.md](docs/technical/secrets-management-guide.md)

---

*Dernière mise à jour : 3 Décembre 2025 — Phase 2 complétée + Environment refactoring*
