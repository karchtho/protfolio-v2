import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy,Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute,Router } from '@angular/router';

import { Button } from '../../components/button/button';
import { FormField } from '../../components/form-field/form-field';
import { AuthService } from '../../services/auth.service';

/**
 * Login Page Component
 *
 * Features:
 * - Reactive form with validation (username + password)
 * - Form-level error display (API errors)
 * - Loading state during authentication
 * - Redirect to returnUrl after successful login
 * - Accessible form with ARIA and focus management
 *
 * Security:
 * - Password field uses autocomplete="current-password"
 * - Form submission triggers AuthService JWT authentication
 * - Failed attempts display user-friendly error messages
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormField, Button, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Reactive form
  protected readonly loginForm = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  // COmponent state (signals)
  protected readonly isLoading = signal(false);
  protected readonly apiError = signal<string | null>(null);

  /**
   * Handle form submission
   */
  protected onSubmit(): void {
    // console.log('🔵 onSubmit() called');

    // 1. Avant markAllAsTouched
    // console.log('Before markAllAsTouched:', {
    //   usernameTouched: this.loginForm.controls.username.touched,
    //   passwordTouched: this.loginForm.controls.password.touched,
    //   usernameInvalid: this.loginForm.controls.username.invalid,
    //   passwordInvalid: this.loginForm.controls.password.invalid,
    // });

    this.loginForm.markAllAsTouched();

    // 2. Après markAllAsTouched
    console.log('After markAllAsTouched:', {
      usernameTouched: this.loginForm.controls.username.touched,
      passwordTouched: this.loginForm.controls.password.touched,
      usernameInvalid: this.loginForm.controls.username.invalid,
      passwordInvalid: this.loginForm.controls.password.invalid,
    });

    this.apiError.set(null);
    if (this.loginForm.invalid) {
      return;
    }

    const { username, password } = this.loginForm.getRawValue();

    // Set loading state
    this.isLoading.set(true);

    this.authService.login(username, password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin';
        this.router.navigate([returnUrl]);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.apiError.set(this.getErrorMessage(error));
      },
    });
  }

  /**
   * Convert HTTP error to user friendly message
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'Invalid username or password. Please try again.';
    }

    if (error.status === 0) {
      return 'Unable to connect to server. Please check your internet connection';
    }

    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }

    return 'An unexpeted error occured. Please try again';
  }
}
