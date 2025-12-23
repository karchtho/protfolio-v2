import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { ErrorMessage } from '../error-message/error-message';
/**
 * FormField - Composite Component
 *
 * Combines Label + Input + ErrorMessage with accessibility and validation
 * Integrates with Angular Reactive Forms
 *
 * Features:
 * - Automatic label/input association (for/id)
 * - Error message association (aria-describedby)
 * - Validation error display with human-readable messages
 * - Required field indicator (*)
 * - Theme-aware styling
 *
 * Usage:
 * ```typescript
 * loginForm = new FormGroup({
 *   username: new FormControl('', [Validators.required, Validators.minLength(3)])
 * });
 * ```
 *
 * ```html
 * <app-form-field
 *   id="username"
 *   label="Username"
 *   type="text"
 *   [control]="loginForm.controls.username"
 *   placeholder="Enter your username"
 *   autocomplete="username"
 *   [required]="true"
 * />
 * ```
 */
@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [ReactiveFormsModule, ErrorMessage],
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'form-field-wrapper',
  },
})
export class FormField {
  // Required inputs
  id = input.required<string>();
  label = input.required<string>();
  type = input<'text' | 'email' | 'password'>('text');
  control = input.required<FormControl<string>>();

  // Optional inputs
  placeholder = input<string>('');
  autocomplete = input<string>('');
  required = input<boolean>(false);

  // Computed Error ID for aria-describedBy
  protected errorId = computed(() => `${this.id()}-error`);

  // Computed: Should we throw the error ?
  protected showError(): boolean {
    const ctrl = this.control();
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  // Computed: Error message text
  protected getErrorMessage(): string{
    const ctrl = this.control();
    if (!ctrl.errors) {
      return '';
    }

    // Priority order: required → minLength → maxLength → email → pattern
    if (ctrl.errors['required']) {
      return `${this.label()} is required`;
    }

    if (ctrl.errors['minlength']) {
      const minLength = ctrl.errors['minlength'].requiredLength;
      return `${this.label()} must be at least ${minLength} characters`;
    }

    if (ctrl.errors['maxlength']) {
      const maxLength = ctrl.errors['maxlength'].requiredLength;
      return `${this.label()} must be no more than ${maxLength} characters`;
    }

    if (ctrl.errors['email']) {
      return 'Please enter a valid email address';
    }

    if (ctrl.errors['pattern']) {
      return `${this.label()} format is invalid`;
    }

    // Generic fallback
    return `${this.label()} is invalid`;
  }

}
