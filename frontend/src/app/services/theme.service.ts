import { effect,Injectable, signal } from '@angular/core';

/**
 * Available theme modes
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * Theme Service
 *
 * Manages application theme with:
 * - Light/Dark/Auto modes
 * - System preference detection
 * - LocalStorage persistence
 * - Reactive updates using signals
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'app-theme';
  private mediaQuery: MediaQueryList;

  /**
   * Current theme as a signal
   * Use this in components: themeService.theme()
   */
  readonly theme = signal<Theme>(this.getInitialTheme());

  /**
   * Computed current active theme (light or dark)
   * Useful when you need to know the actual applied theme
   */
  readonly activeTheme = signal<'light' | 'dark'>('light');

  constructor() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Apply initial theme
    this.applyTheme(this.theme());

    // Maintenant qu'on a mediaQuery, on peut calculer activeTheme
    this.activeTheme.set(this.getActiveTheme());

    // Setup system preference listener
    this.setupMediaQueryListener();

    // Effect to update theme when signal changes
    effect(() => {
      const theme = this.theme();
      this.applyTheme(theme);
      this.activeTheme.set(this.getActiveTheme());
    });
  }

  /**
   * Set the theme mode
   * @param theme - 'light', 'dark', or 'auto'
   */
  setTheme(theme: Theme): void {
    this.theme.set(theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
  }

  /**
   * Toggle between light and dark modes
   * If currently in auto mode, switches to the opposite of the system preference
   */
  toggleTheme(): void {
    const current = this.theme();

    if (current === 'auto') {
      // If auto, switch to opposite of system preference
      const systemPrefersDark = this.mediaQuery.matches;
      this.setTheme(systemPrefersDark ? 'light' : 'dark');
    } else {
      // Toggle between light and dark
      this.setTheme(current === 'light' ? 'dark' : 'light');
    }
  }

  /**
   * Check if dark theme is currently active
   */
  isDarkMode(): boolean {
    return this.activeTheme() === 'dark';
  }

  /**
   * Get initial theme from localStorage or default to 'auto'
   */
  private getInitialTheme(): Theme {
    const stored = localStorage.getItem(this.STORAGE_KEY) as Theme;
    return stored && this.isValidTheme(stored) ? stored : 'auto';
  }

  /**
   * Apply the theme to the document
   */
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;

    if (theme === 'auto') {
      const prefersDark = this.mediaQuery.matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }

  /**
   * Get the actual active theme (resolving 'auto' to 'light' or 'dark')
   */
  private getActiveTheme(): 'light' | 'dark' {
    const theme = this.theme();

    if (theme === 'auto') {
      return this.mediaQuery.matches ? 'dark' : 'light';
    }

    return theme;
  }

  /**
   * Setup listener for system color scheme changes
   */
  private setupMediaQueryListener(): void {
    this.mediaQuery.addEventListener('change', (e) => {
      if (this.theme() === 'auto') {
        this.applyTheme('auto');
        this.activeTheme.set(e.matches ? 'dark' : 'light');
      }
    });
  }

  /**
   * Type guard for Theme
   */
  private isValidTheme(value: string): value is Theme {
    return ['light', 'dark', 'auto'].includes(value);
  }
}
