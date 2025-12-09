import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-skill-badge',
  imports: [],
  template: `
  <code >{{label()}}</code>
  `,
  // Style managed through the <code> element in style.scss
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillBadge {
  label = input.required<string>();
}
