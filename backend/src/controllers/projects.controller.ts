import { Request, Response } from 'express';

import { CreateProjectInput } from '../models/project.model';
import { ProjectsService } from '../services/projects.service';

export class ProjectsController {
  private service: ProjectsService;

  constructor() {
    this.service = new ProjectsService();
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const projects = await this.service.getAllProjects();
      res.json({
        succes: true,
        data: projects,
        message: 'Projects retrieved successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve projects';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const project = await this.service.getProjectById(id);

      if (!project) {
        res.status(404)?.json({
          success: false,
          error: 'Project not found',
        });
        return;
      }

      res.json({
        success: true,
        data: project,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid request';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const input: CreateProjectInput = req.body;
      const project = await this.service.createProject(input);

      res.status(201).json({
        success: true,
        data: project,
        message: 'Project created successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create project';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
        const id = parseInt(req.params.id, 10);
        const input = req.body;
        const project = await this.service.updateProject(id, input);

        res.json({
            succes: true,
            data: project,
            message: 'Project updated successfully',
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update project';
        res.status(400).json({
            success: false,
            error: message,
        });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
        const id = parseInt(req.params.id, 10);
        await this.service.deleteProject(id);

        res.json({
            succes:true,
            message: 'Project deleted successfully',
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Faield to delete project';
        res.status(400).json({
            success: false,
            error: message,
        })
    }
  }
}
