# Environment Setup Guide

Complete setup instructions for local development and Docker deployment.

## Prerequisites

- Node.js 22+ and npm 11.6+
- Docker 28+ with Compose plugin
- Git

## Environment Variables Structure

```
backend/
  .env            # Docker environment (committed, safe values for dev)
  .env.local      # Local npm run dev (gitignored, your personal config)
  .env.example    # Template (committed)
```

### Backend Environment Files

**`.env.example`** (template - committed):
```bash
DB_HOST=mysql
DB_PORT=3306
DB_USER=portfolio_user
DB_PASSWORD=your_secure_password_here
DB_NAME=portfolio_db
MYSQL_ROOT_PASSWORD=your_root_password_here
NODE_ENV=development
PORT=3000
```

**`.env`** (Docker Compose - committed, dev-safe values):
```bash
DB_HOST=mysql
DB_PORT=3306
DB_USER=portfolio_user
DB_PASSWORD=DevPassword123!
DB_NAME=portfolio_db
MYSQL_ROOT_PASSWORD=DevRootPassword456!
NODE_ENV=development
```

**`.env.local`** (local npm run - gitignored):
```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=portfolio_user
DB_PASSWORD=YourLocalPassword!
DB_NAME=portfolio_db
NODE_ENV=development
PORT=3000
```

## Development Modes

### Option 1: Local Development (No Docker)

Fastest for rapid iteration during development.

**1. Install dependencies:**
```bash
cd frontend && npm install
cd ../backend && npm install
```

**2. Create `backend/.env.local`** (copy from `.env.example` and fill values)

**3. Start MySQL locally** (via Docker or native):
```bash
# Option A: MySQL in Docker only
docker run -d \
  --name portfolio-mysql \
  -e MYSQL_ROOT_PASSWORD=YourRootPassword! \
  -e MYSQL_DATABASE=portfolio_db \
  -e MYSQL_USER=portfolio_user \
  -e MYSQL_PASSWORD=YourPassword! \
  -p 3306:3306 \
  mysql:8.0

# Option B: Native MySQL (if installed)
mysql -u root -p < database/migrations/001_create_projects_table.sql
```

**4. Run backend:**
```bash
cd backend
npm run dev  # Runs on http://localhost:3000
```

**5. Run frontend (new terminal):**
```bash
cd frontend
npm start  # Runs on http://localhost:4200
```

### Option 2: Full Docker Development

Best for consistency with production environment.

**1. Start all services:**
```bash
docker compose -f docker-compose.dev.yml up
```

Access:
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000
- MySQL: localhost:3306

**2. View logs:**
```bash
# All services
docker compose -f docker-compose.dev.yml logs -f

# Specific service
docker compose -f docker-compose.dev.yml logs -f backend
```

**3. Stop services:**
```bash
docker compose -f docker-compose.dev.yml down
```

**4. Clean rebuild (if needed):**
```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up
```

## Production Deployment

### Docker Secrets Setup

Production uses Docker secrets for secure credential management.

**1. Create secrets directory:**
```bash
mkdir -p secrets
```

**2. Create secret files:**
```bash
echo "portfolio_user" > secrets/db_user.txt
echo "STRONG_RANDOM_PASSWORD_32_CHARS_MIN" > secrets/db_password.txt
echo "portfolio_db" > secrets/db_name.txt
echo "STRONG_RANDOM_ROOT_PASSWORD_32_CHARS" > secrets/mysql_root_password.txt
```

**3. Secure the secrets:**
```bash
chmod 600 secrets/*.txt
echo "secrets/" >> .gitignore
```

**4. Deploy:**
```bash
docker compose -f docker-compose.prod.yml up -d
```

### How Secrets Work

**Development:** Backend reads from environment variables (`DB_USER`, `DB_PASSWORD`, etc.)

**Production:** Backend checks `/run/secrets/` first, falls back to env vars

```typescript
// backend/src/config/secrets.ts
export function getSecret(secretName: string, envVarName: string): string {
  const secretPath = `/run/secrets/${secretName}`;

  if (fs.existsSync(secretPath)) {
    return fs.readFileSync(secretPath, 'utf-8').trim();
  }

  return process.env[envVarName];
}
```

## Angular Runtime Configuration

The frontend uses runtime configuration injection for "build once, deploy anywhere" Docker images.

**How it works:**

1. `generate-config.sh` runs at container startup
2. Creates `config.js` with environment-injected values
3. `index.html` loads `config.js` before Angular bootstrap
4. `ConfigService` reads from `window.APP_CONFIG`

**Local development:** Use `frontend/public/config.js` (gitignored, create from template)

**Docker:** Environment variables (`API_URL`, `ENVIRONMENT`) are injected automatically

## Database Migrations

SQL migrations in `database/migrations/` run automatically when MySQL container initializes (only on first run).

**Manual migration:**
```bash
docker exec -i protfolio-v2-mysql-1 mysql -u root -pYourRootPassword < database/migrations/001_create_projects_table.sql
```

## Troubleshooting

### "Access denied for user 'portfolio_user'"

**Cause:** Database volume persisted with old credentials

**Fix:**
```bash
docker compose -f docker-compose.dev.yml down -v  # -v deletes volumes
docker compose -f docker-compose.dev.yml up
```

### "Port already in use"

**Find and kill process:**
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

### "Cannot connect to MySQL"

**Check MySQL is running:**
```bash
docker ps | grep mysql

# View MySQL logs
docker compose -f docker-compose.dev.yml logs mysql
```

### Frontend can't reach backend

**Development (Docker):** Use service name `backend:3000` in Angular proxy config

**Development (local):** Use `localhost:3000` in frontend/public/config.js

### Database name with underscores

**Issue:** MySQL auto-escapes underscores in `MYSQL_DATABASE` when creating users, causing permission issues.

**Solution:** Avoid underscores in database names (use `portfoliodb` instead of `portfolio_db`), or manually grant permissions via SQL script in `database/migrations/000_init_user.sql`

## Security Checklist

- [ ] `.env.local` is in .gitignore
- [ ] `secrets/` directory is in .gitignore
- [ ] Production passwords are strong (32+ chars, random)
- [ ] `backend/.env` only contains dev-safe example values
- [ ] Database root password differs from user password
- [ ] SSL disabled only for internal Docker networks (same-server)
- [ ] Never commit actual passwords to git

## Next Steps

See [CLAUDE.md](../CLAUDE.md) for:
- Project roadmap and phase status
- Code conventions and best practices
- Learning resources
