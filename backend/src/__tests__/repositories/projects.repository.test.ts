import { beforeEach, describe, expect, it, vi } from 'vitest';

import { pool } from '../../config/database';
import { CreateProjectInput, ProjectStatus, UpdateProjectInput } from '../../models/project.model';
import { ProjectsRepository } from '../../repositories/projects.repository';

/**
 * Mock interface for database rows
 * Matches MySQL column types (JSON as string, TINYINT as number)
 */
interface MockProjectRow {
  id: number;
  name: string;
  short_description: string;
  long_description: string;
  url: string | null;
  github_url: string | null;
  case_study_url: string | null;
  thumbnail: string | null;
  images: string | null; // JSON string from MySQL
  tags: string; // JSON string from MySQL
  status: string;
  is_featured: number; // TINYINT(1) from MySQL
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

// Mock the database pool

vi.mock('../../config/database', () => ({
  pool: {
    query: vi.fn(),
    execute: vi.fn(),
    getConnection: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
}));
describe('ProjectRepository', () => {
  let repository: ProjectsRepository;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockQuery = pool.query as any;

  beforeEach(() => {
    repository = new ProjectsRepository();
    vi.clearAllMocks(); // Reset les mocks avant chaque test
  });

  /**
   * Helper to create mock database rows
   * Returns data in MySQL format (JSON as string, boolean as TINYINT)
   */
  const createMockRow = (overrides: Partial<MockProjectRow> = {}): MockProjectRow => {
    const baseRow: MockProjectRow = {
      id: 1,
      name: 'Test Project',
      short_description: 'A short description for testing',
      long_description: 'A much longer description with more details.',
      url: 'https://example.com',
      github_url: 'https://github.com/test/repo',
      case_study_url: null,
      thumbnail: 'uploads/projects/test.webp',
      images: JSON.stringify(['uploads/projects/img1.webp']),
      tags: JSON.stringify(['TypeScript', 'Node.js']),
      status: 'completed',
      is_featured: 1,
      display_order: 0,
      created_at: new Date('2025-01-01'),
      updated_at: new Date('2025-01-02'),
    };
    return { ...baseRow, ...overrides };
  };

  // ==========================================================================
  // findAll() Tests
  // ==========================================================================
  describe('findAll', () => {
    it('should return all projects ordered correctly', async () => {
      // 1. Arrange: Préparer
      const mockRows = [
        createMockRow({ id: 1, name: 'Project A' }),
        createMockRow({ id: 2, name: 'Project B' }),
      ];

      // 2. Mock la réponse DB
      mockQuery.mockResolvedValueOnce([mockRows, []]);

      // 3. Act: Exécuter la méthode
      const result = await repository.findAll();

      // 4. Assert: Vérifier les résultats
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM projects ORDER BY display_order ASC, created_at DESC',
      );
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Project A');
    });

    it('should correctly parse JSON fields (images, tags)', async () => {
      const mockRow = createMockRow({
        images: JSON.stringify(['img1.webp', 'img2.webp']),
        tags: JSON.stringify(['React', 'TypeScript']),
      });

      mockQuery.mockResolvedValueOnce([[mockRow], []]);

      const result = await repository.findAll();

      expect(result[0].images).toEqual(['img1.webp', 'img2.webp']);
      expect(result[0].tags).toEqual(['React', 'TypeScript']);
    });

    it('should convert MySQL TINYINT(1) to boolean for is_featured', async () => {
      const mockRows = [
        createMockRow({ id: 1, is_featured: 1 }),
        createMockRow({ id: 2, is_featured: 0 }),
      ];

      mockQuery.mockResolvedValueOnce([mockRows, []]);

      const result = await repository.findAll();

      expect(result[0].is_featured).toBe(true);
      expect(result[1].is_featured).toBe(false);
    });
  });

  // ==========================================================================
  // findById() Tests
  // ==========================================================================

  describe('findById', () => {
    it('should return a project when found', async () => {
      const mockRow = createMockRow({ id: 42, name: 'Found Project' });
      mockQuery.mockResolvedValueOnce([[mockRow], []]);

      const result = await repository.findById(42);

      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM projects WHERE id = ?', [42]);
      expect(result).not.toBeNull();
      expect(result?.id).toBe(42);
      expect(result?.name).toBe('Found Project');
    });

    it('should return null when project not found', async () => {
      mockQuery.mockResolvedValueOnce([[], []]); // ← Pas de rows

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  // ==========================================================================
  // findFeatured() Tests
  // ==========================================================================

  describe('findFeatured', () => {
    it('should filter by is_featured and status', async () => {
      const mockRows = [
        createMockRow({ id: 1, is_featured: 1, status: 'completed' }),
        createMockRow({ id: 2, is_featured: 1, status: 'actively_maintained' }),
      ];

      mockQuery.mockResolvedValueOnce([mockRows, []]);

      const result = await repository.findFeatured();

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM projects WHERE is_featured = TRUE AND status IN (?, ?) ORDER BY display_order ASC, created_at DESC',
        ['completed', 'actively_maintained'],
      );
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no featured projects exist', async () => {
      mockQuery.mockResolvedValueOnce([[], []]);

      const result = await repository.findFeatured();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a project with required fields only', async () => {
      const input: CreateProjectInput = {
        name: 'New Project',
        short_description: 'A short description for the new project',
        long_description: 'A comprehensive description explaining the project.',
        tags: ['Angular', 'TypeScript'],
      };

      // Mock 1: INSERT retourne l'ID du nouveau projet
      const mockResultSet = {
        insertId: 10,
        affectedRows: 1,
      };

      // Mock 2: SELECT récupère le projet créé
      const mockCreatedRow = createMockRow({
        id: 10,
        name: input.name,
        short_description: input.short_description,
        long_description: input.long_description,
        tags: JSON.stringify(input.tags),
      });

      mockQuery
        .mockResolvedValueOnce([mockResultSet, []]) // INSERT
        .mockResolvedValueOnce([[mockCreatedRow], []]); // SELECT

      const result = await repository.create(input);

      expect(mockQuery).toHaveBeenCalledTimes(2); // INSERT + SELECT
      expect(result.id).toBe(10);
      expect(result.name).toBe('New Project');
      expect(result.tags).toEqual(['Angular', 'TypeScript']);
    });

    it('should create a project with all optional fields', async () => {
      const input: CreateProjectInput = {
        name: 'Full Project',
        short_description: 'Short desc',
        long_description: 'Long description here',
        tags: ['React'],
        url: 'https://project.com',
        github_url: 'https://github.com/user/repo',
        case_study_url: 'https://blog.com/case-study',
        thumbnail: 'uploads/projects/thumb.webp',
        images: ['uploads/projects/img1.webp'],
        status: ProjectStatus.ACTIVELY_MAINTAINED,
        is_featured: true,
        display_order: 5,
      };

      const mockResultSet = { insertId: 20, affectedRows: 1 };
      const mockCreatedRow = createMockRow({ id: 20 });

      mockQuery
        .mockResolvedValueOnce([mockResultSet, []])
        .mockResolvedValueOnce([[mockCreatedRow], []]);

      const result = await repository.create(input);

      expect(result.id).toBe(20);
    });

    it('should stringify tags and images as JSON', async () => {
      const input: CreateProjectInput = {
        name: 'JSON Test',
        short_description: 'Testing JSON fields',
        long_description: 'Testing JSON serialization',
        tags: ['Tag1', 'Tag2', 'Tag3'],
        images: ['img1.webp', 'img2.webp'],
      };

      const mockResultSet = { insertId: 30, affectedRows: 1 };
      const mockCreatedRow = createMockRow({ id: 30 });

      mockQuery
        .mockResolvedValueOnce([mockResultSet, []])
        .mockResolvedValueOnce([[mockCreatedRow], []]);

      await repository.create(input);

      // Récupérer les paramètres passés au premier appel (INSERT)
      const insertCall = mockQuery.mock.calls[0];
      const params = insertCall[1] as unknown[];

      // Vérifier que tags et images sont stringifiés
      expect(params[8]).toBe(JSON.stringify(['Tag1', 'Tag2', 'Tag3'])); // tags (index 8)
      expect(params[7]).toBe(JSON.stringify(['img1.webp', 'img2.webp'])); // images (index 7)
    });
  });

  describe('update', () => {
    it('should update a single field', async () => {
      const input: UpdateProjectInput = {
        name: 'Updated Name',
      };

      const mockResultSet = { affectedRows: 1 };
      const mockUpdatedRow = createMockRow({ id: 1, name: 'Updated Name' });

      mockQuery
        .mockResolvedValueOnce([mockResultSet, []]) // UPDATE
        .mockResolvedValueOnce([[mockUpdatedRow], []]); // SELECT

      const result = await repository.update(1, input);

      expect(mockQuery).toHaveBeenCalledWith('UPDATE projects SET name = ? WHERE id = ?', [
        'Updated Name',
        1,
      ]);
      expect(result?.name).toBe('Updated Name');
    });

    it('should update multiple fields', async () => {
      const input: UpdateProjectInput = {
        name: 'New Name',
        short_description: 'New short description',
        status: ProjectStatus.COMPLETED,
      };

      const mockResultSet = { affectedRows: 1 };
      const mockUpdatedRow = createMockRow({
        id: 2,
        name: 'New Name',
        short_description: 'New short description',
        status: 'completed',
      });

      mockQuery
        .mockResolvedValueOnce([mockResultSet, []])
        .mockResolvedValueOnce([[mockUpdatedRow], []]);

      const result = await repository.update(2, input);

      // Vérifier que la requête contient les 3 champs
      const updateCall = mockQuery.mock.calls[0];
      const updateQuery = updateCall[0] as string;

      expect(updateQuery).toContain('name = ?');
      expect(updateQuery).toContain('short_description = ?');
      expect(updateQuery).toContain('status = ?');
      expect(result?.status).toBe(ProjectStatus.COMPLETED);
    });

    it('should handle empty update (no fields changed)', async () => {
      const input: UpdateProjectInput = {};

      const mockExistingRow = createMockRow({ id: 3 });

      // Seulement findById, PAS d'UPDATE
      mockQuery.mockResolvedValueOnce([[mockExistingRow], []]);

      const result = await repository.update(3, input);

      expect(mockQuery).toHaveBeenCalledTimes(1); // Seulement SELECT
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM projects WHERE id = ?', [3]);
      expect(result?.id).toBe(3);
    });
    // Ajoute ces 2 tests dans describe('update')
    it('should convert empty strings to null for URL fields', async () => {
      const input: UpdateProjectInput = {
        url: '',
        github_url: '',
      };

      const mockResultSet = { affectedRows: 1 };
      const mockUpdatedRow = createMockRow({ id: 4, url: null, github_url: null });

      mockQuery
        .mockResolvedValueOnce([mockResultSet, []])
        .mockResolvedValueOnce([[mockUpdatedRow], []]);

      await repository.update(4, input);

      const updateCall = mockQuery.mock.calls[0];
      const params = updateCall[1] as unknown[];

      expect(params[0]).toBeNull(); // url
      expect(params[1]).toBeNull(); // github_url
    });
  });

  // ==========================================================================
  // delete() Tests
  // ==========================================================================

  describe('delete', () => {
    it('should delete a project and return true', async () => {
      const mockResultSet = { affectedRows: 1 };
      mockQuery.mockResolvedValueOnce([mockResultSet, []]);

      const result = await repository.delete(1);

      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM projects WHERE id = ?', [1]);
      expect(result).toBe(true);
    });

    it('should return false if project does not exist', async () => {
      const mockResultSet = { affectedRows: 0 }; // Aucune ligne supprimée
      mockQuery.mockResolvedValueOnce([mockResultSet, []]);

      const result = await repository.delete(999);

      expect(result).toBe(false);
    });
  });
});
