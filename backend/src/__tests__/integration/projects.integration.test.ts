/* eslint-disable simple-import-sort/imports */
/* eslint-disable import/first */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ⚠️ Mocks AVANT les imports (ordre crucial)
vi.mock('../../config/database', () => ({
  pool: {
    query: vi.fn(),
  },
  testConnection: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../repositories/projects.repository');

// Imports APRÈS les mocks
import express, { Application } from 'express';
import request from 'supertest';
import { ProjectStatus } from '../../models/project.model';
import { ProjectsRepository } from '../../repositories/projects.repository';
import projectRouter from '../../routes/projects.routes';

describe('Projects API Integration', () => {
  let app: Application;

  beforeEach(() => {
    // Créer une app Express de test
    app = express();
    app.use(express.json());
    app.use('/api/projects', projectRouter);

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('GET /api/projects should return all projects', async () => {
    const mockProjects = [
      {
        id: 1,
        name: 'Test Project',
        short_description: 'Short desc',
        long_description: 'Long desc',
        tags: ['TypeScript'],
        status: ProjectStatus.COMPLETED,
        is_featured: false,
        display_order: 0,
        created_at: new Date('2025-01-01'),
        updated_at: new Date('2025-01-02'),
      },
    ];

    // Mock le repository avec spyOn
    vi.spyOn(ProjectsRepository.prototype, 'findAll').mockResolvedValue(mockProjects);

    const response = await request(app).get('/api/projects');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Projects retrieved successfully');
    expect(response.body.data).toEqual([
      {
        id: 1,
        name: 'Test Project',
        short_description: 'Short desc',
        long_description: 'Long desc',
        tags: ['TypeScript'],
        status: ProjectStatus.COMPLETED,
        is_featured: false,
        display_order: 0,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-02T00:00:00.000Z',
      },
    ]);
  });
});
