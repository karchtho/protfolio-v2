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
- [x] Premier test qui passe (front + back) — *À valider*

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

### Phase 3 : Frontend Angular ✅
- [x] Comprendre les standalone components
- [x] Composant Button réutilisable (variant system, SCSS modulaire)
- [x] Composant ProjectCard (affichage des projets avec thumbnail)
- [x] Routing avec lazy loading (Layout parent + children routes)
- [x] Service HTTP pour appeler l'API (ProjectsService avec HttpClient)
- [x] Signals pour la gestion d'état (projects, loading, error signals)
- [x] Afficher la liste des projets depuis l'API (Projects page opérationnelle)
- [x] Theme Service (light/dark/auto avec localStorage)
- [x] Page Home (hero + featured projects + Skills section)
- [x] SkeletonCard component (loading states)
- [x] SkillBadge component (code-styled badges)
- [ ] Page détail d'un projet (avec carousel d'images)
- [ ] Tests des composants avec Vitest

### Phase 3.5 : Layout & Navigation ✅
- [x] Composant Layout (wrapper avec navbar + router-outlet + footer)
- [x] Navbar component (navigation + theme toggle iOS-style slider)
- [x] Footer component (copyright + social links)
- [x] **Code refactoring** : OnPush partout, breakpoints centralisés, prefers-reduced-motion
- [x] Page Home (hero section + featured projects + Skills section + scroll anchors)
- [ ] Mobile responsive menu (hamburger)

### Phase 4 : Intégration & Style
- [x] Connexion front ↔ back (environnements, proxy dev)
- [x] Architecture SCSS (tokens OKLCH, themes, utilities) — *Système complet implémenté*
- [x] **DB schema images** : colonnes `thumbnail` + `images` JSON, seeds avec placeholders
- [x] **Volume Docker uploads** : persistance configurée dans docker-compose
- [ ] **Backend upload API** : Multer + routes POST/DELETE + validation (À FAIRE)
- [ ] Design responsive mobile-first
- [ ] Animations de base

### Phase 5 : Admin Panel
- [ ] Authentification JWT (login, tokens, refresh)
- [ ] Guards Angular pour routes protégées
- [ ] Interface CRUD admin
- [ ] Upload d'images (Multer + stockage fichier local, voir section Images)

### Phase 6 : Déploiement OVH
- [x] Docker Compose production optimisé — *docker-compose.prod.yml avec secrets*
- [x] Reverse proxy (Nginx ou Traefik)
- [x] HTTPS avec Let's Encrypt
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
- **ChangeDetectionStrategy.OnPush** obligatoire sur TOUS les composants
- **`:host { display: block }`** pour pages et composants containers (évite les problèmes de layout inline)
- Lazy loading systématique des routes
- Services injectés via `inject()` plutôt que constructor DI
- **PAS de `@HostListener` ou `@HostBinding`** → utiliser `host` property dans le decorator
- Tests avec **Vitest** (intégré par défaut dans CLI v21)
- {`host : {classs: exempleclasse}` evrywhere ? need to check good pratice}
- check @use at @ forward for scss imports

### SCSS & Design System
- **TOUJOURS utiliser les tokens de couleur** (`--primary`, `--text-secondary`, etc.) — jamais de couleurs hardcodées, jamais de `rgba()` hardcodé
- **OKLCH pour toutes les couleurs** : utiliser `oklch(from var(--color) l c h / alpha)` pour les variations
- **Utiliser les design tokens** :
  - **Typography** : `var(--font-size-xs)` à `var(--font-size-5xl)`, `var(--font-weight-normal)` à `var(--font-weight-bold)`, `var(--line-height-tight/normal/relaxed)`
  - **Spacing** : `var(--spacing-1)` (4px) à `var(--spacing-24)` (96px) pour padding/margin/gap
  - **Transitions** : `var(--transition-fast/base/slow)` avec `var(--ease-in/out/in-out)`
  - **Border radius** : `var(--radius-sm/default/md/lg/xl/full)`
  - **Shadows** : `var(--shadow-xs/sm/md/lg/xl)`
  - Tous définis dans `_design-tokens.scss`
- **Respecter la charte graphique** : typographie (Poppins, Source Sans 3), tailles, weights
- **Theme-aware** : les variables CSS changent automatiquement selon `data-theme` (light/dark)
- **Accessibilité** : `prefers-reduced-motion` obligatoire pour toutes les animations
- **Utiliser les utility classes** : `.container`, `.card`, `.shadow-*`, etc. → éviter la duplication
- **Breakpoints centralisés** : utiliser `$breakpoint-mobile`, `$breakpoint-tablet` depuis `_variables.scss`
- **BEM strict avec SCSS nesting** : noms de classe BEM complets dans HTML (`navbar__brand`), mais utiliser `&__` dans SCSS pour profiter du nesting
- Mobile-first (media queries min-width)
- **Documentation** : voir `docs/technical/style-system/` pour les guidelines

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

**Phase 3.5 — Layout & Navigation : Page Home** ✅ Terminé !

**État actuel (Décembre 5, 2025) :**
- ✅ Layout wrapper (navbar + router-outlet + footer)
- ✅ Routing restructuré avec lazy loading (parent/children)
- ✅ **Navbar complète** : logo, nav links (active state), theme slider iOS-style avec SVG icons + labels
- ✅ **Footer complet** : copyright + social links (GitHub, LinkedIn, Email) avec SVG icons
- ✅ **Design tokens system** : typography, spacing, transitions, border-radius, shadows (tous dans `_design-tokens.scss`)
- ✅ **BEM + SCSS nesting** : architecture propre avec `&__` partout
- ✅ **Code refactoring** : OnPush, `:host { display: block }`, breakpoints centralisés, prefers-reduced-motion
- ✅ **Page Home** : hero section + featured projects + Skills section + scroll anchors
- ✅ **SkeletonCard component** : loading state avec spinner et shimmer effect
- ✅ **SkillBadge component** : badges code-styled pour compétences techniques

**Prochaines étapes :**
1. **Backend upload API** — Multer + routes POST/DELETE + file-type validation + Express static serving
2. **Seeds avec vraies images** — ajouter de vraies images via l'API
3. **Contact form** — formulaire + backend endpoint
4. **Page Project Detail** — carousel d'images, description complète
5. **Mobile hamburger menu** — responsive navbar (optionnel pour v1)

**Documentation :**
- Navbar : `docs/technical/style-system/navbar-implementation.md`
- Design tokens : voir `_design-tokens.scss` pour la liste complète

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

### Gestion des images (Décembre 2025) — EN COURS

**Stratégie retenue : Stockage fichier local + chemin DB**

**Architecture prévue :**
- Images uploadées → `backend/uploads/projects/`
- DB stocke les chemins relatifs dans colonne JSON `images`
- Une image `thumbnail` principale pour les cards
- Galerie d'images pour le carousel sur page détail

**Stack technique prévu :**
- **Multer** (middleware Express pour upload multipart/form-data) — À INSTALLER
- Volume Docker `uploads-data` pour persistance — ✅ CONFIGURÉ
- Route statique Express : `/uploads` → `backend/uploads/` — À CRÉER
- Limite : 5 MB par image, formats JPEG/PNG/WebP/GIF

**Structure SQL :** ✅ IMPLÉMENTÉE
```sql
CREATE TABLE projects (
  ...
  thumbnail VARCHAR(500),        -- Image principale (cards)
  images JSON DEFAULT NULL,      -- ["uploads/projects/img1.jpg", ...]
  ...
);
```

**État actuel :**
- ✅ DB schema avec `thumbnail` + `images` JSON
- ✅ Volume Docker `uploads-data` configuré (dev + prod)
- ✅ Seeds avec placeholder images
- ✅ ProjectCard affiche le thumbnail
- ❌ Multer non installé
- ❌ Routes upload non créées
- ❌ Express static serving non configuré

**Workflow prévu :**
1. Admin drag & drop des images
2. Upload via POST `/api/upload/projects` (retourne les chemins)
3. Frontend récupère les chemins et les stocke en créant/éditant le projet
4. Cards affichent `thumbnail`
5. Page détail affiche carousel avec toutes les `images`

**Endpoints à créer :**
- `POST /api/upload/projects` — upload 1-5 images, retourne `{ paths: string[] }`
- `GET /uploads/projects/:filename` — serve images statiques
- `DELETE /api/upload/projects/:filename` — suppression sécurisée (path traversal protection)

**Sécurité à implémenter :**
- Validation MIME type (magic bytes via `file-type`)
- Noms de fichiers sanitized (UUID + extension)
- Protection path traversal sur DELETE
- Volume Docker isolé du code source

**Alternatives considérées (non retenues pour v1) :**
- Base64 en DB → gonfle la DB, mauvaises performances
- Cloud S3/Cloudinary → coût, complexité, non nécessaire pour un portfolio

---

## 📦 État actuel du projet (Décembre 2025)

### Frontend (Angular 21)
**Composants créés :**
- ✅ **Button** — variant system (primary/secondary/ghost), sizes, routing/href support, tokens corrigés
- ✅ **ProjectCard** — affichage projet avec thumbnail, description, tech badges, links, BEM strict
- ✅ **SkeletonCard** — loading state avec spinner SVG et shimmer effect
- ✅ **SkillBadge** — badges code-styled (monospace, hover effects)
- ✅ **Layout** — wrapper global avec navbar + router-outlet + footer
- ✅ **Navbar** — navigation links avec active state + theme slider iOS-style + glassmorphism au scroll
- ✅ **Footer** — copyright + social links (GitHub, LinkedIn, Email)

**Pages créées :**
- ✅ **Home** — hero section + featured projects (avec loading states) + Skills section
- ✅ **Projects** — liste tous les projets depuis l'API avec loading/error states, utilise `.container` utility
- ❌ **Project Detail** — à créer (carousel d'images)

**Services implémentés :**
- ✅ **ProjectsService** — HTTP client + signal state (projects, featuredProjects, loading, error)
- ✅ **ThemeService** — light/dark/auto avec localStorage et system preference
- ✅ **ConfigService** — runtime API URL injection (build once, deploy anywhere)

**Styling & Architecture :**
- ✅ Système OKLCH complet (tokens + themes light/dark)
- ✅ **Design tokens system** : typography, spacing, transitions, radius, shadows dans `_design-tokens.scss`
- ✅ Fonts custom (Poppins, Source Sans 3, Fira Code)
- ✅ Utilities CSS (container, card, shadows, etc.)
- ✅ **Breakpoints centralisés** dans `_variables.scss` (`$breakpoint-mobile`, `$breakpoint-tablet`)
- ✅ **BEM + SCSS nesting** : `&__` pour éviter répétition, noms complets dans HTML
- ✅ **prefers-reduced-motion** implémenté globalement + navbar
- ✅ **OnPush partout** (9 composants)
- ✅ **`:host { display: block }`** sur pages et containers

**Routing :**
- ✅ Layout parent avec children routes (lazy loading)
- ✅ `/` — Home page (hero + featured projects + skills)
- ✅ `/projects` — page opérationnelle
- ✅ `/about` — route configurée (page placeholder)

### Backend (Node.js + Express)
- ✅ CRUD projects complet (GET /api/projects, GET /api/projects/:id, GET /api/projects/featured)
- ✅ MySQL avec mysql2 (connexions pool)
- ✅ Migrations + seeds fonctionnels (avec placeholder images)
- ✅ Docker secrets support (production-ready)
- ✅ **DB schema images** : colonnes `thumbnail` + `images` JSON array
- ✅ **Volume Docker uploads** : `uploads-data` configuré pour persistance
- ❌ **Upload API** : Multer + routes POST/DELETE à implémenter — **PROCHAINE ÉTAPE**

### Infrastructure
- ✅ Docker Compose dev + prod
- ✅ MySQL 8 avec persistance
- ✅ Runtime config injection (frontend + backend)
- ✅ Proxy dev configuré

---


You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

*Dernière mise à jour : 5 Décembre 2025 — Phase 3.5 terminée (Home page ✅, Skills section ✅) — Phase 4 : DB schema images ✅, upload API backend à implémenter*
