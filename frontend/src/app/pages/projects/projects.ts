import { Component, inject, OnInit } from '@angular/core';

import { ProjectCardComponent } from '../../components/project-card/project-card';
import { ProjectsService } from '../../services/projects.service';

@Component({
  selector: 'app-projects',
  imports: [ProjectCardComponent],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects implements OnInit {
  protected readonly projectsService = inject(ProjectsService);

  ngOnInit(): void {
    // Load projects when component initializes
    this.projectsService.loadProjects();
  }
}
