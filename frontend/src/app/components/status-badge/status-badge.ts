import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { PROJECT_STATUS_LABELS,ProjectStatus } from '../../models/project.model';

/**
 * StatusBadge Component - Atomic Component
 *
 * Displays project status as a colored badge using design tokens
 *
 * Features:
 * - 5 status variants mapped to --status-* design tokens
 * - Compact, pill-shaped design
 * - Theme-aware colors (automatic light/dark mode)
 *
 * Usage:
 * ```html
 * <app-status-badge [status]="project().status" />
 * ```
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span [class]="badgeClasses()">
      {{ statusLabel() }}
    </span>
  `,
  styleUrl: './status-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'status-badge-wrapper',
  },
})
export class StatusBadge {
  // Required input: project status
  status = input.required<ProjectStatus>();

  // Computed: Human-readable label
  protected statusLabel = computed(() => PROJECT_STATUS_LABELS[this.status()]);

  // Computed: CSS classes based on status
  protected badgeClasses = computed(() => {
    const statusKey = this.status().replace('_', '-'); // in_development → in-development
    return `status-badge status-badge--${statusKey}`;
  });
}
