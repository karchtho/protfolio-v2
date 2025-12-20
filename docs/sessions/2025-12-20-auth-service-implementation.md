# Session Summary - December 20, 2025

## Phase 5: Admin Authentication - Service Layer Complete!

---

## ✅ What We Accomplished Tonight

### Authentication Service Layer

1. **Created `auth.service.ts`** ✅
   - `login()` - Verifies username/password with bcrypt, returns JWT token
   - `verifyToken()` - Validates and decodes JWT tokens
   - `hashPassword()` - Helper for future user creation
   - Custom `TokenPayload` interface (avoided name collision with jsonwebtoken)

2. **Configured JWT System** ✅
   - `jwt.config.ts` - Centralized JWT configuration with SignOptions typing
   - Proper separation: `JWT_SECRET`, `accessTokenOptions`, `refreshTokenOptions`
   - Docker secrets + env var support via `getSecret()`

3. **Fixed Type Issues** 🔧
   - Resolved `string & { length: number }` collision in `secrets.config.ts`
   - Fixed JWT SignOptions typing issues
   - Cleaned up imports and types for jsonwebtoken compatibility

---

## 📂 Files Created/Modified

### New Files
- ✅ `src/services/auth.service.ts` - Authentication business logic
- ✅ `src/models/user.model.ts` - User types (User, UserSafe, LoginCredentials, AuthResponse)
- ✅ `src/repositories/users.repository.ts` - DB queries (findByUsername, findById)
- ✅ `database/migrations/004_create_users_table.sql` - Users table schema

### Modified Files
- ✅ `src/config/jwt.config.ts` - Restructured with proper SignOptions typing
- ✅ `src/config/secrets.config.ts` - Fixed return type to plain `string`

---

## 🎓 Key Concepts Learned

### 1. Service Layer Architecture
- Business logic sits between controllers (HTTP) and repositories (DB)
- Keeps controllers thin and focused on HTTP concerns
- Makes testing easier (mock repositories, test business logic in isolation)

### 2. bcrypt Password Hashing
```typescript
const hash = await bcrypt.hash('password', 10); // 10 = salt rounds
const isValid = await bcrypt.compare('password', hash);
```
- Never store plain passwords
- Salt rounds = 10 is the 2025 recommended default
- Higher rounds = more secure but slower

### 3. JWT Authentication
```typescript
const token = jwt.sign(payload, secret, options);
const decoded = jwt.verify(token, secret, options);
```
- Stateless authentication - no session storage needed
- Token contains: payload (user data) + signature + expiration
- `issuer` and `audience` prevent token reuse across domains

### 4. TypeScript Type Safety
- Avoid type name collisions (renamed `JwtPayload` → `TokenPayload`)
- Use `SignOptions` from jsonwebtoken for proper typing
- Intersection types like `string & { length: number }` can cause issues

### 5. Security Best Practices
- **Never reveal if username exists** - return `null` for both "user not found" and "wrong password"
- **Use proper salt rounds** - bcrypt default (10) balances security vs performance
- **Validate issuer/audience** - prevents JWT token reuse across different services

---

## 🚀 Next Session - What's Coming

### Immediate Next Steps

#### 1. AuthController (`src/controllers/auth.controller.ts`)
- POST `/api/auth/login` endpoint
- Request validation with Zod
- Error handling (401 Unauthorized)
- HTTP response formatting

#### 2. Auth Routes (`src/routes/auth.routes.ts`)
- Wire up the controller
- Integrate with `main.ts`
- Mount on `/api/auth` prefix

#### 3. AuthGuard Middleware (`src/middleware/auth.middleware.ts`)
- Extract JWT from `Authorization: Bearer <token>` header
- Verify token using `verifyToken()`
- Attach user info to `req.user`
- Return 401 if token invalid/missing

#### 4. End-to-End Testing
- Create test user (run migration + manual INSERT with hashed password)
- Test login with Postman/curl
- Test protected routes with AuthGuard
- Verify token expiration works

---

## 📊 Phase 5 Progress Tracker

```
Authentication System Implementation:

✅ Database Layer
  ✅ Users table migration (004_create_users_table.sql)
  ✅ UsersRepository (findByUsername, findById)

✅ Configuration Layer
  ✅ JWT configuration (jwt.config.ts)
  ✅ Secrets management (secrets.config.ts)

✅ Domain Layer
  ✅ User models (User, UserSafe, LoginCredentials, AuthResponse)
  ✅ Token payload type (TokenPayload)

✅ Service Layer
  ✅ AuthService (login, verifyToken, hashPassword)

⏳ Controller Layer (NEXT)
  ⏳ AuthController - HTTP request/response handling

⏳ Routes Layer
  ⏳ Auth routes - endpoint configuration

⏳ Middleware Layer
  ⏳ AuthGuard - protected route middleware

⏳ Testing
  ⏳ Create test user
  ⏳ Test login flow
  ⏳ Test protected routes
```

---

## 💡 Teaching Moments

### Type Name Collision
**Problem:** Imported `JwtPayload` from jsonwebtoken, then defined our own interface with the same name.

**Solution:** Renamed our interface to `TokenPayload` to avoid collision.

**Lesson:** Always check if imported libraries export types that might conflict with your custom types.

---

### Config File Architecture
**Question:** Do we really need `jwt.config.ts`?

**Trade-offs:**
- **Without it:** Simple, fewer files, direct usage
- **With it:** Centralized config, DRY principle, easier to maintain

**Decision:** Keep it because:
1. Multiple files will use JWT (service + middleware + future refresh tokens)
2. Single source of truth for issuer/audience values
3. Centralizes environment variable management
4. Abstracts Docker secrets complexity

**Rule of thumb:** If 2+ files use the same config, extract it.

---

### Security: Don't Reveal User Existence
**Bad:**
```typescript
if (!user) return { error: "User not found" };
if (!isValid) return { error: "Wrong password" };
```

**Good:**
```typescript
if (!user || !isValid) return null;
```

**Why:** Prevents username enumeration attacks. Attackers shouldn't know if a username exists in the system.

---

### JWT Configuration Typing
**Problem:** TypeScript complained about `jwt.sign()` options.

**Root cause:** Plain object literal doesn't match `SignOptions` type expectations.

**Solution:** Explicitly type config as `SignOptions`:
```typescript
export const accessTokenOptions: SignOptions = {
  expiresIn: '1h',
  issuer: 'karcherthomas.com',
  audience: 'karcherthomas.com',
};
```

---

## 🐛 Bugs Fixed

### 1. Type Collision: `JwtPayload`
- **Error:** Name collision between imported type and custom interface
- **Fix:** Renamed custom interface to `TokenPayload`

### 2. Invalid Return Type: `string & { length: number }`
- **Error:** TypeScript couldn't match intersection type with JWT library expectations
- **Fix:** Changed `getSecret()` return type to plain `string`

### 3. JWT Sign Options Type Mismatch
- **Error:** `jwt.sign()` complained about options object types
- **Fix:** Explicitly typed config object as `SignOptions`

---

## 🎯 For Next Session

### Quick Start Commands
```bash
# When you come back, say:
"Let's continue with the AuthController"
```

### What We'll Build
1. **AuthController** - HTTP handler for POST `/api/auth/login`
2. **Request Validation** - Zod schema for login credentials
3. **Error Handling** - Proper 401/400/500 responses
4. **Route Integration** - Wire controller to Express routes

### Expected Flow
```
Client Request
  ↓
POST /api/auth/login { username, password }
  ↓
AuthController.login()
  ↓ (validate with Zod)
AuthService.login()
  ↓ (verify password with bcrypt)
UsersRepository.findByUsername()
  ↓ (query MySQL)
Return { token, user } or 401 Unauthorized
```

---

## 📈 Session Stats

- **Duration:** ~1 hour
- **Tokens Used:** ~64k / 200k
- **Tokens Remaining:** ~136k ✅
- **Files Created:** 1 (auth.service.ts)
- **Files Modified:** 5
- **Bugs Squashed:** 3
- **New Concepts Learned:** 5+
- **Lines of Code Written:** ~150

---

## 📚 Code Snippets for Reference

### AuthService - Login Function
```typescript
export async function login(credentials: LoginCredentials): Promise<AuthResponse | null> {
  const user = await usersRepository.findByUsername(credentials.username);

  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

  if (!isPasswordValid) {
    return null;
  }

  const token = generateToken(user.id, user.username);

  const userSafe: UserSafe = {
    id: user.id,
    username: user.username,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  return {
    token,
    user: userSafe,
  };
}
```

### JWT Configuration
```typescript
import type { SignOptions } from 'jsonwebtoken';
import { getSecret } from './secrets.config';

export const JWT_SECRET = getSecret('jwt_secret', 'JWT_SECRET');

export const accessTokenOptions: SignOptions = {
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  issuer: 'karcherthomas.com',
  audience: 'karcherthomas.com',
};
```

---

## 🌟 Highlights

> "The hard part (bcrypt + JWT logic) is done. The rest is just wiring it up!"

The authentication **business logic** is complete. What remains is:
- **Controllers** - HTTP layer (straightforward)
- **Routes** - Endpoint configuration (boilerplate)
- **Middleware** - Token verification (simple)
- **Testing** - Verification (fun!)

You're making great progress! 🚀

---

**Next Session:** AuthController Implementation
**Estimated Time:** 30-45 minutes
**Difficulty:** Easy (just HTTP wiring)

Bonne nuit, Thomas! 🌙✨
