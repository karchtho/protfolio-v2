import { Router } from 'express';

import { ProjectsController } from '../controllers/projects.controller';

const router = Router();
const controller = new ProjectsController();

// GET /api/projects - Get all projects
router.get('/', (req, res) => controller.getAll(req, res));

// GET /api/projects/featured - Get featured projects
router.get('/featured', (req, res) => controller.getFeatured(req, res));

// GET /api/projects/:id - Get a single project
router.get('/:id', (req, res) => controller.getById(req, res));

// POST /api/projects - Create a new project
router.post('/', (req, res) => controller.create(req, res));

// PUT /api/projects/:id - Update a project
router.put('/:id', (req, res) => controller.update(req, res));

// Delete /api/projects/:id - Delete a project
router.delete('/:id', (req, res) => controller.delete(req, res));



export default router;