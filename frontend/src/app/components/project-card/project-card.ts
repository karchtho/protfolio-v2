import { Component, input } from '@angular/core';

import { Project } from '../../models/project.model';

/**
 * ProjectCard Component
 *
 * Displays a single project as a card
 */
@Component({
  selector: 'app-project-card',
  imports: [],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss'
})
export class ProjectCardComponent {
  /**
   * Project data as required input signal
   */
  project = input.required<Project>();
}
