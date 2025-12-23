import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

import { catchError, Observable, tap, throwError } from 'rxjs';

import { AuthResponse, LoginRequest, UserSafe } from '../models/auth.models';

import { ConfigService } from './config.service';

/**
 * AuthService - JWT Authentication with Signal-based state
 *
 * Features:
 * - Login/logout functionality
 * - Token storage in localStorage
 * - Reactive auth state via signals
 * - Automatic token retrieval for HTTP interceptor
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly config = inject(ConfigService);

  // Storage keys
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  // Signal based reactive state
  private readonly tokenSignal = signal<string | null>(this.getStoredToken());
  private readonly userSignal = signal<UserSafe | null>(this.getStoredUser());

  // Public computed signals (read-only)
  readonly isAuthenticated = computed(() => this.tokenSignal() !== null);
  readonly currentUser = computed(() => this.userSignal());

  /**
   * Login user with username/password
   * Stores token + user data on success
   */
  login(username: string, password: string): Observable<AuthResponse> {
    const apiUrl = this.config.apiUrl;
    const body: LoginRequest = { username, password };

    return this.http.post<AuthResponse>(`${apiUrl}/api/auth/login`, body).pipe(
      tap((response) => {
        // Store token and user in localStorage
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));

        // Ipdate signals (triggers reactivity)
        this.tokenSignal.set(response.token);
        this.userSignal.set(response.user);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Logout user
   * Clears token + user data, redirects to login
   */
  logout(): void {
    // Clear localStorage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    // Clear signals
    this.tokenSignal.set(null);
    this.userSignal.set(null);

    // Redirect to login
    this.router.navigate(['/login']);
  }

  /**
   * Get current JWT (for HTTP interceptor)
   */
  getToken(): string | null {
    return this.tokenSignal();
  }

  /**
   * Retrieve stored token from localStorage
   */
  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null; // SSR safety
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Retrieve stored user form localStorage
   */
  private getStoredUser(): UserSafe | null {
    if (typeof window === 'undefined') return null; // SSR safety
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson) as UserSafe;
    } catch {
      return null;
    }
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    if (error.status === 401) {
      this.logout();
    }

    return throwError(() => error);
  };
}
