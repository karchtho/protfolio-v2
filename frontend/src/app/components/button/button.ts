import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy,Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (routerLink()) {
    <a [routerLink]="routerLink()" [class]="buttonClass()">{{ label() }}</a>
    } @else if (href()) {
    <a [href]="href()" [class]="buttonClass()" [attr.target]="externalTarget()" [attr.rel]="externalRel()">{{
      label()
    }}</a>
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
  size = input<'sm' | 'md' | 'lg'>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  routerLink = input<string | undefined>(undefined);
  href = input<string | undefined>(undefined);
  external = input<boolean>(false);

  // Computed properties to keep template clean
  buttonClass = computed(() => `btn ${this.variant()} size-${this.size()}`);
  externalTarget = computed(() => (this.external() ? '_blank' : undefined));
  externalRel = computed(() => (this.external() ? 'noopener noreferrer' : undefined));
}
