export interface Project {
  // Primary key
  id: number;

  // Core content

  name: string;
  short_description: string;
  long_description: string;

  // Externeal links
  url?: string;
  github_url?: string;
  case_study_url?: string;

  // Images
  thumbnail?: string;
  images?: string[];

  // Technologies
  tags: string[];

  // Status & visibility
  status: ProjectStatus;
  is_featured: boolean;
  display_order: number;

  // Timestamps
  created_at: Date;
  updated_at: Date;
}

/**
 * Project lifecycle status enum
 * Matches MySQL ENUM definition
 */
export enum ProjectStatus {
  IN_DEVELOPMENT = 'in_development',
  COMPLETED = 'completed',
  ACTIVELY_MAINTAINED = 'actively_maintained',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived',
}

/**
 * DTO for creating a new project
 * All optional fields have sensible defaults
 */
export interface CreateProjectInput {
  // Required fields
  name: string;
  short_description: string;
  long_description: string;

  // Technologies
  tags: string[];

  // Optional fields
  url?: string;
  github_url?: string;
  case_study_url?: string;
  thumbnail?: string;
  images?: string[];
  status?: ProjectStatus; // Default: IN_DEVELOPMENT
  is_featured?: boolean; // Default: false
  display_order?: number; // Default: 0
}

/**
 * DTO for updating an existing project
 * All fields optional (partial update)
 */
export interface UpdateProjectInput {
  name?: string;
  short_description?: string;
  long_description?: string;
  url?: string;
  github_url?: string;
  case_study_url?: string;
  thumbnail?: string;
  images?: string[];
  tags?: string[];
  status?: ProjectStatus;
  is_featured?: boolean;
  display_order?: number;
}

/**
 * Database row type (snake_case from MySQL)
 * Used in repository layer for type safety with mysql2
 */
export interface ProjectRow {
  id: number;
  name: string;
  short_description: string;
  long_description: string;
  url: string | null;
  github_url: string | null;
  case_study_url: string | null;
  thumbnail: string | null;
  images: string | null; // JSON string from DB
  tags: string; // JSON string from DB
  status: ProjectStatus;
  is_featured: number; // MySQL BOOLEAN = TINYINT(1)
  display_order: number;
  created_at: Date;
  updated_at: Date;
}
