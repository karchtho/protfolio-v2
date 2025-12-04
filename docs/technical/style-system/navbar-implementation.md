# Navbar Implementation Guide

**Date:** December 2025
**Status:** ✅ Implemented

## Overview

Implementation of the main navigation bar with theme switcher slider. The navbar follows the project's design system, using design tokens and theme-aware CSS variables.

---

## Components

### Navbar Component
- **Location:** `frontend/src/app/components/navbar/`
- **Files:** `navbar.ts`, `navbar.html`, `navbar.scss`
- **Features:**
  - Logo with hover effect
  - Navigation links with active state indication
  - iOS-style theme toggle slider
  - Responsive layout

---

## Design System Compliance

### Typography

**Logo (Brand):**
```scss
font-family: 'Poppins', sans-serif;
font-size: 1.875rem;      // 30px (h3 style)
font-weight: 600;
line-height: 2.5rem;      // 40px
color: var(--text-primary);
```

**Navigation Links:**
```scss
font-family: 'Source Sans 3', sans-serif;
font-size: 1rem;          // 16px (paragraph style)
font-weight: 400;
line-height: 1.5rem;      // 24px (150%)
color: var(--text-secondary);
```

**Active Link:**
```scss
color: var(--primary);
font-weight: 600;
```

### Color Tokens Used

- `--surface` — Navbar background
- `--border-default` — Bottom border
- `--shadow-sm` — Subtle elevation
- `--text-primary` — Logo color
- `--text-secondary` — Link default color
- `--primary` — Active link and underline
- `--surface-hover` — Slider background
- `--border-strong` — Slider hover border

---

## Key Features

### 1. Active Link Indication

Uses Angular's `routerLinkActive` directive:
```html
<a
  [routerLink]="item.path"
  routerLinkActive="active"
  [routerLinkActiveOptions]="{ exact: item.path === '/' }"
>
```

**Visual feedback:**
- Color changes to `--primary`
- Weight increases to 600
- Underline appears at 100% width

### 2. Hover Animation

Underline animation that **grows from center**:
```scss
&::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;                    // Start from center
  width: 0;
  transform: translateX(-50%);
  transition: all 0.3s ease;
}

&:hover::after {
  width: 100%;                  // Expand to full width
}
```

### 3. Theme Switcher (Slider)

**Structure:**
```html
<div class="theme-switcher">
  <span class="theme-icon sun">☀️</span>
  <label for="theme-toggle" class="switch">
    <input
      type="checkbox"
      id="theme-toggle"
      [checked]="isDark()"
      (change)="onThemeToggle()"
    />
    <span class="slider"></span>
  </label>
  <span class="theme-icon moon">🌙</span>
</div>
```

**Key CSS technique:** Hidden checkbox with visual slider
```scss
input[type="checkbox"] {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;  // Accessible but invisible
}

.slider {
  // Visual representation
  &::before {
    // The sliding button
    transform: translateX(0);
  }
}

input:checked + .slider::before {
  transform: translateX(24px);  // Slide to the right
}
```

**Theme-aware colors:**
The slider uses CSS variables that automatically change based on `data-theme`:
- No manual color overrides needed
- Inherits theme colors automatically
- Consistent with the rest of the UI

### 4. Icon Opacity Toggle

Uses the `:has()` pseudo-class for state-based styling:
```scss
.theme-switcher:has(input:checked) {
  .sun { opacity: 0.4; }
  .moon { opacity: 1; }
}
```

This provides visual feedback showing which theme is active.

---

## Integration with ThemeService

**TypeScript:**
```typescript
private themeService = inject(ThemeService);

// Computed signal tracks dark mode state
isDark = computed(() => this.themeService.isDarkMode());

onThemeToggle(): void {
  this.themeService.toggleTheme();
}
```

**Template binding:**
```html
[checked]="isDark()"        // Reactive state
(change)="onThemeToggle()"  // User interaction
```

The checkbox state is **driven by signals**, ensuring reactivity without manual DOM manipulation.

---

## Accessibility

✅ **Semantic HTML:** `<nav>`, `<ul>`, `<label>`
✅ **ARIA labels:** `aria-label="Toggle theme"` on checkbox
✅ **Keyboard navigation:** Tab order, focus states
✅ **Focus indicators:** `:focus-visible` with outline
✅ **Hidden but accessible:** Checkbox is invisible but screen-reader compatible
✅ **Active state:** Visual and semantic indication via `routerLinkActive`

---

## Responsive Behavior

```scss
@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
  }

  .navbar-brand .logo {
    font-size: 1.5rem;    // Smaller on mobile
  }

  .navbar-links {
    gap: 1rem;            // Reduced spacing
    font-size: 0.875rem;
  }
}
```

**Future improvement:** Hamburger menu for mobile (Phase 3.5 roadmap).

---

## Lessons Learned

### 1. Label-Input Association
**Problem:** Slider wasn't clickable
**Solution:** Added `id` to input and `for` attribute to label
```html
<label for="theme-toggle" class="switch">
  <input type="checkbox" id="theme-toggle" />
```

### 2. Theme-Aware Styling
**Anti-pattern:** Manually changing colors with `input:checked`
```scss
// ❌ Don't do this
input:checked + .slider {
  background: var(--primary-alpha-20);
  border-color: var(--primary);
}
```

**Best practice:** Let theme variables do the work
```scss
// ✅ Do this instead
.slider {
  background: var(--surface-hover);
  border: 2px solid var(--border-default);
}
// Colors update automatically when data-theme changes!
```

### 3. Signal-Driven State
**Pattern:** Use `computed()` for derived reactive state
```typescript
isDark = computed(() => this.themeService.isDarkMode());
```

This ensures the checkbox stays in sync with the theme without manual updates.

---

## Navigation Structure

Current routes:
- `/home` — Home page (default)
- `/projects` — Projects listing
- `/about` — About page (placeholder)

**Note:** Logo link points to `/` for standard UX.

---

## Related Documentation

- [Theme System](../style-system/theme-system.md) — CSS variables and tokens
- [CLAUDE.md](../../../CLAUDE.md) — Design system conventions
- [ThemeService](../../frontend/src/app/services/theme.service.ts) — Service implementation

---

## Future Enhancements

- [ ] Mobile hamburger menu
- [ ] Animated menu transitions
- [ ] Dropdown for nested navigation (if needed)
- [ ] Sticky behavior with shadow on scroll
- [ ] Logo animation on load
