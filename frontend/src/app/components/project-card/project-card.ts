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
  template: `
    <article class="project-card">
      @if (project().image_url) {
        <div class="project-card__image">
          <img [src]="project().image_url" [alt]="project().title" />
        </div>
      }

      <div class="project-card__content">
        <h3 class="project-card__title">{{ project().title }}</h3>
        <p class="project-card__description">{{ project().description }}</p>

        <div class="project-card__technologies">
          @for (tech of project().technologies; track tech) {
            <span class="tech-badge">{{ tech }}</span>
          }
        </div>

        <div class="project-card__links">
          @if (project().github_url) {
            <a
              [href]="project().github_url"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn--secondary"
            >
              GitHub
            </a>
          }

          @if (project().demo_url) {
            <a
              [href]="project().demo_url"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn--primary"
            >
              Live Demo
            </a>
          }
        </div>
      </div>
    </article>
  `,
  styleUrl: './project-card.scss'
})
export class ProjectCardComponent {
  /**
   * Project data as required input signal
   */
  project = input.required<Project>();
}
