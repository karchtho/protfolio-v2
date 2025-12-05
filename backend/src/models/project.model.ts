export interface Project {
  id: number;
  name: string;
  description: string;
  url?: string;
  github_url?: string;
  image_url?: string;
  tags?: string[];
  thumbnail?: string;
  images?: string[];
  status: 'active' | 'archived';
  is_featured: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProjectInput {
  name: string;
  description: string;
  url?: string;
  github_url?: string;
  image_url?: string;
  tags?: string[];
  status?: 'active' | 'archived';
  is_featured?: boolean;
}

export type UpdateProjectInput = Partial<CreateProjectInput>;