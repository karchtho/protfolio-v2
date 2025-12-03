import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'projects',
    pathMatch: 'full'
  },
  {
  path: 'projects',
  loadComponent: () => import('./pages/projects/projects').then (m=> m.Projects)
  }
];
