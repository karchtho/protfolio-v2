# Frontend Review & Mobile Navigation Strategy
**Professional Web Design Review for Angular 21 Portfolio**
**Date:** December 6, 2025
**Reviewer:** Professional Web Designer
**Focus:** Mobile Responsiveness, Navigation UX, Code Quality, Design System Consistency

---

## 📋 Executive Summary

**Overall Assessment: ⭐⭐⭐⭐½ (4.5/5)**

Your Angular 21 portfolio demonstrates **excellent modern practices** with a sophisticated design system, proper use of signals, and a well-architected component structure. The OKLCH color system and design tokens are cutting-edge. However, **mobile navigation needs significant work** — the current navbar is functional but not optimized for small screens, and there's no hamburger menu pattern implemented.

### Key Strengths ✅
- Modern Angular 21 patterns (signals, standalone, OnPush)
- Sophisticated OKLCH-based theming system
- Excellent design token architecture
- Proper BEM + SCSS nesting
- Strong accessibility foundations (prefers-reduced-motion, focus states)
- Mobile-first breakpoint strategy

### Critical Gaps 🚨
- **No hamburger menu** for mobile navigation
- Navbar too cramped on small screens (< 768px)
- Inconsistent use of design tokens (hardcoded values in some places)
- Missing touch target optimizations
- No navigation drawer/overlay for mobile

---

## ✅ What's Working Well

### 1. **Architecture & Modern Patterns**
```typescript
// ✅ EXCELLENT: Proper Angular 21 patterns everywhere
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,  // Performance-first
  host: { class: 'home-page' },                     // No @HostBinding
})
export class Home {
  readonly projectsService = inject(ProjectsService); // inject() instead of constructor
}
```

**Why it's good:**
- OnPush strategy on ALL components (9/9 ✅)
- Signals for reactive state (`computed`, `signal`)
- Proper `inject()` usage (no constructor DI)
- Standalone components (no NgModules)

### 2. **Design System Excellence**
```scss
// ✅ EXCELLENT: OKLCH color system with relative colors
--primary-hover: oklch(from var(--primary) calc(l - 0.05) c h);
--primary-alpha-10: oklch(from var(--primary) l c h / 0.1);
```

**Why it's cutting-edge:**
- OKLCH provides perceptual uniformity (better than HSL/RGB)
- Relative colors automatically adapt to theme changes
- Consistent alpha variations for overlays
- Proper semantic color naming

### 3. **Accessibility Foundations**
```scss
// ✅ EXCELLENT: Respects user motion preferences
@media (prefers-reduced-motion: reduce) {
  animation-duration: 0.01ms !important;
  transition-duration: 0.01ms !important;
}
```

**Why it matters:**
- Reduces motion for vestibular disorder users
- Focus-visible states on interactive elements
- Proper ARIA labels (theme toggle)
- Semantic HTML structure

### 4. **BEM + SCSS Nesting Done Right**
```scss
// ✅ EXCELLENT: BEM with nesting for maintainability
.navbar {
  &__brand { }         // .navbar__brand
  &__links { }         // .navbar__links
  &__theme-switcher { } // .navbar__theme-switcher
}
```

**Why it's maintainable:**
- Full BEM class names in HTML (searchable)
- Nesting reduces repetition in SCSS
- Clear component boundaries
- No deep nesting (max 2-3 levels)

---

## 🚨 Mobile Navigation: Critical Issues

### Current Problems (< 768px)

#### **Problem 1: Navbar Too Cramped**
```scss
// ❌ CURRENT: Everything crammed into one row on mobile
grid-template-columns: 1fr auto 1fr; // Logo | Links | Theme

@media (max-width: 768px) {
  padding: 1rem;
  gap: 1rem;
  // Links still visible but text is tiny (14px)
}
```

**Issues:**
- Logo (24px) + 3 nav links (14px each) + theme switcher = **~420px minimum width**
- iPhone SE (375px) / Galaxy Fold (280px) = **text wrapping, cramped UI**
- Touch targets too small (< 44px recommended by Apple/Google)
- Poor UX on phones in portrait mode

#### **Problem 2: No Hamburger Menu**
```html
<!-- ❌ CURRENT: Links always visible -->
<ul class="navbar__links">
  @for (item of navItems; track item.path) {
    <li><a [routerLink]="item.path">{{ item.label }}</a></li>
  }
</ul>
```

**Missing:**
- Hamburger icon button
- Mobile navigation drawer/overlay
- Slide-in animation
- Focus trap for accessibility
- Body scroll lock when menu open

#### **Problem 3: Theme Switcher Too Complex**
```html
<!-- ❌ CURRENT: Sun icon + "Light" label + slider + "Dark" label + moon icon -->
<!-- Takes up ~180px on mobile = 48% of iPhone SE width! -->
```

**Issues:**
- Text labels ("Light" / "Dark") add unnecessary width
- Two icons + labels + slider = visual clutter
- Could be simplified to just icon button on mobile

---

## 🎯 Mobile Navigation Plan: Modern Best Practices

### Strategy Overview

**Breakpoint-based approach:**
- **Desktop (≥ 1024px):** Current horizontal navbar ✅
- **Tablet (768px - 1023px):** Simplified navbar (remove text labels from theme)
- **Mobile (< 768px):** **Hamburger menu** with slide-in drawer

### Implementation Plan

#### **Phase 1: Hamburger Menu Component** (Priority: 🔥 HIGH)

**File:** `frontend/src/app/components/navbar/navbar.ts`

```typescript
// NEW: Add mobile menu state
export class Navbar {
  private themeService = inject(ThemeService);

  // NEW: Mobile menu signal
  isMobileMenuOpen = signal(false);
  isDark = computed(() => this.themeService.isDarkMode());

  navItems = [
    {label: 'Home', path: '/'},
    {label: 'Projects', path: '/projects'},
    {label: 'About', path: '/about'}
  ]

  onThemeToggle(): void {
    this.themeService.toggleTheme();
  }

  // NEW: Toggle mobile menu
  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);

    // Lock body scroll when menu is open
    if (this.isMobileMenuOpen()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  // NEW: Close menu when link is clicked
  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
    document.body.style.overflow = '';
  }
}
```

**Why signals?**
- Reactive state updates (no zone.js needed)
- Automatic change detection with OnPush
- Computed values for derived state

#### **Phase 2: Hamburger HTML Template** (Priority: 🔥 HIGH)

**File:** `frontend/src/app/components/navbar/navbar.html`

```html
<nav class="navbar">
  <!-- Logo (always visible) -->
  <div class="navbar__brand">
    <a routerLink="/" class="navbar__logo">< Thomas Karcher /></a>
  </div>

  <!-- Desktop Navigation (≥ 768px) -->
  <ul class="navbar__links navbar__links--desktop">
    @for (item of navItems; track item.path) {
    <li>
      <a
        [routerLink]="item.path"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: item.path === '/' }"
      >
        {{ item.label }}
      </a>
    </li>
    }
  </ul>

  <!-- Mobile Actions (< 768px) -->
  <div class="navbar__mobile-actions">
    <!-- Theme Toggle (mobile-friendly: icon only) -->
    <button
      type="button"
      class="navbar__theme-toggle-mobile"
      (click)="onThemeToggle()"
      [attr.aria-label]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      @if (isDark()) {
        <!-- Moon Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor">
          <path d="M320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576C388.8 576 451.3 548.8 497.3 504.6C504.6 497.6 506.7 486.7 502.6 477.5C498.5 468.3 488.9 462.6 478.8 463.4C473.9 463.8 469 464 464 464C362.4 464 280 381.6 280 280C280 207.9 321.5 145.4 382.1 115.2C391.2 110.7 396.4 100.9 395.2 90.8C394 80.7 386.6 72.5 376.7 70.3C358.4 66.2 339.4 64 320 64z"/>
        </svg>
      } @else {
        <!-- Sun Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor">
          <path d="M210.2 53.9C217.6 50.8 226 51.7 232.7 56.1L320.5 114.3L408.3 56.1C415 51.7 423.4 50.9 430.8 53.9C438.2 56.9 443.4 63.5 445 71.3L465.9 174.5L569.1 195.4C576.9 197 583.5 202.4 586.5 209.7C589.5 217 588.7 225.5 584.3 232.2L526.1 320L584.3 407.8C588.7 414.5 589.5 422.9 586.5 430.3C583.5 437.7 576.9 443.1 569.1 444.6L465.8 465.4L445 568.7C443.4 576.5 438 583.1 430.7 586.1C423.4 589.1 414.9 588.3 408.2 583.9L320.4 525.7L232.6 583.9C225.9 588.3 217.5 589.1 210.1 586.1C202.7 583.1 197.3 576.5 195.8 568.7L175 465.4L71.7 444.5C63.9 442.9 57.3 437.5 54.3 430.2C51.3 422.9 52.1 414.4 56.5 407.7L114.7 320L56.5 232.2C52.1 225.5 51.3 217.1 54.3 209.7C57.3 202.3 63.9 196.9 71.7 195.4L175 174.6L195.9 71.3C197.5 63.5 202.9 56.9 210.2 53.9zM239.6 320C239.6 275.6 275.6 239.6 320 239.6C364.4 239.6 400.4 275.6 400.4 320C400.4 364.4 364.4 400.4 320 400.4C275.6 400.4 239.6 364.4 239.6 320zM448.4 320C448.4 249.1 390.9 191.6 320 191.6C249.1 191.6 191.6 249.1 191.6 320C191.6 390.9 249.1 448.4 320 448.4C390.9 448.4 448.4 390.9 448.4 320z"/>
        </svg>
      }
    </button>

    <!-- Hamburger Button -->
    <button
      type="button"
      class="navbar__hamburger"
      (click)="toggleMobileMenu()"
      [attr.aria-label]="isMobileMenuOpen() ? 'Close menu' : 'Open menu'"
      [attr.aria-expanded]="isMobileMenuOpen()"
    >
      <span class="navbar__hamburger-line"></span>
      <span class="navbar__hamburger-line"></span>
      <span class="navbar__hamburger-line"></span>
    </button>
  </div>

  <!-- Desktop Theme Switcher (≥ 768px) - Keep existing -->
  <div class="navbar__theme-switcher">
    <!-- ... existing desktop theme switcher code ... -->
  </div>

  <!-- Mobile Navigation Drawer (< 768px) -->
  @if (isMobileMenuOpen()) {
    <div
      class="navbar__mobile-overlay"
      (click)="closeMobileMenu()"
      [@fadeIn]
    ></div>

    <div class="navbar__mobile-drawer" [@slideIn]>
      <nav class="navbar__mobile-nav">
        <ul class="navbar__links navbar__links--mobile">
          @for (item of navItems; track item.path) {
          <li>
            <a
              [routerLink]="item.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.path === '/' }"
              (click)="closeMobileMenu()"
            >
              {{ item.label }}
            </a>
          </li>
          }
        </ul>
      </nav>
    </div>
  }
</nav>
```

**Key improvements:**
- Separate desktop/mobile navigation structures
- Hamburger icon with 3 animated lines
- Overlay for backdrop (click to close)
- Drawer slides in from right
- Proper ARIA attributes (aria-label, aria-expanded)

#### **Phase 3: Mobile Navigation SCSS** (Priority: 🔥 HIGH)

**File:** `frontend/src/app/components/navbar/navbar.scss`

```scss
@use '../../../styles/variables' as *;

:host {
  display: block;
  position: sticky;
  top: 0;
  z-index: $z-index-navbar;
}

.navbar {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--spacing-8);
  padding: var(--spacing-10) var(--spacing-8);
  background: var(--surface);
  border-bottom: 1px solid var(--border-default);
  box-shadow: var(--shadow-sm);

  // [... existing navbar styles ...]

  // ---------------------------------------------------------------------------
  // Mobile Actions Container (< 768px only)
  // ---------------------------------------------------------------------------
  &__mobile-actions {
    display: none; // Hidden on desktop
    justify-self: end;
    align-items: center;
    gap: var(--spacing-4);

    @media (max-width: $breakpoint-mobile) {
      display: flex;
    }
  }

  // ---------------------------------------------------------------------------
  // Mobile Theme Toggle (icon only, no labels)
  // ---------------------------------------------------------------------------
  &__theme-toggle-mobile {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;  // Touch target size (Apple HIG)
    height: 44px;
    padding: var(--spacing-2);
    background: transparent;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-full);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);

    svg {
      width: 20px;
      height: 20px;
    }

    &:hover {
      background: var(--surface-hover);
      border-color: var(--border-strong);
      color: var(--primary);
    }

    &:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }
  }

  // ---------------------------------------------------------------------------
  // Hamburger Button (animated)
  // ---------------------------------------------------------------------------
  &__hamburger {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    width: 44px;  // Touch target
    height: 44px;
    padding: var(--spacing-2);
    background: transparent;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-default);
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover {
      background: var(--surface-hover);
      border-color: var(--border-strong);
    }

    &:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }
  }

  &__hamburger-line {
    width: 100%;
    height: 2px;
    background: var(--text-primary);
    border-radius: 2px;
    transition: all var(--transition-base);

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }

  // Animate to X when menu is open
  &__hamburger[aria-expanded="true"] &__hamburger-line {
    &:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }
    &:nth-child(2) {
      opacity: 0;
    }
    &:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }
  }

  // ---------------------------------------------------------------------------
  // Mobile Overlay (backdrop)
  // ---------------------------------------------------------------------------
  &__mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: oklch(from var(--color-black) l c h / 0.5);
    backdrop-filter: blur(4px);
    z-index: calc($z-index-navbar + 1);
    animation: fadeIn var(--transition-base) ease;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }

  // ---------------------------------------------------------------------------
  // Mobile Drawer (slide in from right)
  // ---------------------------------------------------------------------------
  &__mobile-drawer {
    position: fixed;
    top: 0;
    right: 0;
    width: 280px;  // Drawer width
    max-width: 85vw;  // Responsive on small phones
    height: 100vh;
    background: var(--surface);
    border-left: 1px solid var(--border-default);
    box-shadow: var(--shadow-xl);
    z-index: calc($z-index-navbar + 2);
    overflow-y: auto;
    animation: slideIn var(--transition-slow) var(--ease-out);

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }

  &__mobile-nav {
    padding: var(--spacing-8) var(--spacing-6);
  }

  // ---------------------------------------------------------------------------
  // Navigation Links (Desktop vs Mobile)
  // ---------------------------------------------------------------------------
  &__links {
    list-style: none;
    margin: 0;
    padding: 0;

    // Desktop horizontal layout
    &--desktop {
      display: flex;
      gap: var(--spacing-8);
      justify-self: center;

      @media (max-width: $breakpoint-mobile) {
        display: none; // Hidden on mobile
      }

      a {
        position: relative;
        padding: var(--spacing-2) 0;
        font-size: var(--font-size-base);
        color: var(--text-secondary);
        transition: color var(--transition-fast);

        // Underline animation
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: var(--primary);
          transition: all var(--transition-base);
          transform: translateX(-50%);
        }

        &:hover {
          color: var(--text-primary);

          &::after {
            width: 100%;
          }
        }

        &.active {
          color: var(--primary);
          font-weight: var(--font-weight-semibold);

          &::after {
            width: 100%;
          }
        }
      }
    }

    // Mobile vertical layout
    &--mobile {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);

      li {
        width: 100%;
      }

      a {
        display: block;
        padding: var(--spacing-4) var(--spacing-4);
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-medium);
        color: var(--text-primary);
        border-radius: var(--radius-default);
        transition: all var(--transition-fast);

        &:hover {
          background: var(--surface-hover);
          color: var(--primary);
        }

        &.active {
          background: var(--primary-alpha-10);
          color: var(--primary);
          font-weight: var(--font-weight-semibold);
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Desktop Theme Switcher (hide on mobile)
  // ---------------------------------------------------------------------------
  &__theme-switcher {
    @media (max-width: $breakpoint-mobile) {
      display: none; // Hidden on mobile (use mobile toggle instead)
    }

    // ... existing desktop theme switcher styles ...
  }

  // ---------------------------------------------------------------------------
  // Animations
  // ---------------------------------------------------------------------------
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
}
```

**Key features:**
- **Touch targets:** 44px minimum (Apple HIG / Material Design)
- **Drawer width:** 280px (common mobile pattern)
- **Backdrop overlay:** Semi-transparent black with blur
- **Smooth animations:** Slide-in drawer, fade-in overlay
- **Respects reduced motion:** Animations disabled for accessibility

#### **Phase 4: Angular Animations (Optional Enhancement)**

**File:** `frontend/src/app/components/navbar/navbar.ts`

```typescript
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-navbar',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('400ms cubic-bezier(0, 0, 0.2, 1)', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 1, 1)', style({ transform: 'translateX(100%)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms ease', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease', style({ opacity: 0 }))
      ])
    ])
  ]
})
```

**Why Angular animations?**
- Declarative animation syntax
- Built-in performance optimizations
- Automatic cleanup on component destroy
- Better than CSS for enter/leave transitions

---

## 🔧 Refactoring Opportunities

### 1. **Design Token Consistency** (Priority: 🔴 MEDIUM)

#### **Problem: Hardcoded Values**

```scss
// ❌ BAD: Hardcoded values in multiple files

// button.scss
border-radius: 0.25rem;  // Should be: var(--radius-sm)
padding: 0.25rem 0.5rem; // Should be: var(--spacing-1) var(--spacing-2)
font-size: 0.875rem;     // Should be: var(--font-size-sm)

// project-card.scss
border-radius: 12px;     // Should be: var(--radius-md)
padding: 1.5rem;         // Should be: var(--spacing-6)
gap: 1rem;               // Should be: var(--spacing-4)

// footer.scss
padding: 1.5rem 2rem;    // Should be: var(--spacing-6) var(--spacing-8)
font-size: 0.875rem;     // Should be: var(--font-size-sm)
gap: 1.5rem;             // Should be: var(--spacing-6)
```

#### **Solution: Use Design Tokens Everywhere**

```scss
// ✅ GOOD: Use design tokens consistently

// button.scss
border-radius: var(--radius-sm);
padding: var(--spacing-1) var(--spacing-2);
font-size: var(--font-size-sm);

// project-card.scss
border-radius: var(--radius-md);
padding: var(--spacing-6);
gap: var(--spacing-4);

// footer.scss
padding: var(--spacing-6) var(--spacing-8);
font-size: var(--font-size-sm);
gap: var(--spacing-6);
```

**Benefits:**
- **Single source of truth** for design values
- **Easier to refactor** (change token, updates everywhere)
- **Consistent spacing/sizing** across the app
- **Theme-aware** (tokens adapt to light/dark mode)

#### **Action Items:**
1. Audit all `.scss` files for hardcoded `rem`, `px`, `em` values
2. Replace with appropriate design tokens
3. Add ESLint/Stylelint rule to prevent future hardcoding
4. Document token usage in `docs/technical/style-system/`

---

### 2. **Naming Convention Inconsistencies** (Priority: 🟡 LOW)

#### **Problem: Mixed Naming Patterns**

```scss
// ❌ INCONSISTENT: Different naming styles

// Some components use full words
.navbar__theme-switcher { }
.navbar__theme-option { }

// Others use abbreviations
.tech-badge { }  // Should be .technology-badge
.btn { }         // Should be .button

// Some use size-* pattern, others use full names
.btn.size-sm { }   // Should match other components
.btn.size-md { }
.btn.size-lg { }

// Some use variant pattern, others inline
.btn.primary { }   // Inconsistent with other components
.button--primary { } // Would match BEM pattern better
```

#### **Solution: Standardize BEM Modifiers**

```scss
// ✅ CONSISTENT: BEM modifiers everywhere

// Button component
.button {
  &--primary { }    // .button--primary
  &--secondary { }  // .button--secondary
  &--ghost { }      // .button--ghost

  &--size-sm { }    // .button--size-sm
  &--size-md { }    // .button--size-md
  &--size-lg { }    // .button--size-lg
}

// Technology badge component (rename)
.technology-badge { }  // Or keep as .tech-badge if "tech" is deliberate abbreviation

// Project card
.project-card {
  &__image { }
  &__content { }
  &__technologies { }

  &--featured { }   // Modifier for featured projects
}
```

**BEM Naming Rules:**
- **Block:** `.component-name` (e.g., `.navbar`, `.button`)
- **Element:** `.block__element` (e.g., `.navbar__brand`, `.button__icon`)
- **Modifier:** `.block--modifier` (e.g., `.button--primary`, `.navbar--scrolled`)
- **No nested elements:** `.block__element__subelement` ❌ → use `.block__subelement` ✅

---

### 3. **Footer Accessibility Enhancement** (Priority: 🟢 LOW)

#### **Current Issue:**

```typescript
// ❌ PROBLEMATIC: new Date() in component
export class Footer {
  protected readonly currentYear = new Date().getFullYear()
}
```

**According to Angular CLAUDE.md:**
> "Do not assume globals like (`new Date()`) are available."

**Why it's risky:**
- SSR (Server-Side Rendering) might break
- Testing becomes harder (need to mock `Date`)
- Not dependency-injectable

#### **Better Approach:**

```typescript
// ✅ BETTER: Inject date service or use signal
export class Footer {
  // Option 1: Static (set at build time)
  protected readonly currentYear = 2025;

  // Option 2: Dynamic signal (updates at runtime)
  protected readonly currentYear = signal(new Date().getFullYear());

  // Option 3: Inject a DateService (best for testing)
  private dateService = inject(DateService);
  protected readonly currentYear = computed(() => this.dateService.getCurrentYear());
}
```

**Recommended:** Use Option 1 (static) for portfolio footer — copyright year doesn't need to be dynamic.

---

### 4. **Performance Optimizations** (Priority: 🟡 MEDIUM)

#### **4.1 Missing NgOptimizedImage**

```html
<!-- ❌ CURRENT: Regular img tag -->
<img [src]="project.thumbnail" [alt]="project.name" />
```

**Problem:**
- No lazy loading
- No automatic srcset generation
- No blur placeholder
- No priority loading for above-fold images

**Solution:**

```html
<!-- ✅ BETTER: NgOptimizedImage with lazy loading -->
<img
  [ngSrc]="project.thumbnail"
  [alt]="project.name"
  width="400"
  height="300"
  priority="false"
  loading="lazy"
/>

<!-- For hero image (above fold) -->
<img
  [ngSrc]="heroImage"
  alt="Thomas Karcher"
  width="500"
  height="500"
  priority="true"
/>
```

**Benefits:**
- **Automatic lazy loading** (75% faster page load)
- **Responsive srcset** (serves correct size)
- **Priority hints** for LCP optimization
- **Blur placeholder** while loading

#### **4.2 Missing TrackBy Optimization**

```html
<!-- ✅ CURRENT: Already using track! Good! -->
@for (item of navItems; track item.path) { }
@for (project of projects; track project.id) { }
```

**Great!** You're already using `track` in `@for` loops. This is essential for performance.

#### **4.3 Animation Performance**

```scss
// ⚠️ POTENTIAL ISSUE: Animating expensive properties
.project-card:hover {
  transform: translateY(-4px);  // ✅ Good (GPU-accelerated)
  box-shadow: var(--shadow-lg); // ⚠️ Can be expensive
}
```

**Optimization:**

```scss
// ✅ OPTIMIZED: Use will-change for expensive animations
.project-card {
  will-change: transform;  // Hint to browser
  transition: transform var(--transition-base), box-shadow var(--transition-base);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  // Remove hint after animation
  &:not(:hover) {
    will-change: auto;
  }
}
```

**Warning:** Don't overuse `will-change` — only for elements that animate frequently.

---

### 5. **SCSS File Organization** (Priority: 🟢 LOW)

#### **Current Structure:**

```
styles/
├── _design-tokens.scss  ✅
├── _fonts.scss          ✅
├── _themes.scss         ✅
├── _variables.scss      ✅
├── _tokens.scss         ✅
└── styles.scss          ✅
```

**Observation:** Excellent organization! Only minor suggestion:

#### **Add Utilities Partial**

```scss
// NEW FILE: styles/_utilities.scss
// Extract utility classes from styles.scss

// Container utilities
.container { }
.container-sm { }
.container-lg { }

// Spacing utilities
.mt-1 { margin-top: var(--spacing-1); }
.mt-2 { margin-top: var(--spacing-2); }
// ... etc

// Display utilities
.flex { display: flex; }
.grid { display: grid; }
.block { display: block; }

// Text utilities
.text-center { text-align: center; }
.text-left { text-align: left; }
```

**Benefits:**
- Separate concerns (utilities vs. base styles)
- Easier to find utility classes
- Can be tree-shaken if unused

---

### 6. **Type Safety Improvements** (Priority: 🟡 MEDIUM)

#### **Current:**

```typescript
// ❌ LOOSE: navItems has inferred type
navItems = [
  {label: 'Home', path: '/'},
  {label: 'Projects', path: '/projects'},
  {label: 'About', path: '/about'}
]
```

#### **Better:**

```typescript
// ✅ STRICT: Define interface for type safety
interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon?: string;  // Optional icon for future
}

export class Navbar {
  readonly navItems: readonly NavItem[] = [
    {label: 'Home', path: '/'},
    {label: 'Projects', path: '/projects'},
    {label: 'About', path: '/about'}
  ] as const;
}
```

**Benefits:**
- **IntelliSense** in templates
- **Compile-time safety** (no typos)
- **Future-proof** (easy to add properties)
- **Immutable** with `readonly` + `as const`

---

## 📱 Responsive Breakpoint Strategy

### Current Breakpoints

```scss
// _variables.scss
$breakpoint-mobile: 768px;   // Tablets and below
$breakpoint-tablet: 1024px;  // Desktops and below
$breakpoint-desktop: 1280px; // Large screens
```

**Analysis:** Good mobile-first approach! But missing intermediate breakpoints.

### Recommended Breakpoints (2025 Standards)

```scss
// _variables.scss - ENHANCED
$breakpoint-xs: 375px;    // iPhone SE, small phones
$breakpoint-sm: 640px;    // Large phones (landscape)
$breakpoint-md: 768px;    // Tablets (portrait)
$breakpoint-lg: 1024px;   // Tablets (landscape) / Small laptops
$breakpoint-xl: 1280px;   // Desktops
$breakpoint-2xl: 1536px;  // Large desktops

// Common device queries (convenience)
$breakpoint-mobile: $breakpoint-md;   // < 768px
$breakpoint-tablet: $breakpoint-lg;   // 768px - 1024px
$breakpoint-desktop: $breakpoint-xl;  // ≥ 1024px
```

### Mobile-First Media Query Pattern

```scss
// ✅ MOBILE-FIRST: Start with mobile, enhance for larger screens

.component {
  // Mobile styles (default)
  padding: var(--spacing-4);
  font-size: var(--font-size-sm);

  // Small phones (≥ 375px)
  @media (min-width: $breakpoint-xs) {
    padding: var(--spacing-5);
  }

  // Large phones (≥ 640px)
  @media (min-width: $breakpoint-sm) {
    font-size: var(--font-size-base);
  }

  // Tablets (≥ 768px)
  @media (min-width: $breakpoint-md) {
    padding: var(--spacing-6);
  }

  // Desktops (≥ 1024px)
  @media (min-width: $breakpoint-lg) {
    padding: var(--spacing-8);
    font-size: var(--font-size-lg);
  }
}
```

**Why mobile-first?**
- Smaller initial CSS payload (mobile users benefit)
- Progressive enhancement mindset
- Easier to add complexity than remove it

---

## ♿ Accessibility Enhancements

### Current State: ⭐⭐⭐⭐ (4/5) — Excellent Foundation!

**What's already great:**
- ✅ `prefers-reduced-motion` support
- ✅ Focus-visible states
- ✅ Semantic HTML (`<nav>`, `<ul>`, `<button>`)
- ✅ ARIA labels on theme toggle
- ✅ Proper heading hierarchy

### Recommended Improvements

#### **1. Add Skip Navigation Link**

```html
<!-- navbar.html - Add before <nav> -->
<a href="#main-content" class="navbar__skip-link">
  Skip to main content
</a>

<nav class="navbar">
  <!-- ... existing navbar -->
</nav>
```

```scss
// navbar.scss
.navbar__skip-link {
  position: absolute;
  top: -100px;
  left: 0;
  padding: var(--spacing-4) var(--spacing-6);
  background: var(--primary);
  color: var(--text-on-primary);
  text-decoration: none;
  border-radius: 0 0 var(--radius-default) 0;
  transition: top var(--transition-fast);
  z-index: calc($z-index-navbar + 100);

  &:focus {
    top: 0;
  }
}
```

**Why it matters:**
- Keyboard users can skip repetitive navigation
- WCAG 2.1 Level A requirement (2.4.1)
- Improves UX for screen reader users

#### **2. Improve Focus Management in Mobile Menu**

```typescript
// navbar.ts - Enhanced focus trap
export class Navbar implements AfterViewInit {
  @ViewChild('mobileDrawer') mobileDrawer?: ElementRef;
  private firstFocusableElement?: HTMLElement;
  private lastFocusableElement?: HTMLElement;

  ngAfterViewInit(): void {
    if (this.mobileDrawer) {
      const focusableElements = this.mobileDrawer.nativeElement.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      this.firstFocusableElement = focusableElements[0] as HTMLElement;
      this.lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);

    if (this.isMobileMenuOpen()) {
      document.body.style.overflow = 'hidden';

      // Focus first link when menu opens
      setTimeout(() => this.firstFocusableElement?.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.isMobileMenuOpen()) return;

    // Close on Escape
    if (event.key === 'Escape') {
      this.closeMobileMenu();
    }

    // Trap focus inside drawer
    if (event.key === 'Tab') {
      if (event.shiftKey && document.activeElement === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement?.focus();
      } else if (!event.shiftKey && document.activeElement === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement?.focus();
      }
    }
  }
}
```

**Why it matters:**
- Keyboard users can't escape mobile menu without focus trap
- WCAG 2.1 Level A requirement (2.1.2)
- Better UX for all keyboard-only users

#### **3. Add ARIA Roles to Mobile Drawer**

```html
<!-- navbar.html - Enhanced ARIA -->
<div
  class="navbar__mobile-drawer"
  role="dialog"
  aria-modal="true"
  aria-labelledby="mobile-nav-title"
  #mobileDrawer
>
  <h2 id="mobile-nav-title" class="sr-only">Navigation Menu</h2>

  <nav class="navbar__mobile-nav" aria-label="Primary navigation">
    <ul class="navbar__links navbar__links--mobile">
      <!-- ... nav items -->
    </ul>
  </nav>
</div>
```

```scss
// Add screen reader only class
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 🎨 Design System Recommendations

### Color Contrast Validation

**Current:** Using OKLCH is excellent for perceptual uniformity, but **validate contrast ratios**.

#### **Tools to Use:**
1. **Chrome DevTools** → Lighthouse → Accessibility audit
2. **Axe DevTools** browser extension
3. **Online checker:** https://webaim.org/resources/contrastchecker/

#### **WCAG AA Requirements:**
- **Normal text (< 18px):** 4.5:1 contrast ratio
- **Large text (≥ 18px or bold ≥ 14px):** 3:1 contrast ratio
- **UI components:** 3:1 contrast ratio

#### **Audit Checklist:**
```scss
// Check these color combinations:

// Light theme
--text-primary (#1E293B) on --bg-primary (#FFFFFF)
// → Should be ~16.7:1 ✅ Excellent!

--text-secondary (#64748B) on --bg-primary (#FFFFFF)
// → Should be ~4.5:1 ✅ Good!

--primary (#2563EB) on --surface (#F8FAFC)
// → Check with tool (likely good, but validate)

// Dark theme
--text-primary (#F1F5F9) on --bg-primary (#0F172A)
// → Should be ~16:1 ✅ Excellent!

--text-secondary (#94A3B8) on --bg-primary (#0F172A)
// → Should be ~7.6:1 ✅ Excellent!
```

**Action:** Run Lighthouse audit and fix any contrast issues.

---

## 📋 Implementation Roadmap

### Phase 1: Mobile Navigation (Week 1) 🔥

**Day 1-2: Hamburger Menu Foundation**
- [ ] Add `isMobileMenuOpen` signal to navbar component
- [ ] Create hamburger button HTML
- [ ] Style hamburger icon (3 lines)
- [ ] Add click handler to toggle signal

**Day 3-4: Mobile Drawer**
- [ ] Create drawer HTML structure
- [ ] Style drawer (280px width, slide-in animation)
- [ ] Add backdrop overlay
- [ ] Implement body scroll lock

**Day 5: Polish & Accessibility**
- [ ] Add focus trap logic
- [ ] Test keyboard navigation (Tab, Escape)
- [ ] Add ARIA attributes (role="dialog", aria-modal)
- [ ] Test on real mobile devices (iOS Safari, Chrome Android)

**Day 6-7: Testing & Refinement**
- [ ] Cross-browser testing (Safari, Firefox, Edge)
- [ ] Accessibility audit (Axe DevTools)
- [ ] Performance testing (Lighthouse)
- [ ] Fix any issues found

---

### Phase 2: Design Token Refactoring (Week 2) 🔴

**Day 1-2: Audit Hardcoded Values**
- [ ] Search all `.scss` files for hardcoded `px`, `rem`, `em`
- [ ] Create spreadsheet of locations to refactor
- [ ] Categorize by priority (high/medium/low)

**Day 3-5: Replace with Tokens**
- [ ] Refactor `button.scss`
- [ ] Refactor `project-card.scss`
- [ ] Refactor `footer.scss`
- [ ] Refactor `navbar.scss`
- [ ] Refactor `home.scss`

**Day 6-7: Validation & Documentation**
- [ ] Visual regression testing (compare before/after screenshots)
- [ ] Update design system documentation
- [ ] Add Stylelint rule to prevent future hardcoding

---

### Phase 3: Performance & Accessibility (Week 3) 🟡

**Day 1-2: NgOptimizedImage**
- [ ] Replace `<img>` with `<img ngSrc>` in project cards
- [ ] Add `width` and `height` attributes
- [ ] Set `priority="true"` for hero image
- [ ] Test lazy loading behavior

**Day 3-4: Accessibility Enhancements**
- [ ] Add skip navigation link
- [ ] Implement focus trap in mobile drawer
- [ ] Add ARIA roles and labels
- [ ] Run Axe DevTools audit and fix issues

**Day 5-7: Testing & Optimization**
- [ ] Lighthouse performance audit
- [ ] Optimize `will-change` usage
- [ ] Test on slow 3G connection
- [ ] Validate color contrast ratios

---

### Phase 4: Polish & Documentation (Week 4) 🟢

**Day 1-2: Code Quality**
- [ ] Add type interfaces for `navItems`
- [ ] Standardize BEM naming conventions
- [ ] Extract utility classes to `_utilities.scss`
- [ ] Add JSDoc comments to complex functions

**Day 3-4: Documentation**
- [ ] Update `CLAUDE.md` with new patterns
- [ ] Create mobile navigation guide
- [ ] Document breakpoint strategy
- [ ] Add component usage examples

**Day 5-7: Final Testing**
- [ ] End-to-end testing on all devices
- [ ] User acceptance testing
- [ ] Fix any remaining bugs
- [ ] Deploy to staging environment

---

## 🎨 Logo Design Concepts

Based on your **developer-focused portfolio** with modern tech stack (Angular, OKLCH, TypeScript), here are **4 SVG logo ideas** that match the brand personality:

---

### Logo Concept 1: **Code Bracket Monogram**
**Concept:** Minimalist `<TK/>` logo representing "Thomas Karcher" in developer syntax.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <!-- Left bracket < -->
  <path
    d="M80 50 L40 100 L80 150"
    stroke="currentColor"
    stroke-width="8"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="none"
  />

  <!-- T letter -->
  <path
    d="M90 70 L130 70 M110 70 L110 130"
    stroke="currentColor"
    stroke-width="8"
    stroke-linecap="round"
  />

  <!-- K letter -->
  <path
    d="M140 70 L140 130 M140 100 L170 70 M140 100 L170 130"
    stroke="currentColor"
    stroke-width="8"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  <!-- Right bracket > -->
  <path
    d="M120 50 L160 100 L120 150"
    stroke="currentColor"
    stroke-width="8"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="none"
  />
</svg>
```

**Usage:**
```html
<!-- In navbar.html -->
<a routerLink="/" class="navbar__logo">
  <svg class="navbar__logo-icon" viewBox="0 0 200 200">
    <!-- ... logo SVG code ... -->
  </svg>
  <span>Thomas Karcher</span>
</a>
```

**Style:**
- **Minimal** — Clean lines, no clutter
- **Developer-centric** — Code syntax as logo
- **Scalable** — Works at any size (16px to 200px)
- **Color:** Inherits `currentColor` (adapts to theme)

**Variants:**
- Monochrome (current)
- Gradient (blue to red, matching `--primary` and `--accent`)
- Animated (brackets slide in on page load)

---

### Logo Concept 2: **Geometric Hexagon Grid**
**Concept:** Interconnected hexagons representing **tech stack, modularity, Angular components**.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <!-- Center hexagon (primary color) -->
  <path
    d="M100 60 L130 80 L130 120 L100 140 L70 120 L70 80 Z"
    fill="var(--primary)"
    stroke="var(--primary)"
    stroke-width="2"
  />

  <!-- Top-left hexagon (accent color, semi-transparent) -->
  <path
    d="M55 40 L70 48 L70 64 L55 72 L40 64 L40 48 Z"
    fill="var(--accent-alpha-20)"
    stroke="var(--accent)"
    stroke-width="1.5"
  />

  <!-- Top-right hexagon -->
  <path
    d="M145 40 L160 48 L160 64 L145 72 L130 64 L130 48 Z"
    fill="var(--accent-alpha-20)"
    stroke="var(--accent)"
    stroke-width="1.5"
  />

  <!-- Bottom hexagon -->
  <path
    d="M100 136 L115 144 L115 160 L100 168 L85 160 L85 144 Z"
    fill="var(--primary-alpha-30)"
    stroke="var(--primary)"
    stroke-width="1.5"
  />

  <!-- Connecting lines (subtle) -->
  <line x1="100" y1="60" x2="70" y2="64" stroke="var(--border-interactive)" stroke-width="1" opacity="0.5"/>
  <line x1="100" y1="60" x2="130" y2="64" stroke="var(--border-interactive)" stroke-width="1" opacity="0.5"/>
</svg>
```

**Style:**
- **Geometric** — Modern, structured
- **Modular** — Represents component-based architecture
- **Dynamic** — Can animate hexagons rotating or pulsing
- **Color:** Uses design tokens (theme-aware)

**Animation idea (CSS):**
```scss
@keyframes hexagon-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

.navbar__logo-icon path {
  animation: hexagon-pulse 3s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.3s); // Stagger animation
}
```

---

### Logo Concept 3: **Terminal Cursor**
**Concept:** Blinking terminal cursor with initials `TK_` (developer command-line aesthetic).

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor">
  <!-- Terminal prompt symbol > -->
  <path
    d="M40 90 L60 100 L40 110"
    stroke="var(--success)"
    stroke-width="6"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="none"
  />

  <!-- T letter (monospace style) -->
  <text
    x="75"
    y="110"
    font-family="'Fira Code', monospace"
    font-size="32"
    font-weight="600"
    fill="var(--text-primary)"
  >
    TK
  </text>

  <!-- Blinking cursor -->
  <rect
    x="135"
    y="85"
    width="4"
    height="28"
    fill="var(--primary)"
    class="cursor-blink"
  />
</svg>
```

**Animation:**
```scss
@keyframes cursor-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.cursor-blink {
  animation: cursor-blink 1s step-end infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1; // Always visible for accessibility
  }
}
```

**Style:**
- **Retro-modern** — Terminal aesthetic, but clean
- **Playful** — Blinking cursor adds personality
- **Developer-centric** — Command-line roots
- **Accessible** — Respects `prefers-reduced-motion`

---

### Logo Concept 4: **Abstract TK Letterform**
**Concept:** Modern overlapping `T` and `K` shapes with gradient fill.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <defs>
    <!-- Gradient from primary to accent -->
    <linearGradient id="tkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:var(--primary);stop-opacity:1" />
      <stop offset="100%" style="stop-color:var(--accent);stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- T shape (thick vertical + horizontal) -->
  <path
    d="M60 50 L140 50 L140 70 L110 70 L110 150 L90 150 L90 70 L60 70 Z"
    fill="url(#tkGradient)"
  />

  <!-- K shape (overlapping, creates depth) -->
  <path
    d="M120 80 L120 150 L140 150 L140 80 Z M120 110 L160 80 L175 95 L140 120 Z M120 110 L160 150 L145 165 L110 125 Z"
    fill="var(--primary)"
    opacity="0.8"
  />
</svg>
```

**Style:**
- **Modern** — Abstract letterform, not literal
- **Sophisticated** — Gradient adds depth
- **Brand-focused** — Initials as core identity
- **Scalable** — Works from favicon to hero

**Variants:**
- **Solid color** (no gradient, single `var(--primary)`)
- **Outline** (stroke instead of fill)
- **3D effect** (layered shadows)

---

## 🎨 Logo Recommendations

### **For Navbar (Small Size, 32-48px):**
→ **Logo 1 (Code Bracket)** or **Logo 3 (Terminal Cursor)**
**Why:** Simple, recognizable at small sizes, minimal details.

### **For Hero Section (Large Size, 200-400px):**
→ **Logo 2 (Hexagon Grid)** or **Logo 4 (TK Letterform)**
**Why:** More complex, shows personality, benefits from larger canvas.

### **For Favicon (16x16px):**
→ **Logo 1 (Code Bracket)** simplified to just `<TK/>`
**Why:** Must be ultra-simple at tiny sizes.

### **Color Strategy:**

```scss
// Logo color system (theme-aware)
.navbar__logo-icon {
  color: var(--text-primary);  // Default
  transition: color var(--transition-base);

  &:hover {
    color: var(--primary);  // Interactive state
  }

  // Gradient variant (for Logo 4)
  &--gradient {
    // Gradient updates with theme (via CSS variables)
    background: linear-gradient(135deg, var(--primary), var(--accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}
```

---

## 📊 Summary & Next Steps

### Priority Matrix

| Task | Impact | Effort | Priority |
|------|--------|--------|----------|
| Hamburger menu implementation | 🔥 High | Medium | **Week 1** |
| Design token refactoring | 🔴 Medium | Low | **Week 2** |
| NgOptimizedImage migration | 🔴 Medium | Low | **Week 3** |
| Focus trap accessibility | 🟡 Medium | Low | **Week 3** |
| BEM naming standardization | 🟢 Low | Low | **Week 4** |
| Logo selection & implementation | 🟡 Medium | Low | **Week 4** |

### Key Takeaways

✅ **Strengths to maintain:**
- Modern Angular 21 patterns (signals, OnPush, standalone)
- Sophisticated OKLCH design system
- Strong accessibility foundations
- Clean BEM + SCSS architecture

🚨 **Critical improvements:**
- Implement hamburger menu (mobile navigation is broken)
- Replace hardcoded values with design tokens
- Add focus trap and ARIA roles for accessibility

🎯 **Long-term goals:**
- Achieve 100% Lighthouse accessibility score
- Optimize for Core Web Vitals (LCP, CLS, FID)
- Build reusable component library
- Document design system thoroughly

---

## 📚 Resources & References

### Design Systems
- [Material Design 3 Navigation](https://m3.material.io/components/navigation-drawer)
- [Apple Human Interface Guidelines - Navigation](https://developer.apple.com/design/human-interface-guidelines/navigation-bars)
- [Tailwind CSS Breakpoints](https://tailwindcss.com/docs/responsive-design)

### Accessibility
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [Inclusive Components - Menus](https://inclusive-components.design/menus-menu-buttons/)

### Angular Best Practices
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [Angular Performance Checklist](https://web.dev/articles/angular-perf-checklist)
- [OnPush Change Detection](https://angular.dev/best-practices/runtime-performance)

### Color & Design
- [OKLCH Color Picker](https://oklch.com/)
- [Contrast Ratio Calculator](https://webaim.org/resources/contrastchecker/)
- [Color Hunt - Palettes](https://colorhunt.co/)

---

**End of Review** — Ready to build an exceptional mobile experience! 🚀
