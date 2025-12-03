# Secrets Management for Node.js, Angular, and Docker Applications

Protecting credentials in modern full-stack applications requires a layered approach: **never expose secrets in frontend code**, use Docker secrets or dedicated secret managers for production, and maintain strict separation between development and production configurations. The most critical insight for your stack is that Angular can never securely hold secrets—all sensitive API keys must live in your Node.js backend, which acts as a secure proxy for external services.

This guide provides practical implementation patterns for your Node.js/Express + Angular + Docker architecture, covering everything from local development workflows to production-grade secret management with 2024-2025 best practices.

---

## The fundamental rule: backend owns all secrets

Everything in your Angular application is visible to users. Compiled JavaScript bundles are downloaded to browsers where anyone can view source code, inspect network requests, and examine variables using DevTools. This means **frontend code can never contain true secrets**—only public keys designed for client-side exposure (like Stripe publishable keys or Google Maps API keys with domain restrictions).

Your Node.js backend must serve as the secure boundary. All private API keys, database credentials, OAuth client secrets, and encryption keys belong exclusively on the server. When your Angular frontend needs data from a third-party service requiring authentication, it should call your Express backend, which then adds the secret credentials and proxies the request.

```typescript
// backend/src/routes/api-proxy.ts - Backend adds secrets, frontend never sees them
router.post('/weather', async (req, res) => {
  const response = await axios.get('https://api.weather.com/v1/current', {
    params: { city: req.body.city },
    headers: { 'Authorization': `Bearer ${process.env.WEATHER_API_KEY}` }
  });
  res.json({ temperature: response.data.temp });
});
```

---

## Node.js backend secrets: dotenv and beyond

The **12-factor app methodology** mandates strict separation of configuration from code. Environment variables remain the standard approach—they're language-agnostic, easy to change between deploys, and unlikely to be accidentally committed to version control.

For local development, the `dotenv` package (with over **45 million weekly downloads**) remains the standard choice. Node.js v20.6.0+ also includes native `.env` support via the `--env-file` flag. Structure your environment files carefully:

```bash
# .env (NEVER commit this file)
DATABASE_URL=postgres://localhost:5432/myapp
JWT_SECRET=minimum-32-character-secret-key-here
STRIPE_SECRET_KEY=sk_test_xxx
```

Always create a `.env.example` file (committed to version control) that documents required variables without values. For additional safety, use `dotenv-safe` to validate that all required environment variables are set at startup:

```javascript
// Validates required env vars exist before app starts
require('dotenv-safe').config({
  example: '.env.example',
  allowEmptyValues: false
});
```

**Critical anti-pattern to avoid**: Never hardcode secrets directly in source code, and never use `console.log` with request or response objects that might contain authentication headers. Implement log sanitization to automatically redact sensitive patterns from any output.

---

## Docker secrets versus environment variables

Standard environment variables passed via `docker run -e` or defined in Dockerfiles are **visible in plaintext** through `docker inspect` and persisted in image history. This creates significant security exposure in production environments.

Docker provides two secure alternatives depending on your orchestration setup:

**Build-time secrets with BuildKit** handle credentials needed during image building (like private npm registry tokens) without persisting them in the final image:

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN --mount=type=secret,id=npm_token \
    NPM_TOKEN=$(cat /run/secrets/npm_token) npm ci --only=production
COPY . .
```

**Runtime secrets with Docker Compose or Swarm** inject credentials when containers start. Secrets are mounted as files at `/run/secrets/` inside the container:

```yaml
# docker-compose.prod.yml
services:
  backend:
    image: myapp/backend:latest
    secrets:
      - db_password
      - jwt_secret
    environment:
      - DB_PASSWORD_FILE=/run/secrets/db_password

secrets:
  db_password:
    external: true  # Created via: docker secret create db_password ./secret.txt
```

Your Node.js application should read these mounted secret files:

```javascript
// utils/secrets.js - Reads Docker secrets with env var fallback
const fs = require('fs');

function getSecret(name, envVar) {
  const secretPath = `/run/secrets/${name}`;
  if (fs.existsSync(secretPath)) {
    return fs.readFileSync(secretPath, 'utf-8').trim();
  }
  return process.env[envVar];  // Fallback for local development
}

module.exports = {
  dbPassword: () => getSecret('db_password', 'DATABASE_PASSWORD'),
  jwtSecret: () => getSecret('jwt_secret', 'JWT_SECRET')
};
```

---

## Development versus production secret management

Development and production environments require fundamentally different approaches to secret management:

| Environment | Secret Storage | Frontend Config | Complexity |
|-------------|---------------|-----------------|------------|
| Local dev (no Docker) | `.env` files with dotenv | `environment.ts` | Low |
| Local dev (Docker Compose) | `.env` + `env_file` directive | Runtime injection | Medium |
| Production (single server) | Docker secrets (file-based) | Environment → config.js | Medium |
| Production (Swarm/K8s) | Encrypted secrets | ConfigMap/runtime injection | High |
| Cloud PaaS | Platform environment variables | Build-time or runtime | Varies |

For **local development**, simplicity wins. A `.env` file loaded by dotenv provides fast iteration without infrastructure overhead. Your Angular app can use `environment.ts` files since you're not sharing images across environments.

For **production**, never rely on `.env` files or plain environment variables. Use Docker secrets (encrypted at rest in Swarm mode), Kubernetes secrets with proper RBAC, or a dedicated secrets manager. The key principle: **build once, deploy anywhere**. Your Docker image should be identical across staging and production—only the injected secrets differ.

---

## Angular frontend configuration that actually works

Angular's `environment.ts` files are **build-time configuration**, meaning values are bundled into the JavaScript during compilation. This works for flags like `production: true` but fails for environment-specific values like API URLs when deploying the same Docker image to multiple environments.

**The solution is runtime configuration injection.** Create a `config.js` file that's generated when the container starts:

```bash
#!/bin/sh
# generate-config.sh - Runs at container startup
cat <<EOF > /usr/share/nginx/html/config.js
(function(window) {
  window.APP_CONFIG = {
    apiUrl: "${API_URL:-http://localhost:3000}",
    stripePublishableKey: "${STRIPE_PUBLISHABLE_KEY:-}"
  };
})(window);
EOF
```

Your Angular application reads this configuration through a service:

```typescript
// config.service.ts
@Injectable({ providedIn: 'root' })
export class ConfigService {
  get apiUrl(): string {
    return (window as any).APP_CONFIG?.apiUrl || 'http://localhost:3000';
  }
}
```

For API keys that **must** be in the frontend (Google Maps, Stripe publishable keys, reCAPTCHA), always configure domain restrictions and usage quotas in the provider's dashboard. These are designed for client-side use but should still be protected against abuse.

---

## Secret management tools: choosing the right solution

The landscape of secret management tools has matured significantly. Your choice depends on team size, infrastructure complexity, and existing cloud commitments:

**For small teams (1-10 developers)**, **Infisical** offers an excellent open-source option with a generous free tier, easy Docker deployment, and native Node.js SDK. **Doppler** provides a more polished SaaS experience with 40+ integrations if you prefer managed services.

**For AWS-centric teams**, **AWS Secrets Manager** at **$0.40 per secret per month** provides native IAM integration, automatic rotation with Lambda, and multi-region replication. The AWS SDK makes integration straightforward.

**For enterprise or complex infrastructure**, **HashiCorp Vault** remains the industry standard with **75+ integrations**, dynamic secrets, automatic rotation, and comprehensive audit logging. The learning curve is steep, but capabilities are unmatched. Note that Vault moved to the Business Source License (BSL) in 2023, which may affect some use cases.

**For GitOps workflows**, **Mozilla SOPS** encrypts YAML/JSON files that can be safely committed to Git, decrypted at deployment time using AWS KMS, GCP KMS, or age/PGP keys. This works exceptionally well with Kubernetes and FluxCD.

```javascript
// Infisical SDK integration example
const { InfisicalSDK } = require("@infisical/sdk");

const client = new InfisicalSDK({ siteUrl: "https://app.infisical.com" });
await client.auth().universalAuth.login({
  clientId: process.env.INFISICAL_CLIENT_ID,
  clientSecret: process.env.INFISICAL_CLIENT_SECRET
});

const secret = await client.secrets().getSecret({
  environment: "prod",
  projectId: "your-project-id",
  secretName: "DATABASE_URL"
});
```

---

## Preventing secrets from reaching version control

Defense in depth requires multiple layers preventing secrets from being committed:

**First layer: `.gitignore`** must comprehensively exclude all secret files:

```gitignore
.env
.env.*
!.env.example
secrets/
*.key
*.pem
docker-compose.override.yml
```

**Second layer: Pre-commit hooks** using tools like **Gitleaks** or **detect-secrets** scan staged changes before allowing commits. Install via the pre-commit framework:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks
```

**Third layer: CI/CD scanning** catches anything that slips through. GitHub's native secret scanning (free for public repositories, available in Enterprise for private) automatically detects patterns for hundreds of secret types. Add **TruffleHog** or Gitleaks to your pipeline for additional coverage.

If a secret is accidentally committed, **rotate it immediately**—consider it compromised regardless of whether the commit was pushed. Use `git-filter-repo` or BFG Repo-Cleaner to remove it from history, force-push, and notify your team to re-clone.

---

## CI/CD pipelines and secure secret injection

Modern CI/CD platforms provide secure secret storage, but implementation details matter significantly:

**GitHub Actions** offers repository secrets and environment secrets. Always prefer **environment secrets** for production deployments—they can require manual approval and limit which branches access them. For cloud deployments, use **OIDC federation** instead of long-lived credentials:

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    environment: production  # Requires approval
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789:role/github-actions
          aws-region: us-east-1  # No stored credentials needed
```

**Critical practices for all CI/CD platforms:**
- Never echo secrets or use them in command arguments visible in logs
- Use masked variables where available (GitLab, Azure DevOps)
- Pin action versions to commit SHAs to prevent supply chain attacks
- Rotate CI/CD secrets on **30-day cycles** for critical credentials
- Pass secrets to Docker builds using BuildKit `--secret`, never as build args

```bash
# Correct: BuildKit secret (not stored in image)
docker build --secret id=npm_token,src=.npmrc -t myapp .

# WRONG: Build arg (visible in docker history)
docker build --build-arg NPM_TOKEN=$NPM_TOKEN -t myapp .
```

---

## Complete deployment configuration example

Here's a production-ready Docker Compose setup demonstrating these principles for your Node.js/Angular stack:

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    image: myregistry/frontend:${TAG:-latest}
    ports:
      - "80:80"
    environment:
      - API_URL=https://api.myapp.com
      - STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}
    depends_on:
      - backend

  backend:
    image: myregistry/backend:${TAG:-latest}
    expose:
      - "3000"
    secrets:
      - db_password
      - jwt_secret
      - stripe_secret
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PASSWORD_FILE=/run/secrets/db_password
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
      - STRIPE_SECRET_KEY_FILE=/run/secrets/stripe_secret
    deploy:
      replicas: 3

  postgres:
    image: postgres:15-alpine
    secrets:
      - db_password
    environment:
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
  stripe_secret:
    external: true

volumes:
  postgres_data:
```

---

## Conclusion

Effective secrets management for Node.js/Angular/Docker applications centers on three core principles: **the backend is the trust boundary** (all private credentials live server-side), **runtime injection beats build-time configuration** (enabling secure, reusable Docker images), and **defense in depth** (combining `.gitignore`, pre-commit hooks, CI scanning, and secret managers).

For your specific stack, start with dotenv for local development, implement Docker secrets for production, and add a dedicated secret manager (Infisical for simplicity, Vault for enterprise needs) as your infrastructure matures. Configure pre-commit hooks with Gitleaks immediately—this single step prevents the majority of accidental secret exposure. The Angular frontend should use runtime configuration injection via a generated `config.js` file, allowing the same Docker image to deploy across all environments with only the injected values changing.

The investment in proper secrets management pays dividends in reduced security incidents, simplified compliance, and the confidence that comes from knowing your credentials are genuinely protected.
