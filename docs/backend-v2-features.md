# Backend v2 Features - Deferred Improvements

This document tracks backend features that were **intentionally deferred** from v1 to keep the initial release focused and ship faster. These are **nice-to-have** improvements for future versions.

**Last Updated:** December 21, 2025

---

## 🎯 Why Defer These Features?

**v1 Philosophy:** Ship a working admin panel quickly
- Focus on core functionality (CRUD + Auth + Upload)
- Keep it simple for single-user portfolio
- Add complexity only when needed

**v2 Philosophy:** Add features based on real usage
- Implement when pain points emerge
- Add based on actual needs, not hypothetical ones
- Production experience drives prioritization

---

## 🛡️ Error Handling

### Centralized Error Handler Middleware
**Status:** Not implemented in v1
**Priority:** Low → Medium (increase if seeing inconsistent errors)
**Effort:** ~20 minutes
**Deferred because:** Controllers already have try/catch, Zod handles validation, authGuard handles auth errors

**What it would add:**
- Consistent error response format across all endpoints
- Security: Hide stack traces in production
- Centralized logging point for future Winston/Sentry integration
- Safety net for unexpected errors

**Implementation (when ready):**
```typescript
// backend/src/middleware/error.middleware.ts
export class AppError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
  }
}

export function errorHandler(error: Error, req, res, next) {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : error.message;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
}
```

**When to add:**
- Seeing inconsistent error formats from different endpoints
- Adding external API integrations that might fail unpredictably
- Adding centralized logging (Winston, Sentry, Datadog)
- Opening API to public/multiple users

---

## 🔐 Authentication Enhancements

### Refresh Token System
**Status:** Not implemented in v1
**Priority:** Medium
**Effort:** ~60 minutes
**Deferred because:** 1-hour access token sessions are sufficient for single admin user

**Current limitation:**
- Access tokens expire after 1 hour
- Admin must re-login every hour

**What refresh tokens would add:**
- Access tokens: short-lived (15 min)
- Refresh tokens: long-lived (7 days)
- Admin stays logged in for 7 days without re-entering password
- Better security (stolen access token only valid 15 min)

**Implementation tasks:**
1. Create `refresh_tokens` table (id, user_id, token, expires_at, created_at)
2. Modify `POST /api/auth/login` to return both tokens
3. Create `POST /api/auth/refresh` endpoint
4. Create `POST /api/auth/logout` endpoint (invalidate refresh token)
5. Add token rotation (issue new refresh token on each refresh)

**Database schema:**
```sql
CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token (token),
  INDEX idx_expires_at (expires_at)
);
```

**When to add:**
- Finding 1-hour sessions too short (annoying re-logins)
- Adding mobile app (long sessions expected)
- Multiple admin users (better security model needed)

---

### Auth Utility Endpoints
**Status:** Not implemented in v1
**Priority:** Low
**Effort:** ~40 minutes total
**Deferred because:** Frontend can decode JWT locally, password changes rare

#### GET /api/auth/me
**Purpose:** Get current user info from token
**Use case:** Verify token is still valid, get latest user data

```typescript
// Simple implementation (authGuard already attaches req.user)
router.get('/me', authGuard, (req, res) => {
  res.json({ user: req.user });
});
```

**When to add:**
- Need to verify token validity without decoding on frontend
- User data changes frequently (roles, permissions)
- Building user profile page that shows current user

#### PATCH /api/auth/password
**Purpose:** Let admin change password
**Use case:** Security best practice (periodic password rotation)

```typescript
// Validates old password, hashes new password, updates DB
router.patch(
  '/password',
  authGuard,
  validateRequest(changePasswordSchema),
  authController.changePassword
);
```

**When to add:**
- Security policy requires password changes
- Multiple admin users (each manages own password)
- Suspected password compromise

---

## 🧪 Testing

### Unit & Integration Tests
**Status:** Not implemented in v1
**Priority:** Low → High (increase after first production bugs)
**Effort:** ~3-4 hours for comprehensive coverage
**Deferred because:** Manual testing sufficient for v1, tests take time

**What's needed:**

#### Repository Tests (~60 min)
- Mock mysql2 connection pool
- Test SQL query logic
- Test error handling (connection failures, constraint violations)

#### Service Tests (~60 min)
- Mock repositories
- Test business logic (password hashing, JWT generation)
- Test edge cases (null values, invalid data)

#### Controller Tests (~60 min)
- Mock services
- Test HTTP request/response handling
- Test status codes and error responses

#### Integration Tests (~60 min)
- Full request → response cycle
- Test auth flow (login → protected route)
- Test CRUD operations end-to-end

**Tools:**
- Vitest (already configured for frontend)
- Supertest (HTTP testing)
- Mock databases or test containers

**Coverage goals:**
- Repositories: 80%+
- Services: 80%+
- Controllers: 70%+

**When to add:**
- After first production bugs (regression prevention)
- Before adding complex features (refactoring confidence)
- When onboarding other developers (documentation via tests)

---

## 📊 Admin Features

### Audit Logging
**Status:** Not implemented in v1
**Priority:** Low
**Effort:** ~90 minutes
**Deferred because:** Single admin user, small dataset

**Purpose:** Track who created/updated/deleted projects

**Implementation:**
1. Add `created_by`, `updated_by` columns to projects table
2. Use `req.user.userId` from authGuard in controllers
3. Create `audit_log` table for detailed action tracking

**Database schema:**
```sql
-- Simple approach: Add to projects table
ALTER TABLE projects
  ADD COLUMN created_by INT,
  ADD COLUMN updated_by INT,
  ADD FOREIGN KEY (created_by) REFERENCES users(id),
  ADD FOREIGN KEY (updated_by) REFERENCES users(id);

-- Advanced approach: Separate audit log
CREATE TABLE audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action ENUM('create', 'update', 'delete') NOT NULL,
  entity_type VARCHAR(50) NOT NULL,  -- 'project', 'user', etc.
  entity_id INT NOT NULL,
  changes JSON,  -- Before/after values
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**When to add:**
- Multiple admin users (accountability needed)
- Compliance requirements (audit trail)
- Debugging production issues (what changed when?)

---

## 🔍 Advanced Filtering & Search

### Enhanced Project Endpoints
**Status:** Basic filtering exists
**Priority:** Low
**Effort:** ~60 minutes
**Deferred because:** Current GET /api/projects sufficient for small portfolio

**Current:** `GET /api/projects` (returns all)
**Enhancement:** Add query parameters

```typescript
GET /api/projects?search=keyword        // Search title/description
GET /api/projects?tech=Node.js,React    // Filter by technologies
GET /api/projects?status=active         // Filter by status
GET /api/projects?featured=true         // Filter featured
GET /api/projects?sort=created_at&order=desc  // Sorting
GET /api/projects?limit=10&offset=0     // Pagination
```

**Implementation:**
- Update ProjectsRepository with dynamic SQL queries
- Add query parameter validation with Zod
- Test SQL injection protection

**When to add:**
- Portfolio has 20+ projects (need filtering/search)
- Building public API (users need query flexibility)
- Admin panel needs advanced filtering UI

---

## 📝 Rate Limiting

**Status:** Not implemented in v1
**Priority:** Low → High when exposing to public
**Effort:** ~30 minutes
**Deferred because:** Private admin panel, no public API yet

**Purpose:** Prevent API abuse (brute force, DDoS)

**Implementation:**
```typescript
import rateLimit from 'express-rate-limit';

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests, please try again later',
});

// Strict limit for login (prevent brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later',
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', loginLimiter);
```

**When to add:**
- Opening API to public
- Seeing suspicious traffic patterns
- Production deployment (basic security hygiene)

---

## 🔒 Security Enhancements

### CORS Configuration
**Status:** Not configured in v1
**Priority:** Medium for production
**Effort:** ~15 minutes
**Deferred because:** Development environment, same-origin requests

**Current:** All origins allowed (Express default)
**Improvement:** Whitelist specific origins

```typescript
import cors from 'cors';

const allowedOrigins = [
  'https://karcherthomas.com',
  'http://localhost:4200',  // Dev frontend
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // Allow cookies
}));
```

**When to add:**
- Deploying to production
- Seeing CORS errors from unauthorized origins
- Before opening API to public

### Helmet.js - Security Headers
**Status:** Not implemented
**Priority:** Medium for production
**Effort:** ~10 minutes
**Deferred because:** Development environment

**Purpose:** Set security HTTP headers (prevent XSS, clickjacking, etc.)

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

**When to add:**
- Production deployment (security best practice)
- Security audit findings
- Compliance requirements

---

## 🗄️ Database Optimizations

### Indexes for Performance
**Status:** Basic indexes exist (primary keys)
**Priority:** Low → Medium (when dataset grows)
**Effort:** ~30 minutes
**Deferred because:** Small dataset, queries already fast

**Recommended indexes when dataset grows:**

```sql
-- Projects table
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_featured ON projects(is_featured);
CREATE INDEX idx_projects_created_at ON projects(created_at);

-- Full-text search (when adding search)
ALTER TABLE projects ADD FULLTEXT INDEX idx_projects_search (title, description);

-- Users table
CREATE INDEX idx_users_username ON users(username);  -- For login lookups
```

**When to add:**
- Queries taking >100ms
- Portfolio has 100+ projects
- Adding search functionality

### Connection Pool Tuning
**Status:** Using defaults
**Priority:** Low
**Effort:** ~20 minutes
**Deferred because:** Low traffic, defaults work fine

**Current:** mysql2 default pool settings
**Optimization:** Tune based on traffic patterns

```typescript
const pool = mysql.createPool({
  // ... existing config ...
  connectionLimit: 10,     // Max connections
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});
```

**When to add:**
- Seeing connection errors under load
- High traffic patterns emerge
- Running load tests

---

## 📈 Monitoring & Logging

### Structured Logging (Winston)
**Status:** Using console.log
**Priority:** Medium for production
**Effort:** ~45 minutes
**Deferred because:** Development environment, simple logging sufficient

**Purpose:** Production-grade logging with levels, rotation, structured data

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

**When to add:**
- Production deployment
- Need log aggregation (ELK, Datadog, CloudWatch)
- Debugging production issues

### Health Check Improvements
**Status:** Basic health check exists
**Priority:** Low
**Effort:** ~30 minutes
**Deferred because:** Simple health check sufficient

**Current:** `GET /health` returns 200
**Enhancement:** Detailed health metrics

```typescript
GET /health/live   // Liveness probe (is app running?)
GET /health/ready  // Readiness probe (is app ready for traffic?)
GET /health/metrics // Detailed metrics (DB connections, memory, uptime)
```

**When to add:**
- Kubernetes deployment (uses readiness/liveness probes)
- Need detailed monitoring
- Load balancer health checks

---

## 🚀 Performance Optimizations

### Response Compression
**Status:** Not implemented
**Priority:** Low
**Effort:** ~10 minutes
**Deferred because:** Small response payloads

```typescript
import compression from 'compression';
app.use(compression());
```

**When to add:**
- Large response payloads (>1KB)
- High bandwidth costs
- Slow client connections

### Caching Strategy
**Status:** No caching
**Priority:** Low
**Effort:** ~60 minutes
**Deferred because:** Dynamic content, low traffic

**Options:**
- HTTP caching headers (Cache-Control, ETag)
- Redis for frequently accessed data
- CDN for static assets

**When to add:**
- Seeing repeated identical queries
- High traffic patterns
- Slow database queries

---

## 📦 Dependencies & Maintenance

### Dependency Updates
**Status:** Using current versions
**Priority:** Ongoing
**Effort:** ~30 min/month

**When to add:**
- Security vulnerabilities announced
- Major version releases of key libraries
- Quarterly maintenance schedule

### API Versioning
**Status:** No versioning
**Priority:** Low
**Effort:** ~45 minutes
**Deferred because:** Private API, no external consumers

```typescript
// v1 routes
app.use('/api/v1/projects', projectsRouterV1);

// v2 routes (breaking changes)
app.use('/api/v2/projects', projectsRouterV2);
```

**When to add:**
- Opening API to external consumers
- Need to make breaking changes
- Multiple client versions to support

---

## 📅 Version History

- **v1.0** (December 2025) - Initial release
  - ✅ CRUD Projects
  - ✅ JWT Authentication
  - ✅ File Upload (Multer)
  - ✅ Zod Validation
  - ✅ AuthGuard Middleware
  - ✅ Docker Production Deployment

- **v2.0** (Planned - Q1 2026)
  - Refresh Token System
  - Centralized Error Handling
  - Rate Limiting
  - CORS + Helmet Security
  - Unit Tests

- **v3.0** (Planned - Future)
  - Advanced Search & Filtering
  - Audit Logging
  - Performance Monitoring
  - Redis Caching

---

## 🎯 Prioritization Framework

**When evaluating v2 features, ask:**

1. **Is it solving a real problem?** (Not hypothetical)
2. **What's the impact if we don't add it?** (Security > UX > Performance > Nice-to-have)
3. **What's the maintenance burden?** (More code = more bugs)
4. **Can we add it incrementally?** (Small iterations > big rewrites)

**Red flags (don't add yet):**
- "We might need this someday"
- "Everyone else has this feature"
- "It's only X lines of code"

**Green lights (add it now):**
- "We're seeing errors because of this"
- "Users are complaining about this"
- "This is blocking the next feature"

---

**Remember:** The best code is no code. Add features when pain > effort, not before.

---

**Maintained by:** Thomas
**Questions?** Review this doc before adding new features
