import { Router } from 'express';

import { ProjectsController } from '../controllers/projects.controller';
import { authGuard } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createProjectSchema, updateProjectSchema } from '../validation/project.validation';

const router = Router();
const controller = new ProjectsController();

// GET /api/projects - Get all projects (with optional filters)
router.get('/', (req, res) => controller.getAll(req, res));

// GET /api/projects/featured - Get featured projects
router.get('/featured', (req, res) => controller.getFeatured(req, res));

// GET /api/projects/:id - Get a single project
router.get('/:id', (req, res) => controller.getById(req, res));

// POST /api/projects - Create a new project (with validation)
router.post('/', authGuard, validateRequest(createProjectSchema), (req, res) =>
  controller.create(req, res),
);

// PATCH /api/projects/:id - Update a project (partial update with validation)
router.patch('/:id', authGuard, validateRequest(updateProjectSchema), (req, res) =>
  controller.update(req, res),
);

// DELETE /api/projects/:id - Delete a project
router.delete('/:id', authGuard, (req, res) => controller.delete(req, res));

export default router;
