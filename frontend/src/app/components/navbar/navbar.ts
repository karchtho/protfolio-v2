import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Logo } from "../logo/logo";
import { ThemeSwitcher } from '../theme-switcher/theme-switcher';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, Logo, ThemeSwitcher],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  // Mobile menu state
  isMobileMenuOpen = signal(false);

  // Navigation items
  navItems = [
    {label: 'Home', path: '/'},
    {label: 'Projects', path: '/projects'},
    {label: 'About', path: '/about'}
  ]

  toggleMobileMenu(): void  {
    this.isMobileMenuOpen.update(value => !value);
    if (this.isMobileMenuOpen()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
    document.body.style.overflow = '';
  }
}
