# Terminal Logo Usage Guide

## 🎨 Two Versions Available

### 1. **`logo-terminal-animated.svg`** (Hardcoded Colors)
- ✅ Works as `<img src="">` tag
- ✅ Works in any context (external file)
- ✅ Cursor blinks automatically
- ❌ Colors don't adapt to theme (always same)

**Colors used:**
- Prompt `>`: `#FF6B35` (your accent orange)
- Text `TK_`: `#1E293B` (your text-primary)
- Cursor: `#2563EB` (your primary blue)

**Usage:**
```html
<!-- navbar.html -->
<a routerLink="/" class="navbar__logo">
  <img src="/assets/logos/logo-terminal-animated.svg" alt="TK" />
</a>
```

---

### 2. **`logo-terminal-theme-aware.svg`** (CSS Variables)
- ✅ Adapts to light/dark theme automatically
- ✅ Cursor blinks automatically
- ✅ Uses your design tokens
- ⚠️ Must be INLINED in HTML (not `<img src="">`)

**Colors used:**
- Prompt `>`: `var(--accent)` (orange in light, lighter orange in dark)
- Text `TK_`: `var(--text-primary)` (dark gray in light, light gray in dark)
- Cursor: `var(--primary)` (blue, adapts to theme)

**Usage (inline SVG):**
```html
<!-- navbar.html -->
<a routerLink="/" class="navbar__logo">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" fill="none">
    <style>
      .prompt { stroke: var(--accent, #FF6B35); }
      .text { stroke: var(--text-primary, #1E293B); }
      .cursor {
        fill: var(--primary, #2563EB);
        animation: cursor-blink 1.2s step-end infinite;
      }
      @keyframes cursor-blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        .cursor { animation: none; opacity: 1; }
      }
    </style>
    <!-- ... rest of SVG code ... -->
  </svg>
</a>
```

**Or create a component:**
```typescript
// terminal-logo.component.ts
@Component({
  selector: 'app-terminal-logo',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" fill="none" class="terminal-logo">
      <!-- SVG content from logo-terminal-theme-aware.svg -->
    </svg>
  `,
  styles: [`
    .terminal-logo {
      width: 120px;
      height: auto;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerminalLogo {}
```

---

## 🎯 Which One Should I Use?

### **For Navbar: Use `logo-terminal-animated.svg`**
**Why:** Simple `<img>` tag, works everywhere, good performance.

```html
<a routerLink="/" class="navbar__logo">
  <img
    src="/assets/logos/logo-terminal-animated.svg"
    alt="Thomas Karcher"
    width="120"
    height="48"
  />
</a>
```

```scss
.navbar__logo img {
  width: 120px;
  height: auto;

  @media (max-width: $breakpoint-mobile) {
    width: 100px;
  }
}
```

---

### **For Hero Section: Use Theme-Aware (Inline)**
**Why:** Large display, benefits from theme adaptation.

```html
<!-- home.html -->
<div class="hero__logo">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" fill="none">
    <!-- Paste content from logo-terminal-theme-aware.svg -->
  </svg>
</div>
```

---

## ✅ Testing the Animation

1. **Open in browser:**
   ```bash
   cd frontend/src/assets/logos
   open logo-terminal-animated.svg  # macOS
   # or drag file into browser
   ```

2. **You should see:**
   - Orange `>` prompt
   - Black `TK_` text
   - **Blue cursor blinking** every 1.2 seconds

3. **Test reduced motion:**
   - macOS: System Preferences → Accessibility → Display → Reduce motion
   - Windows: Settings → Ease of Access → Display → Show animations
   - Cursor should stop blinking and stay visible

---

## 🎨 Color Mapping (Your Design System)

```scss
// From your _tokens.scss and _themes.scss

// Light theme
--primary: #2563EB        → Cursor color
--accent: #FF6B35         → Prompt > color
--text-primary: #1E293B   → TK_ text color

// Dark theme
--primary: #3B82F6        → Cursor (lighter blue)
--accent: #FF8A65         → Prompt (lighter orange)
--text-primary: #F1F5F9   → TK_ text (light gray)
```

---

## 🚀 Quick Implementation (Recommended)

**Step 1:** Add to navbar

```html
<!-- navbar.html - Replace current logo -->
<div class="navbar__brand">
  <a routerLink="/" class="navbar__logo">
    <img
      src="/assets/logos/logo-terminal-animated.svg"
      alt="Thomas Karcher"
      class="navbar__logo-icon"
    />
    <span class="navbar__logo-text">Thomas Karcher</span>
  </a>
</div>
```

**Step 2:** Style it

```scss
// navbar.scss
.navbar__logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  text-decoration: none;
  transition: opacity var(--transition-fast);

  &:hover {
    opacity: 0.8;
  }

  &-icon {
    width: 120px;
    height: auto;

    @media (max-width: $breakpoint-mobile) {
      width: 100px;
    }
  }

  &-text {
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);

    @media (max-width: $breakpoint-mobile) {
      display: none; // Icon only on mobile
    }
  }
}
```

**Step 3:** Test it!
```bash
npm start
# Navigate to http://localhost:4200
# Watch the cursor blink 🎉
```

---

## 🐛 Troubleshooting

### **Cursor not blinking?**
- Check browser DevTools → Console for errors
- Verify CSS animation support (works in all modern browsers)
- Check if `prefers-reduced-motion` is enabled (cursor stays visible)

### **Colors look wrong?**
- **Animated version:** Colors are hardcoded, should be:
  - Orange prompt, dark text, blue cursor
- **Theme-aware version:** Must be inlined and CSS vars must be defined
  - Check your `_themes.scss` is loaded

### **Logo too big/small?**
- Adjust `width` in CSS
- SVG `viewBox="0 0 200 80"` maintains aspect ratio
- Width controls size, height auto-scales

---

**Your new logo is ready!** 🎨✨ The cursor should blink perfectly now with your color scheme!
