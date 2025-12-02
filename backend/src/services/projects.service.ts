import { CreateProjectInput, Project, UpdateProjectInput } from '../models/project.model';
import { ProjectsRepository } from '../repositories/projects.repository';

export class ProjectsService {
    private repository: ProjectsRepository;

    constructor()  {
        this.repository = new ProjectsRepository()
    }

    async getAllProjects(): Promise<Project[]> {
        return this.repository.findAll();
    }

    async getProjectById(id:number): Promise<Project | null> {
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error('Invalid project ID');
        }

        return this.repository.findById(id);
    }

    async createProject(input: CreateProjectInput): Promise<Project> {
        // Validation
        if(!input.name || input.name.trim().length === 0) {
            throw new Error("Project name is required");
        }

        if (!input.description || input.description.trim().length === 0) {
            throw new Error("Project description required");
        }

        return this.repository.create(input);
    }

    async updateProject(id: number, input: UpdateProjectInput): Promise<Project | null> {
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("Invalid project ID");
        }

        // Check if project exists
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new Error("Project not found");
        }

        return this.repository.update(id, input);
    }

    async deleteProject(id: number): Promise<boolean> {
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("Invalid project ID");
        }

        const deleted = await this.repository.delete(id);
        if (!deleted) {
            throw new Error("Project not found");
        }
        return deleted
    }
}