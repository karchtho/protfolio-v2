# Docker Production Readiness Audit

**Date**: December 5, 2025
**Project**: Portfolio v2 (Angular 21 + Node.js + MySQL)
**Status**: Pre-production audit

---

## Executive Summary

This audit reviews all Docker configurations for production deployment readiness. Issues are categorized by severity: **CRITICAL** (blocking), **HIGH** (security/performance), **MEDIUM** (recommended improvements), and **SECURITY** (hardening).

**Current Status**: ❌ **NOT READY** for production deployment
**Blocking Issues**: 3 critical issues must be resolved first

---

## 🚨 CRITICAL — Blocking Issues

### 1. Missing `.dockerignore` Files

**Impact**: Docker builds include `node_modules/`, `.git/`, local config files → bloated images + security vulnerabilities

**Affected Files**: Missing in `/frontend/` and `/backend/`

**Risk Level**: 🔴 Critical
**Effort**: Low (5 minutes)

**Solution**:

Create `backend/.dockerignore`:
```
node_modules
npm-debug.log
.env*
!.env.example
dist
coverage
.git
.vscode
.idea
*.md
!README.md
.eslintcache
.DS_Store
```

Create `frontend/.dockerignore`:
```
node_modules
npm-debug.log
.env*
!.env.example
dist
.angular
coverage
.git
.vscode
.idea
*.md
!README.md
.eslintcache
.DS_Store
```

**Additional Action**: Remove `.dockerignore` from root `.gitignore:46` (currently prevents committing these files)

---

### 2. Missing `secrets/` Directory

**Impact**: `docker-compose.prod.yml` references `./secrets/*.txt` that don't exist → stack won't start

**Affected Files**: `docker-compose.prod.yml:63-70`

**Risk Level**: 🔴 Critical
**Effort**: Low (10 minutes)

**Solution**:

```bash
mkdir -p secrets
echo "secrets/" >> .gitignore  # Ensure it's ignored
```

Create `secrets/README.md`:
```markdown
# Production Secrets

⚠️ **DO NOT COMMIT THESE FILES**

Before deploying to production, create these files with actual credentials:

- `db_user.txt` - Database username (e.g., "portfolio_user_prod")
- `db_password.txt` - Strong database password
- `db_name.txt` - Database name (e.g., "portfolio_prod")
- `mysql_root_password.txt` - MySQL root password

## Generate Strong Passwords

```bash
echo "portfolio_user_prod" > db_user.txt
echo "portfolio_prod" > db_name.txt
echo "$(openssl rand -base64 32)" > db_password.txt
echo "$(openssl rand -base64 32)" > mysql_root_password.txt
chmod 600 secrets/*.txt
```

## Security Note

For enhanced security, migrate to:
- Docker Swarm secrets (if using Swarm)
- External secret manager (Vault, AWS Secrets Manager)
- Environment variables from secure CI/CD

---

### 3. `mysql2` in Wrong Dependencies Section

**Impact**: `npm ci --only=production` in `backend/Dockerfile.prod` won't install `mysql2` → runtime crash

**Affected Files**: `backend/package.json:39`

**Risk Level**: 🔴 Critical
**Effort**: Very low (1 minute)

**Current State**:
```json
"devDependencies": {
  "mysql2": "3.15.3",  // ❌ WRONG
  ...
}
```

**Solution**:
```json
"dependencies": {
  "dotenv": "^17.2.3",
  "express": "^5.1.0",
  "mysql2": "^3.15.3"   // ✅ Move here
}
```

---

## ⚠️ HIGH — Security & Performance Issues

### 4. No Custom Nginx Configuration

**Impact**: Missing security headers, no gzip compression, no caching strategy, no rate limiting

**Affected Files**: `frontend/Dockerfile.prod` uses default nginx config

**Risk Level**: 🟡 High
**Effort**: Medium (30 minutes)

**Solution**:

Create `frontend/nginx.conf`:
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
    gzip_min_length 1000;

    # SPA routing - Angular requires this
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets aggressively
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Never cache index.html and config.js (runtime config)
    location ~* (index\.html|config\.js)$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate";
    }
}
```

Update `frontend/Dockerfile.prod` (add after line 15):
```dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

---

### 5. Backend Dockerfile Not Optimized

**Impact**: Production image contains TypeScript compiler, ts-node, and source files unnecessarily → larger image, potential info disclosure

**Affected Files**: `backend/Dockerfile.prod`

**Risk Level**: 🟡 High
**Effort**: Medium (20 minutes)

**Current Issues**:
- No build step (copies all files including `.ts`)
- `npm ci --only=production` but never runs `npm run build`
- Uses `npm run start` instead of direct `node` invocation

**Solution**: Replace entire `backend/Dockerfile.prod`:

```dockerfile
# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Install ALL dependencies (including devDependencies for build)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production stage - minimal image
FROM node:24-alpine

WORKDIR /app

# Install ONLY production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Create uploads directory with correct permissions
RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# Run node directly (not via npm)
CMD ["node", "dist/main.js"]
```

---

### 6. No Health Checks for Frontend/Backend

**Impact**: Docker can't detect if services are actually operational (beyond process running)

**Affected Files**: `docker-compose.prod.yml`

**Risk Level**: 🟡 High
**Effort**: Medium (requires backend endpoint)

**Solution**:

Add to `docker-compose.prod.yml`:

```yaml
services:
  frontend:
    # ... existing config
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:80/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  backend:
    # ... existing config
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

**Required Backend Change**: Create health endpoint `backend/src/routes/health.ts`:

```typescript
import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
```

Register in main app:
```typescript
import healthRouter from './routes/health';
app.use('/api', healthRouter);
```

---

## 📋 MEDIUM — Recommended Improvements

### 7. No Resource Limits

**Impact**: A runaway service can consume all VPS memory/CPU, crashing other services

**Affected Files**: `docker-compose.prod.yml`

**Risk Level**: 🟠 Medium
**Effort**: Low (10 minutes)

**Solution**: Add resource limits to `docker-compose.prod.yml`:

```yaml
services:
  frontend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M

  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  mysql:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 1G
```

**Note**: Adjust based on actual VPS resources. Monitor with `docker stats` after deployment.

---

### 8. No Logging Configuration

**Impact**: Unbounded logs can fill disk, no automatic rotation

**Affected Files**: `docker-compose.prod.yml`

**Risk Level**: 🟠 Medium
**Effort**: Low (5 minutes)

**Solution**: Add logging config to `docker-compose.prod.yml`:

```yaml
# At top of file, before services:
x-logging: &default-logging
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"

services:
  frontend:
    logging: *default-logging
    # ... rest of config

  backend:
    logging: *default-logging
    # ... rest of config

  mysql:
    logging: *default-logging
    # ... rest of config
```

This limits each service to 30MB of logs (3 files × 10MB).

---

### 9. Missing Production Metadata

**Impact**: Difficult to identify image versions, maintainers, or environment in production

**Affected Files**: All `Dockerfile.prod` files

**Risk Level**: 🟠 Medium
**Effort**: Very low (2 minutes)

**Solution**: Add labels to production Dockerfiles:

```dockerfile
LABEL maintainer="Thomas <your-email>"
LABEL environment="production"
LABEL version="1.0.0"
LABEL description="Portfolio backend API"
```

---

## 🔒 SECURITY — Hardening Recommendations

### 10. Running as Root User

**Impact**: If container is compromised, attacker has root privileges inside container

**Affected Files**: `backend/Dockerfile.prod`, `frontend/Dockerfile.prod`

**Risk Level**: 🟡 Security
**Effort**: Low (included in solution #5 for backend)

**Backend**: Already included in optimized Dockerfile (#5)

**Frontend**: Nginx already runs as non-root by default in `nginx:alpine`, but verify:

```dockerfile
# Add to frontend/Dockerfile.prod if needed
USER nginx
```

---

### 11. No Network Isolation

**Impact**: Frontend can directly access MySQL (unnecessary, violates principle of least privilege)

**Affected Files**: `docker-compose.prod.yml`

**Risk Level**: 🟡 Security
**Effort**: Low (10 minutes)

**Solution**: Create isolated networks in `docker-compose.prod.yml`:

```yaml
networks:
  frontend_network:
    driver: bridge
  backend_network:
    driver: bridge

services:
  frontend:
    networks:
      - frontend_network
    # ... rest of config

  backend:
    networks:
      - frontend_network  # Can talk to frontend
      - backend_network   # Can talk to MySQL
    # ... rest of config

  mysql:
    networks:
      - backend_network   # Only accessible by backend
    # ... rest of config
```

---

### 12. Secrets File-Based (Temporary Solution)

**Impact**: File-based secrets less secure than proper secret management

**Affected Files**: `docker-compose.prod.yml:62-70`

**Risk Level**: 🟡 Security (acknowledged in TODO comment)
**Effort**: High (future enhancement)

**Current State**: Acceptable for initial VPS deployment
**Future Migration Path**:
1. Docker Swarm secrets (if using Swarm mode)
2. External secret manager (HashiCorp Vault, AWS Secrets Manager)
3. CI/CD environment injection (GitHub Actions secrets)

**Note**: Already documented in `docker-compose.prod.yml:60` with TODO comment.

---

## ✅ GOOD PRACTICES — Already Implemented

These are excellent practices already in place:

- ✅ **Multi-stage builds** for frontend (nginx production image)
- ✅ **Alpine base images** (minimal attack surface, smaller size)
- ✅ **Docker secrets configured** (file-based, ready for migration)
- ✅ **Restart policy** `unless-stopped` (auto-recovery)
- ✅ **Named volumes** for data persistence (`mysql_data`, `uploads_data`)
- ✅ **MySQL healthcheck** configured
- ✅ **Depends_on with conditions** (proper startup order)
- ✅ **Runtime config injection** (`generate-config.sh` for build-once-deploy-anywhere)
- ✅ **Separate dev/prod** compose files (no accidental dev settings in prod)
- ✅ **Environment variables** well-organized (secrets vs config)

---

## 📊 Implementation Priority

### Phase 1: MUST FIX (Before ANY Deployment)
**Estimated Time**: 30 minutes

1. ✅ Fix `mysql2` in dependencies (`backend/package.json`)
2. ✅ Create `.dockerignore` files (backend + frontend)
3. ✅ Remove `.dockerignore` from root `.gitignore`
4. ✅ Create `secrets/` directory with README
5. ✅ Create actual secret files (with strong passwords)

**Verification**:
```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml ps  # All should be "healthy" or "running"
```

---

### Phase 2: SHOULD FIX (Before Production Traffic)
**Estimated Time**: 1.5 hours

6. ✅ Optimize backend Dockerfile (multi-stage + non-root user)
7. ✅ Add custom nginx.conf with security headers
8. ✅ Add healthchecks for frontend/backend (requires `/api/health` endpoint)
9. ✅ Add resource limits
10. ✅ Add logging rotation

**Verification**:
```bash
docker-compose -f docker-compose.prod.yml exec backend wget -O- http://localhost:3000/api/health
docker-compose -f docker-compose.prod.yml exec frontend wget -O- http://localhost:80
docker stats  # Check resource usage
```

---

### Phase 3: NICE TO HAVE (Post-Launch)
**Estimated Time**: 30 minutes

11. ✅ Add network isolation
12. ✅ Add Docker labels/metadata
13. ✅ Plan secret management migration (future)

---

## 🧪 Testing Checklist

Before deploying to VPS, verify:

### Build Tests
- [ ] `docker-compose -f docker-compose.prod.yml build` succeeds
- [ ] No warnings about missing files
- [ ] Image sizes reasonable (frontend < 50MB, backend < 200MB)

### Runtime Tests
- [ ] All services start: `docker-compose -f docker-compose.prod.yml up -d`
- [ ] Health checks pass: `docker-compose -f docker-compose.prod.yml ps`
- [ ] Frontend accessible: `curl http://localhost:80`
- [ ] Backend API accessible: `curl http://localhost:3000/api/projects`
- [ ] Database migrations ran: Check MySQL logs
- [ ] Secrets loaded correctly: Check backend logs (no errors about DB connection)

### Security Tests
- [ ] No `.env` files in images: `docker-compose -f docker-compose.prod.yml exec backend ls -la`
- [ ] Services running as non-root: `docker-compose -f docker-compose.prod.yml exec backend whoami`
- [ ] Security headers present: `curl -I http://localhost:80`

### Cleanup Test
- [ ] Volumes persist after restart: `docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up -d`
- [ ] Data still present in database

---

## 📚 Additional Resources

- [Docker security best practices](https://docs.docker.com/develop/security-best-practices/)
- [Nginx security headers](https://securityheaders.com/)
- [Node.js production best practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [MySQL Docker official documentation](https://hub.docker.com/_/mysql)

---

## 🔄 Review Schedule

This audit should be reviewed:
- ✅ Before initial deployment
- 🔄 After 1 month of production use (performance tuning)
- 🔄 Every 6 months (dependency updates, security patches)
- 🔄 After any major infrastructure changes

---

**Last Updated**: December 5, 2025
**Next Review**: January 5, 2026
