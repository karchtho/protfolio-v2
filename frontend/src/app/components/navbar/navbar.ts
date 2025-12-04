import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  // Inject theme service
  private themeService = inject(ThemeService);

  // Computed signal
  isDark = computed(() => this.themeService.isDarkMode());

  // Navigation items
  navItems = [
    {label: 'Home', path: '/home'},
    {label: 'Projects', path: '/projects'},
    {label: 'About', path: '/about'}
  ]

  // Toggle theme when slider is clicked
  onThemeToggle(): void {
    this.themeService.toggleTheme();
  }
}
