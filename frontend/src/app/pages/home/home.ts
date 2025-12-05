import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Button } from '../../components/button/button';
import { ProjectCard } from '../../components/project-card/project-card';
import { SkeletonCard } from "../../components/skeleton-card/skeleton-card";
import { SkillBadge } from '../../components/skill-badge/skill-badge';
import { ProjectsService } from '../../services/projects.service';

@Component({
  selector: 'app-home',
  imports: [NgOptimizedImage, Button, RouterLink, ProjectCard, SkeletonCard, SkillBadge],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'home-page',
  },
})

export class Home implements OnInit {
  readonly projectsService = inject(ProjectsService);

  ngOnInit(): void {
    this.projectsService.loadFeaturedProjects();
  }
}
