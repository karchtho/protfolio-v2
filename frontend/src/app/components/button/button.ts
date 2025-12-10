import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [RouterLink],
  host: {
    class: 'button',
  },
  template: `
    @if (routerLink()) {
      <a [routerLink]="routerLink()" [class]="buttonClass()">{{ label() }}</a>
    } @else if (href() !== undefined) {
      <a
        [href]="isLinkAvailable() ? href() : undefined"
        [class]="buttonClass()"
        [attr.target]="externalTarget()"
        [attr.rel]="externalRel()"
      >{{ label() }}</a>
    } @else {
      <button [class]="buttonClass()" [type]="type()">{{ label() }}</button>
    }
  `,
  styleUrls: ['./button.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  label = input.required<string>();
  variant = input<'primary' | 'secondary' | 'ghost'>('primary');
  size = input<'small' | 'medium' | 'large'>('medium');
  type = input<'button' | 'submit' | 'reset'>('button');
  routerLink = input<string | undefined>(undefined);
  href = input<string | undefined>(undefined);
  external = input<boolean>(false);

  // Check if link href is available (not empty/whitespace)
  isLinkAvailable = computed(() => {
    const href = this.href();
    return !!href && href.trim() !== '';
  });

  // Build button classes: base + variant + size + disabled state
  buttonClass = computed(() => {
    const baseClasses = `button button--${this.variant()} button--${this.size()}`;

    // Add disabled modifier if href exists but is empty
    if (this.href() !== undefined && !this.isLinkAvailable()) {
      return `${baseClasses} button--disabled`;
    }

    return baseClasses;
  });

  // External link target
  externalTarget = computed(() => (this.external() ? '_blank' : undefined));

  // External link rel attribute (security)
  externalRel = computed(() => (this.external() ? 'noopener noreferrer' : undefined));
}
