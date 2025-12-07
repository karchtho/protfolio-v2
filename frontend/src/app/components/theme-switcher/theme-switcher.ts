import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  imports: [],
  templateUrl: './theme-switcher.html',
  styleUrl: './theme-switcher.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcher {
  private themeService = inject(ThemeService);

  // Input for unique ID (to avoid duplicate IDs when rendered multiple times)
  toggleId = input<string>('theme-toggle');

  // Computed signal for dark mode state
  isDark = computed(() => this.themeService.isDarkMode());

  // Toggle theme
  onThemeToggle(): void {
    this.themeService.toggleTheme();
  }
}
