# Frontend — Linting & Dependencies

## Setup (First Time)
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npx simple-git-hooks
```

## Commands
```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix everything
npm run deps:check    # See outdated packages
npm run deps:update   # Update all dependencies
```

## Daily Workflow
```bash
npm run lint:fix      # Auto-fix before committing
git add .
git commit -m "..."   # Pre-commit hook runs automatically
npm test
```

## Config Files
- `.eslintrc.json` — ESLint rules (Angular + TypeScript + HTML)
- `.lintstagedrc.json` — Pre-commit file config
- `tsconfig.json` — Strict TypeScript settings

## Import Sorting (Auto)
```typescript
// 1. Angular
import { Component } from '@angular/core';

// 2. Third-party
import { SomeLib } from 'some-lib';

// 3. Parent imports
import { Config } from '../../config';

// 4. Local imports
import { Helper } from './helper';
```

## Rules
- ✅ Unused vars with `_` prefix allowed
- ✅ `console.warn` / `console.error` allowed (not `console.log`)
- ✅ Use `const`, not `let` or `var`
- ✅ Explicit member accessibility (`public`/`private`/`protected`)

## Troubleshooting
**Hooks not working?**
```bash
npx simple-git-hooks
```

**Skip linting:**
```bash
git commit --no-verify
```

**Dependencies update failed?**
```bash
rm package-lock.json && npm install
```

## Stack
- ESLint 9 + TypeScript ESLint + Angular ESLint
- Prettier + simple-import-sort
- simple-git-hooks + lint-staged
