import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { Project } from '../../models/project.model';
import { ConfigService} from '../../services/config.service';
import { Button } from '../button/button';

/**
 * ProjectCard Component
 *
 * Displays a single project as a card
 */
@Component({
  selector: 'app-project-card',
  imports: [Button],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCard{
  private configService = inject(ConfigService);

  /**
   * Project data as required input signal
   */
  project = input.required<Project>();

  /**
   * Constructs full image URL from relative path
   */

  getImageUrl(path: string): string {
    return `${this.configService.apiUrl}/${path}`;
  }
}
