import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';

import { ProjectCard } from '../../components/project-card/project-card';
import { ProjectsService } from '../../services/projects.service';

@Component({
  selector: 'app-projects',
  imports: [ProjectCard],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Projects implements OnInit {
  protected readonly projectsService = inject(ProjectsService);

  ngOnInit(): void {
    // Load projects when component initializes
    this.projectsService.loadProjects();
  }
}
