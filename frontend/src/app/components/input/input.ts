import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

/**
 * Input - Atomic Component
 *
 * Styled text input with type variants and accessibility support
 * Integrates with Reactive Forms via FormField wrapper
 *
 * Features:
 * - Type variants (text, email, password)
 * - Error state styling
 * - Accessibility (ARIA attributes)
 * - Theme-aware colors
 * - Focus ring (WCAG AA)
 *
 * Usage:
 * ```html
 * <app-input
 *   type="email"
 *   [value]="emailValue()"
 *   placeholder="Enter your email"
 *   [ariaInvalid]="hasError()"
 *   [ariaDescribedBy]="'email-error'"
 *   (valueChange)="onEmailChange($event)"
 *   (inputBlur)="onEmailBlur()"
 * />
 * ```
 */
@Component({
  selector: 'app-input',
  standalone: true,
  imports: [],
  template: `
    <input
      [id]="id()"
      [type]="type()"
      [value]="value()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [required]="required()"
      [autocomplete]="autocomplete()"
      [attr.aria-invalid]="ariaInvalid() || null"
      [attr.aria-describedby]="ariaDescribedBy()"
      [class]="inputClasses()"
      (input)="onInput($event)"
      (blur)="onBlur()"
      (focus)="onFocus()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'input-wrapper'
  },
  styleUrl: './input.scss',
})
export class Input {
  // Input signals
  id = input<string>(''); // ✅ AJOUTÉ
  type = input<'text' | 'email' | 'password'>('text');
  value = input<string>('');
  placeholder = input<string>('');
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  autocomplete  = input<string>('');

  // accessibility inputs
  ariaInvalid = input<boolean>(false);
  ariaDescribedBy = input<string>('');

  // Outputs (events)
  valueChange = output<string>();
  inputBlur = output();

  // Internal state (for focus styling)
  private isFocused = signal(false);

  // Computed CSS classes
  protected inputClasses = computed(() => {
    const classes = ['input'];

    if (this.ariaInvalid()) {
      classes.push('input--error');
    }

    if (this.disabled()) {
      classes.push('input--disabled')
    }

    if (this.isFocused()) {
      classes.push('input--focused')
    }

    return classes.join(' ');
  });

  /**
   * Handle input event (user typing)
   */
  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }

  /**
   * Handle blur event (input loses focus)
   */
  protected onBlur(): void {
    this.isFocused.set(false);
    this.inputBlur.emit();
  }

  /**
   * Handle focus event
   */
  protected onFocus(): void {
    this.isFocused.set(true);
  }
}
