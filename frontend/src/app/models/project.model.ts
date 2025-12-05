  /**
 * Project model matching the backend API structure
 */
  export interface Project {
    id: number;
    name: string;
    description: string;
    tags: string[];
    thumbnail?: string; // 👈 AJOUTER
    images?: string[];
    url?: string;
    github_url?: string;
    image_url?: string;
    status: 'active' | 'archived';
    is_featured: boolean;
    created_at: string;
    updated_at: string;
  }

  /**
   * DTO for creating a new project
   */
  export interface CreateProjectDto {
    name: string;
    description: string;
    tags: string[];
    url?: string;
    github_url?: string;
    image_url?: string;
    status?: 'active' | 'archived';
    is_featured?: boolean;
  }

  /**
   * DTO for updating a project
   */
  export interface UpdateProjectDto {
    name?: string;
    description?: string;
    tags?: string[];
    url?: string;
    github_url?: string;
    image_url?: string;
    status?: 'active' | 'archived';
    is_featured?: boolean;
  }
