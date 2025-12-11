# Projects Model — Final Specification

**Document Version:** 1.0
**Last Updated:** December 7, 2025
**Status:** Final Architecture — Ready for Implementation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Final Schema Definition](#final-schema-definition)
3. [Field Specifications](#field-specifications)
4. [Migration Plan](#migration-plan)
5. [TypeScript Interfaces](#typescript-interfaces)
6. [Validation Rules](#validation-rules)
7. [Admin Panel Form Design](#admin-panel-form-design)
8. [Upload Strategy](#upload-strategy)
9. [API Endpoints](#api-endpoints)
10. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

This document defines the **final architecture** for the Projects model in the portfolio application. Based on requirements analysis and user preferences, this specification provides:

- **Clear data structure** for portfolio projects
- **Detailed status tracking** (development lifecycle)
- **Flexible content management** (short + long descriptions)
- **Manual ordering** for featured projects
- **Clean image management** (thumbnail + carousel images)
- **Simple, maintainable** tech stack tracking

**Key Design Decisions:**
- ✅ Separate short/long descriptions for card vs detail page
- ✅ Detailed project status ENUM (5 states)
- ✅ Manual display ordering with `display_order` field
- ✅ Removed legacy `image_url` field (use `thumbnail` + `images` only)
- ✅ Added optional `case_study_url` for in-depth write-ups
- ✅ Minimal metadata approach (no dates, team info, or highlights)
- ✅ Flat tech tags array (no categorization)

---

## Final Schema Definition

### SQL Schema (MySQL 8)

```sql
CREATE TABLE IF NOT EXISTS projects (
  -- Primary Key
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Core Content
  name VARCHAR(255) NOT NULL,
  short_description VARCHAR(500) NOT NULL COMMENT 'Preview text for project cards (max 500 chars)',
  long_description TEXT NOT NULL COMMENT 'Full description for detail page',

  -- External Links
  url VARCHAR(500) DEFAULT NULL COMMENT 'Live demo or production URL',
  github_url VARCHAR(500) DEFAULT NULL COMMENT 'GitHub repository URL',
  case_study_url VARCHAR(500) DEFAULT NULL COMMENT 'Link to detailed case study or blog post',

  -- Images
  thumbnail VARCHAR(500) DEFAULT NULL COMMENT 'Main image path for project cards (e.g., uploads/projects/portfolio-main.webp)',
  images JSON DEFAULT NULL COMMENT 'Array of image paths for carousel (e.g., ["uploads/projects/img1.webp", "uploads/projects/img2.webp"])',

  -- Technologies
  tags JSON NOT NULL COMMENT 'Array of technology/tool names (e.g., ["Angular", "TypeScript", "Docker"])',

  -- Status & Visibility
  status ENUM('in_development', 'completed', 'actively_maintained', 'deprecated', 'archived') DEFAULT 'in_development' COMMENT 'Project lifecycle status',
  is_featured BOOLEAN DEFAULT FALSE COMMENT 'Display on homepage featured section',
  display_order INT DEFAULT 0 COMMENT 'Manual sorting (lower = higher priority, 0 = default)',

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Indexes for performance
  INDEX idx_status (status),
  INDEX idx_featured (is_featured),
  INDEX idx_display_order (display_order),
  INDEX idx_created_at (created_at)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Key Changes from Current Schema

| Change | Rationale |
|--------|-----------|
| ❌ Remove `description` | Replaced with `short_description` + `long_description` for better UX |
| ❌ Remove `image_url` | Deprecated legacy field, use `thumbnail` instead |
| ✅ Add `short_description VARCHAR(500)` | Preview text for cards (truncation-safe) |
| ✅ Add `long_description TEXT` | Full content for detail page |
| ✅ Add `case_study_url VARCHAR(500)` | Optional link to detailed write-ups |
| ✅ Update `status` ENUM | 5 states instead of 2 (active/archived) |
| ✅ Add `display_order INT` | Manual sorting capability |
| ✅ Add indexes | Optimize queries for filtering and sorting |

---

## Field Specifications

### 1. Core Content Fields

#### `name` — Project Title
- **Type:** `VARCHAR(255) NOT NULL`
- **Validation:**
  - Required
  - Min length: 2 characters
  - Max length: 255 characters
  - No leading/trailing whitespace
- **Example:** `"Portfolio"`, `"Snaposaurus"`

#### `short_description` — Card Preview
- **Type:** `VARCHAR(500) NOT NULL`
- **Purpose:** Display on project cards (Projects page, Featured section)
- **Validation:**
  - Required
  - Min length: 20 characters (meaningful preview)
  - Max length: 500 characters (hard limit)
  - Recommended: 120-200 characters for optimal card display
- **Example:** `"A modern personal portfolio built with Angular and Node.js, deployed on a secured OVH VPS with Docker."`

#### `long_description` — Full Content
- **Type:** `TEXT NOT NULL`
- **Purpose:** Full project description for detail page
- **Validation:**
  - Required
  - Min length: 50 characters
  - Max length: 10,000 characters (reasonable limit)
  - Supports markdown formatting (optional enhancement for Phase 5)
- **Example:** Full multi-paragraph description with technical details, challenges, outcomes, etc.

### 2. External Links

#### `url` — Live Demo/Production
- **Type:** `VARCHAR(500) NULL`
- **Validation:**
  - Optional
  - Must be valid URL format (https:// or http://)
  - Max length: 500 characters
- **Example:** `"https://karcherthomas.com"`

#### `github_url` — Repository Link
- **Type:** `VARCHAR(500) NULL`
- **Validation:**
  - Optional
  - Must be valid URL format
  - Recommended: validate it's a GitHub/GitLab/Bitbucket URL
- **Example:** `"https://github.com/karchtho/portfolio-v2"`

#### `case_study_url` — Detailed Write-up
- **Type:** `VARCHAR(500) NULL`
- **Purpose:** Link to blog post, Medium article, or dedicated case study page
- **Validation:**
  - Optional
  - Must be valid URL format
- **Example:** `"https://blog.karcherthomas.com/building-my-portfolio"`

### 3. Images

#### `thumbnail` — Main Project Image
- **Type:** `VARCHAR(500) NULL`
- **Purpose:** Primary image displayed on project cards
- **Format:** Relative path from backend uploads folder
- **Validation:**
  - Optional (projects can exist without images)
  - Must be valid path format: `uploads/projects/{filename}.{ext}`
  - Allowed extensions: `.webp`, `.jpg`, `.jpeg`, `.png`, `.gif`
  - File size limit: 5 MB (enforced by Multer)
- **Example:** `"uploads/projects/portfolio-main.webp"`

#### `images` — Carousel Images
- **Type:** `JSON NULL`
- **Purpose:** Array of image paths for detail page carousel/gallery
- **Format:** JSON array of strings (relative paths)
- **Validation:**
  - Optional
  - Must be valid JSON array
  - Max 10 images per project (recommended)
  - Each path follows same format as thumbnail
- **Example:** `["uploads/projects/portfolio-main.webp", "uploads/projects/portfolio-admin.webp"]`

### 4. Technologies

#### `tags` — Tech Stack
- **Type:** `JSON NOT NULL`
- **Purpose:** Array of technologies, frameworks, tools used in project
- **Format:** JSON array of strings
- **Validation:**
  - Required (minimum 1 tag)
  - Must be valid JSON array
  - Min items: 1
  - Max items: 20 (recommended)
  - Each tag: min 2 chars, max 50 chars
  - No duplicates
- **Example:** `["Angular", "TypeScript", "Node.js", "Docker", "MySQL"]`

### 5. Status & Visibility

#### `status` — Project Lifecycle
- **Type:** `ENUM('in_development', 'completed', 'actively_maintained', 'deprecated', 'archived')`
- **Default:** `'in_development'`
- **Values:**
  - `in_development` — Currently being built (WIP)
  - `completed` — Finished but not actively maintained
  - `actively_maintained` — Ongoing updates and improvements
  - `deprecated` — No longer supported/recommended
  - `archived` — Historical project (hidden from main listings)
- **Validation:** Must be one of the 5 enum values
- **Display Logic:**
  - Projects page: show all except `archived` by default (with filter toggle)
  - Featured section: only `completed` and `actively_maintained`

#### `is_featured` — Homepage Display
- **Type:** `BOOLEAN DEFAULT FALSE`
- **Purpose:** Mark project for display in homepage "Featured Projects" section
- **Validation:** Must be `true` or `false`
- **Note:** Combine with `display_order` for manual sorting of featured projects

#### `display_order` — Manual Sorting
- **Type:** `INT DEFAULT 0`
- **Purpose:** Control display order (lower number = higher priority)
- **Validation:**
  - Must be integer
  - Range: 0-9999
  - Default: 0 (no specific order, fallback to `created_at DESC`)
- **Sorting Logic:**
  ```sql
  ORDER BY display_order ASC, created_at DESC
  ```
  Projects with `display_order = 0` sort by newest first.
  Projects with `display_order > 0` appear first, sorted by that value.

### 6. Timestamps

#### `created_at` / `updated_at`
- **Type:** `TIMESTAMP`
- **Auto-managed:** MySQL handles automatically
- **Read-only:** Not editable via admin forms
- **Display:** Show formatted dates in admin panel

---

## Migration Plan

### Migration 003: Update Projects Schema

**File:** `database/migrations/003_update_projects_schema.sql`

```sql
-- Migration 003: Update Projects Table for Final Architecture
-- Adds short/long descriptions, case_study_url, display_order, updates status ENUM, removes image_url

-- Step 1: Add new columns with defaults (safe for existing data)
ALTER TABLE projects
  ADD COLUMN short_description VARCHAR(500) DEFAULT NULL COMMENT 'Preview text for cards' AFTER name,
  ADD COLUMN long_description TEXT DEFAULT NULL COMMENT 'Full description for detail page' AFTER short_description,
  ADD COLUMN case_study_url VARCHAR(500) DEFAULT NULL COMMENT 'Link to case study' AFTER github_url,
  ADD COLUMN display_order INT DEFAULT 0 COMMENT 'Manual sorting priority' AFTER is_featured;

-- Step 2: Migrate existing data (copy description to both fields)
UPDATE projects
SET
  short_description = LEFT(description, 500),  -- Truncate if needed
  long_description = description
WHERE short_description IS NULL;

-- Step 3: Make new columns required
ALTER TABLE projects
  MODIFY COLUMN short_description VARCHAR(500) NOT NULL,
  MODIFY COLUMN long_description TEXT NOT NULL;

-- Step 4: Update status ENUM (cannot directly modify ENUM with data)
-- Create temp column, migrate data, drop old, rename new
ALTER TABLE projects
  ADD COLUMN status_new ENUM('in_development', 'completed', 'actively_maintained', 'deprecated', 'archived') DEFAULT 'in_development' AFTER long_description;

UPDATE projects
SET status_new = CASE
  WHEN status = 'active' THEN 'completed'  -- Assume existing active projects are completed
  WHEN status = 'archived' THEN 'archived'
  ELSE 'completed'
END;

ALTER TABLE projects
  DROP COLUMN status,
  CHANGE COLUMN status_new status ENUM('in_development', 'completed', 'actively_maintained', 'deprecated', 'archived') DEFAULT 'in_development';

-- Step 5: Remove deprecated image_url column
ALTER TABLE projects
  DROP COLUMN image_url;

-- Step 6: Drop old description column (data already migrated)
ALTER TABLE projects
  DROP COLUMN description;

-- Step 7: Add indexes for performance
CREATE INDEX idx_status ON projects(status);
CREATE INDEX idx_featured ON projects(is_featured);
CREATE INDEX idx_display_order ON projects(display_order);
CREATE INDEX idx_created_at ON projects(created_at);

-- Step 8: Update column lengths for URLs (increase from 255 to 500)
ALTER TABLE projects
  MODIFY COLUMN url VARCHAR(500) DEFAULT NULL,
  MODIFY COLUMN github_url VARCHAR(500) DEFAULT NULL;
```

### Rollback Plan

**File:** `database/migrations/003_rollback_projects_schema.sql`

```sql
-- Rollback for Migration 003
-- Restores previous schema structure

ALTER TABLE projects
  ADD COLUMN description TEXT AFTER name,
  ADD COLUMN image_url VARCHAR(255) AFTER github_url,
  ADD COLUMN status_old ENUM('active', 'archived') DEFAULT 'active';

-- Migrate data back
UPDATE projects
SET
  description = long_description,
  image_url = thumbnail,
  status_old = CASE
    WHEN status IN ('completed', 'actively_maintained') THEN 'active'
    ELSE 'archived'
  END;

-- Drop new columns
ALTER TABLE projects
  DROP COLUMN short_description,
  DROP COLUMN long_description,
  DROP COLUMN case_study_url,
  DROP COLUMN display_order,
  DROP COLUMN status;

-- Rename old status back
ALTER TABLE projects
  CHANGE COLUMN status_old status ENUM('active', 'archived') DEFAULT 'active';

-- Drop indexes
DROP INDEX idx_status ON projects;
DROP INDEX idx_featured ON projects;
DROP INDEX idx_display_order ON projects;
DROP INDEX idx_created_at ON projects;
```

### Migration Execution Steps

1. **Backup database first:**
   ```bash
   docker exec portfolio-mysql mysqldump -u root -p portfolio > backup_pre_migration_003.sql
   ```

2. **Run migration:**
   ```bash
   docker exec -i portfolio-mysql mysql -u root -p portfolio < database/migrations/003_update_projects_schema.sql
   ```

3. **Verify data integrity:**
   ```sql
   SELECT id, name, short_description, long_description, status, display_order
   FROM projects LIMIT 5;
   ```

4. **If issues occur, rollback:**
   ```bash
   docker exec -i portfolio-mysql mysql -u root -p portfolio < database/migrations/003_rollback_projects_schema.sql
   ```

---

## TypeScript Interfaces

### Backend Model (`backend/src/models/project.model.ts`)

```typescript
/**
 * Project model matching the MySQL database schema
 * Represents a portfolio project with full lifecycle management
 */
export interface Project {
  // Primary Key
  id: number;

  // Core Content
  name: string;
  short_description: string;  // 👈 NEW: Preview for cards
  long_description: string;   // 👈 NEW: Full content for detail page

  // External Links
  url?: string;
  github_url?: string;
  case_study_url?: string;    // 👈 NEW: Optional case study link

  // Images
  thumbnail?: string;          // Path: uploads/projects/filename.webp
  images?: string[];           // Array of paths for carousel

  // Technologies
  tags: string[];              // Array of tech/framework names

  // Status & Visibility
  status: ProjectStatus;       // 👈 UPDATED: New 5-state enum
  is_featured: boolean;
  display_order: number;       // 👈 NEW: Manual sorting (0 = default)

  // Timestamps
  created_at: Date;
  updated_at: Date;
}

/**
 * Project lifecycle status enum
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
  tags: string[];

  // Optional fields
  url?: string;
  github_url?: string;
  case_study_url?: string;
  thumbnail?: string;
  images?: string[];
  status?: ProjectStatus;       // Default: IN_DEVELOPMENT
  is_featured?: boolean;        // Default: false
  display_order?: number;       // Default: 0
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
  images: string | null;        // JSON string from DB
  tags: string;                 // JSON string from DB
  status: ProjectStatus;
  is_featured: number;          // MySQL BOOLEAN = TINYINT(1)
  display_order: number;
  created_at: Date;
  updated_at: Date;
}
```

### Frontend Model (`frontend/src/app/models/project.model.ts`)

```typescript
/**
 * Project model matching the backend API structure
 * Frontend representation for display and forms
 */
export interface Project {
  id: number;
  name: string;
  short_description: string;   // 👈 NEW: For cards
  long_description: string;    // 👈 NEW: For detail page
  tags: string[];
  thumbnail?: string;
  images?: string[];
  url?: string;
  github_url?: string;
  case_study_url?: string;     // 👈 NEW
  status: ProjectStatus;       // 👈 UPDATED: 5 states
  is_featured: boolean;
  display_order: number;       // 👈 NEW
  created_at: string;          // ISO string from API
  updated_at: string;
}

/**
 * Project status enum (matches backend)
 */
export enum ProjectStatus {
  IN_DEVELOPMENT = 'in_development',
  COMPLETED = 'completed',
  ACTIVELY_MAINTAINED = 'actively_maintained',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived',
}

/**
 * Human-readable status labels for UI
 */
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.IN_DEVELOPMENT]: 'In Development',
  [ProjectStatus.COMPLETED]: 'Completed',
  [ProjectStatus.ACTIVELY_MAINTAINED]: 'Actively Maintained',
  [ProjectStatus.DEPRECATED]: 'Deprecated',
  [ProjectStatus.ARCHIVED]: 'Archived',
};

/**
 * Status badge color mapping (for UI styling)
 */
export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  [ProjectStatus.IN_DEVELOPMENT]: 'blue',
  [ProjectStatus.COMPLETED]: 'green',
  [ProjectStatus.ACTIVELY_MAINTAINED]: 'purple',
  [ProjectStatus.DEPRECATED]: 'orange',
  [ProjectStatus.ARCHIVED]: 'gray',
};

/**
 * DTO for creating a new project (admin form)
 */
export interface CreateProjectDto {
  name: string;
  short_description: string;
  long_description: string;
  tags: string[];
  url?: string;
  github_url?: string;
  case_study_url?: string;
  status?: ProjectStatus;
  is_featured?: boolean;
  display_order?: number;
  // Note: thumbnail & images handled separately via upload flow
}

/**
 * DTO for updating a project (admin form)
 */
export interface UpdateProjectDto {
  name?: string;
  short_description?: string;
  long_description?: string;
  tags?: string[];
  url?: string;
  github_url?: string;
  case_study_url?: string;
  status?: ProjectStatus;
  is_featured?: boolean;
  display_order?: number;
}
```

---

## Validation Rules

### Backend Validation (Zod Schemas)

**Install Zod:**
```bash
npm install zod
```

**File:** `backend/src/validation/project.validation.ts`

```typescript
import { z } from 'zod';
import { ProjectStatus } from '../models/project.model';

/**
 * Validation schema for creating a project
 */
export const createProjectSchema = z.object({
  // Required fields
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must not exceed 255 characters'),

  short_description: z
    .string()
    .trim()
    .min(20, 'Short description must be at least 20 characters')
    .max(500, 'Short description must not exceed 500 characters'),

  long_description: z
    .string()
    .trim()
    .min(50, 'Long description must be at least 50 characters')
    .max(10000, 'Long description must not exceed 10,000 characters'),

  tags: z
    .array(
      z.string().trim().min(2).max(50)
    )
    .min(1, 'At least one tag is required')
    .max(20, 'Maximum 20 tags allowed')
    .refine(
      (tags) => new Set(tags).size === tags.length,
      { message: 'Duplicate tags are not allowed' }
    ),

  // Optional fields
  url: z
    .string()
    .url('Must be a valid URL')
    .max(500)
    .optional()
    .or(z.literal('')),

  github_url: z
    .string()
    .url('Must be a valid URL')
    .max(500)
    .regex(/^https:\/\/(github|gitlab|bitbucket)\.(com|org)\/.*/, 'Must be a GitHub, GitLab, or Bitbucket URL')
    .optional()
    .or(z.literal('')),

  case_study_url: z
    .string()
    .url('Must be a valid URL')
    .max(500)
    .optional()
    .or(z.literal('')),

  thumbnail: z
    .string()
    .regex(/^uploads\/projects\/[\w-]+\.(webp|jpg|jpeg|png|gif)$/, 'Invalid image path')
    .optional(),

  images: z
    .array(
      z.string().regex(/^uploads\/projects\/[\w-]+\.(webp|jpg|jpeg|png|gif)$/)
    )
    .max(10, 'Maximum 10 images allowed')
    .optional(),

  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.IN_DEVELOPMENT),

  is_featured: z.boolean().default(false),

  display_order: z
    .number()
    .int()
    .min(0)
    .max(9999)
    .default(0),
});

/**
 * Validation schema for updating a project
 * All fields optional (partial update)
 */
export const updateProjectSchema = createProjectSchema.partial();

/**
 * Type inference from Zod schemas
 */
export type CreateProjectValidated = z.infer<typeof createProjectSchema>;
export type UpdateProjectValidated = z.infer<typeof updateProjectSchema>;

/**
 * Validation middleware for Express
 */
export function validateCreateProject(req: Request, res: Response, next: NextFunction) {
  try {
    req.body = createProjectSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    next(error);
  }
}

export function validateUpdateProject(req: Request, res: Response, next: NextFunction) {
  try {
    req.body = updateProjectSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    next(error);
  }
}
```

### Frontend Validation (Angular Reactive Forms)

**File:** `frontend/src/app/validators/project.validators.ts`

```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ProjectStatus } from '../models/project.model';

/**
 * Custom validators for project forms
 */

export class ProjectValidators {
  /**
   * Validates URL format (allows empty string)
   */
  static url(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const urlPattern = /^https?:\/\/.+\..+/;
      return urlPattern.test(control.value) ? null : { invalidUrl: true };
    };
  }

  /**
   * Validates GitHub/GitLab/Bitbucket URLs
   */
  static repositoryUrl(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const repoPattern = /^https:\/\/(github|gitlab|bitbucket)\.(com|org)\/.+/;
      return repoPattern.test(control.value) ? null : { invalidRepository: true };
    };
  }

  /**
   * Validates tags array (no duplicates, min/max constraints)
   */
  static tags(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const tags = control.value as string[];

      if (!Array.isArray(tags)) {
        return { invalidTags: 'Tags must be an array' };
      }

      if (tags.length < 1) {
        return { minTags: 'At least one tag is required' };
      }

      if (tags.length > 20) {
        return { maxTags: 'Maximum 20 tags allowed' };
      }

      const uniqueTags = new Set(tags);
      if (uniqueTags.size !== tags.length) {
        return { duplicateTags: 'Duplicate tags are not allowed' };
      }

      return null;
    };
  }

  /**
   * Validates project status enum
   */
  static status(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const validStatuses = Object.values(ProjectStatus);
      return validStatuses.includes(control.value) ? null : { invalidStatus: true };
    };
  }

  /**
   * Validates display order range
   */
  static displayOrder(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined) return null;

      if (!Number.isInteger(value) || value < 0 || value > 9999) {
        return { invalidDisplayOrder: 'Display order must be between 0 and 9999' };
      }

      return null;
    };
  }
}
```

**File:** `frontend/src/app/forms/project-form.config.ts`

```typescript
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProjectValidators } from '../validators/project.validators';
import { ProjectStatus } from '../models/project.model';

/**
 * Form group configuration for project creation/editing
 */
export function createProjectFormGroup() {
  return new FormGroup({
    // Required fields
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(255),
    ]),

    short_description: new FormControl('', [
      Validators.required,
      Validators.minLength(20),
      Validators.maxLength(500),
    ]),

    long_description: new FormControl('', [
      Validators.required,
      Validators.minLength(50),
      Validators.maxLength(10000),
    ]),

    tags: new FormControl<string[]>([], [
      Validators.required,
      ProjectValidators.tags(),
    ]),

    // Optional fields
    url: new FormControl('', [ProjectValidators.url()]),

    github_url: new FormControl('', [ProjectValidators.repositoryUrl()]),

    case_study_url: new FormControl('', [ProjectValidators.url()]),

    status: new FormControl(ProjectStatus.IN_DEVELOPMENT, [
      Validators.required,
      ProjectValidators.status(),
    ]),

    is_featured: new FormControl(false, [Validators.required]),

    display_order: new FormControl(0, [
      Validators.required,
      ProjectValidators.displayOrder(),
    ]),
  });
}

/**
 * Form field error messages
 */
export const PROJECT_FORM_ERRORS = {
  name: {
    required: 'Project name is required',
    minlength: 'Name must be at least 2 characters',
    maxlength: 'Name must not exceed 255 characters',
  },
  short_description: {
    required: 'Short description is required',
    minlength: 'Short description must be at least 20 characters',
    maxlength: 'Short description must not exceed 500 characters',
  },
  long_description: {
    required: 'Long description is required',
    minlength: 'Long description must be at least 50 characters',
    maxlength: 'Long description must not exceed 10,000 characters',
  },
  tags: {
    required: 'At least one tag is required',
    minTags: 'At least one tag is required',
    maxTags: 'Maximum 20 tags allowed',
    duplicateTags: 'Duplicate tags are not allowed',
  },
  url: {
    invalidUrl: 'Please enter a valid URL',
  },
  github_url: {
    invalidRepository: 'Must be a GitHub, GitLab, or Bitbucket URL',
  },
  case_study_url: {
    invalidUrl: 'Please enter a valid URL',
  },
  status: {
    required: 'Status is required',
    invalidStatus: 'Invalid status value',
  },
  is_featured: {
    required: 'Featured status is required',
  },
  display_order: {
    required: 'Display order is required',
    invalidDisplayOrder: 'Display order must be between 0 and 9999',
  },
};
```

---

## Admin Panel Form Design

### Form Layout Structure

The admin panel will have a single comprehensive form for creating/editing projects, divided into logical sections:

```
┌─────────────────────────────────────────────────────┐
│  Create New Project / Edit Project: {Name}          │
├─────────────────────────────────────────────────────┤
│                                                      │
│  📝 Basic Information                                │
│  ┌────────────────────────────────────────────┐    │
│  │ Project Name *            [              ] │    │
│  │ Short Description *       [              ] │    │
│  │   (500 char max, for cards)  125/500       │    │
│  │                                             │    │
│  │ Long Description *        [              ] │    │
│  │   (Full content for detail page)           │    │
│  │   [Large textarea with markdown preview]   │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  🔗 Links                                            │
│  ┌────────────────────────────────────────────┐    │
│  │ Live Demo URL            [              ]  │    │
│  │ GitHub Repository        [              ]  │    │
│  │ Case Study / Blog Post   [              ]  │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  🏷️ Technologies *                                   │
│  ┌────────────────────────────────────────────┐    │
│  │ [Angular] [TypeScript] [Docker] [+ Add]    │    │
│  │   (Tag input component with chips)          │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  🖼️ Images                                           │
│  ┌────────────────────────────────────────────┐    │
│  │ Thumbnail Image          [Upload] [Remove] │    │
│  │   [Preview: 300x200px]                      │    │
│  │                                             │    │
│  │ Gallery Images (max 10)  [Upload Multiple] │    │
│  │   [Preview grid with drag-to-reorder]      │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ⚙️ Settings                                         │
│  ┌────────────────────────────────────────────┐    │
│  │ Status *                 [Dropdown ▼]       │    │
│  │   • In Development                          │    │
│  │   • Completed                               │    │
│  │   • Actively Maintained                     │    │
│  │   • Deprecated                              │    │
│  │   • Archived                                │    │
│  │                                             │    │
│  │ [✓] Featured on Homepage                    │    │
│  │                                             │    │
│  │ Display Order            [0    ]            │    │
│  │   (0 = default, lower = higher priority)   │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  [Cancel]                    [Save Project] ──────  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Form Component Breakdown

#### Main Components Needed:

1. **ProjectFormComponent** — Main form container
2. **TagInputComponent** — Chip-based tag editor
3. **ImageUploadComponent** — Drag-drop upload with preview
4. **ImageGalleryEditorComponent** — Sortable image list
5. **MarkdownEditorComponent** (optional Phase 6) — WYSIWYG editor for long_description

### Form Fields Specification

| Field | Type | Required | Component | Notes |
|-------|------|----------|-----------|-------|
| **name** | Text input | ✅ | `<input type="text">` | 255 char max |
| **short_description** | Textarea | ✅ | `<textarea>` | 500 char max, character counter |
| **long_description** | Textarea | ✅ | `<textarea>` | 10k char max, future markdown support |
| **url** | URL input | ❌ | `<input type="url">` | Validation on blur |
| **github_url** | URL input | ❌ | `<input type="url">` | Repository URL validation |
| **case_study_url** | URL input | ❌ | `<input type="url">` | - |
| **tags** | Tag editor | ✅ | Custom component | Add/remove chips, min 1, max 20 |
| **thumbnail** | File upload | ❌ | Custom component | Single image, preview, 5MB limit |
| **images** | Multi-file upload | ❌ | Custom component | Max 10, drag-to-reorder, 5MB each |
| **status** | Dropdown | ✅ | `<select>` | 5 enum options with labels |
| **is_featured** | Checkbox | ❌ | `<input type="checkbox">` | Default: false |
| **display_order** | Number input | ❌ | `<input type="number">` | Range: 0-9999, default: 0 |

### Image Upload Workflow

**Step 1: User selects/drops images**
```
User → Drag & Drop → ImageUploadComponent
```

**Step 2: Frontend uploads to backend**
```
POST /api/upload/projects
Content-Type: multipart/form-data

Response: { paths: ["uploads/projects/abc123.webp"] }
```

**Step 3: Store paths in form state**
```typescript
form.patchValue({
  thumbnail: 'uploads/projects/abc123.webp',
  images: ['uploads/projects/abc123.webp', 'uploads/projects/def456.webp']
});
```

**Step 4: Submit form with paths**
```
POST /api/projects
{
  name: "...",
  thumbnail: "uploads/projects/abc123.webp",
  images: ["uploads/projects/abc123.webp", "uploads/projects/def456.webp"],
  ...
}
```

### Form Submission Flow

**Create Project:**
```typescript
// 1. Validate form
if (form.invalid) {
  showValidationErrors();
  return;
}

// 2. Prepare payload
const payload: CreateProjectDto = {
  ...form.value,
  tags: tagInputComponent.getTags(),
};

// 3. Submit to API
projectsService.createProject(payload).subscribe({
  next: (project) => {
    showSuccess('Project created successfully');
    router.navigate(['/admin/projects']);
  },
  error: (error) => {
    showError('Failed to create project', error);
  },
});
```

**Update Project:**
```typescript
// Only send changed fields (patch)
const changes: UpdateProjectDto = getFormChanges(form, originalProject);

projectsService.updateProject(projectId, changes).subscribe({
  next: (project) => {
    showSuccess('Project updated successfully');
  },
  error: (error) => {
    showError('Failed to update project', error);
  },
});
```

---

## Upload Strategy

### Multer Configuration

**Install dependencies:**
```bash
cd backend
npm install multer @types/multer file-type
```

**File:** `backend/src/middleware/upload.middleware.ts`

```typescript
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';
import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type';

/**
 * Allowed image MIME types
 */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

/**
 * Allowed file extensions
 */
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

/**
 * Max file size: 5 MB
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes

/**
 * Storage configuration for project images
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // Ensure uploads/projects directory exists
    const uploadPath = path.join(__dirname, '../../uploads/projects');
    cb(null, uploadPath);
  },

  filename: (_req, file, cb) => {
    // Generate unique filename: {uuid}.{ext}
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${crypto.randomUUID()}${ext}`;
    cb(null, filename);
  },
});

/**
 * File filter for security (MIME type + extension validation)
 */
const fileFilter = async (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): Promise<void> => {
  try {
    // 1. Check extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error(`Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`));
    }

    // 2. Check declared MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error(`Invalid MIME type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`));
    }

    // 3. Verify actual file type (magic bytes) - done in route handler after upload
    cb(null, true);
  } catch (error) {
    cb(error as Error);
  }
};

/**
 * Multer upload middleware for project images
 */
export const uploadProjectImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // Max 10 files per request (for gallery uploads)
  },
});

/**
 * Verify uploaded file type using magic bytes (file-type library)
 * Call this after multer processes the file
 */
export async function verifyFileType(filePath: string): Promise<boolean> {
  try {
    const type = await fileTypeFromFile(filePath);
    if (!type) return false;

    return ALLOWED_MIME_TYPES.includes(type.mime);
  } catch {
    return false;
  }
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
}
```

### Upload Routes

**File:** `backend/src/routes/upload.routes.ts`

```typescript
import express, { Request, Response, NextFunction } from 'express';
import { uploadProjectImages, verifyFileType } from '../middleware/upload.middleware';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

/**
 * POST /api/upload/projects
 * Upload 1-10 project images
 * Returns array of file paths
 */
router.post(
  '/projects',
  uploadProjectImages.array('images', 10),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      // Verify file types (magic bytes check)
      const paths: string[] = [];
      for (const file of files) {
        const isValid = await verifyFileType(file.path);
        if (!isValid) {
          // Delete invalid file
          await fs.unlink(file.path);
          return res.status(400).json({
            error: `Invalid file type for ${file.originalname}`,
          });
        }

        // Store relative path (matches DB format)
        paths.push(`uploads/projects/${file.filename}`);
      }

      res.status(200).json({ paths });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/upload/projects/:filename
 * Delete a project image (with path traversal protection)
 */
router.delete(
  '/projects/:filename',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filename } = req.params;

      // Path traversal protection
      const safeName = path.basename(filename); // Removes any ../ attempts
      const filePath = path.join(__dirname, '../../uploads/projects', safeName);

      // Ensure file is within uploads/projects directory
      const uploadsDir = path.join(__dirname, '../../uploads/projects');
      if (!filePath.startsWith(uploadsDir)) {
        return res.status(403).json({ error: 'Invalid file path' });
      }

      // Check file exists
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({ error: 'File not found' });
      }

      // Delete file
      await fs.unlink(filePath);

      res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
```

### Static File Serving

**File:** `backend/src/server.ts` (add this configuration)

```typescript
import express from 'express';
import path from 'path';
import uploadRoutes from './routes/upload.routes';

const app = express();

// ... other middleware ...

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Upload routes
app.use('/api/upload', uploadRoutes);

// ... rest of server config ...
```

### Docker Volume Configuration

**File:** `docker-compose.yml` (already configured, verify)

```yaml
services:
  backend:
    volumes:
      - ./backend:/app
      - /app/node_modules
      - uploads-data:/app/uploads  # 👈 Persistent uploads

volumes:
  uploads-data:  # Named volume for file persistence
  db-data:
```

---

## API Endpoints

### Complete API Specification

#### 1. Get All Projects
```
GET /api/projects?status={status}&featured={boolean}&limit={number}&offset={number}

Query Parameters:
- status (optional): Filter by status (in_development, completed, etc.)
- featured (optional): Filter by is_featured (true/false)
- limit (optional): Pagination limit (default: 50)
- offset (optional): Pagination offset (default: 0)

Response: 200 OK
{
  projects: Project[],
  total: number,
  limit: number,
  offset: number
}

Sorting: ORDER BY display_order ASC, created_at DESC
```

#### 2. Get Single Project
```
GET /api/projects/:id

Response: 200 OK
{
  project: Project
}

Response: 404 Not Found
{
  error: "Project not found"
}
```

#### 3. Get Featured Projects
```
GET /api/projects/featured?limit={number}

Query Parameters:
- limit (optional): Max projects to return (default: 6)

Response: 200 OK
{
  projects: Project[]
}

Filter: WHERE is_featured = true AND status IN ('completed', 'actively_maintained')
Sorting: ORDER BY display_order ASC, created_at DESC
```

#### 4. Create Project
```
POST /api/projects
Content-Type: application/json
Authorization: Bearer {jwt_token}  // Phase 5: Auth required

Body: CreateProjectInput
{
  name: string,
  short_description: string,
  long_description: string,
  tags: string[],
  url?: string,
  github_url?: string,
  case_study_url?: string,
  thumbnail?: string,
  images?: string[],
  status?: ProjectStatus,
  is_featured?: boolean,
  display_order?: number
}

Response: 201 Created
{
  project: Project
}

Response: 400 Bad Request (validation errors)
{
  error: "Validation failed",
  details: [
    { field: "name", message: "Name is required" }
  ]
}
```

#### 5. Update Project
```
PATCH /api/projects/:id
Content-Type: application/json
Authorization: Bearer {jwt_token}  // Phase 5: Auth required

Body: UpdateProjectInput (all fields optional)
{
  name?: string,
  short_description?: string,
  // ... other fields ...
}

Response: 200 OK
{
  project: Project
}

Response: 404 Not Found
{
  error: "Project not found"
}
```

#### 6. Delete Project
```
DELETE /api/projects/:id
Authorization: Bearer {jwt_token}  // Phase 5: Auth required

Response: 204 No Content

Response: 404 Not Found
{
  error: "Project not found"
}

Note: Should also delete associated images from uploads folder
```

#### 7. Upload Project Images
```
POST /api/upload/projects
Content-Type: multipart/form-data
Authorization: Bearer {jwt_token}  // Phase 5: Auth required

Body:
images: File[] (1-10 files, max 5MB each, jpg/png/webp/gif)

Response: 200 OK
{
  paths: string[]  // ["uploads/projects/abc123.webp", ...]
}

Response: 400 Bad Request
{
  error: "Invalid file type for example.txt"
}
```

#### 8. Delete Project Image
```
DELETE /api/upload/projects/:filename
Authorization: Bearer {jwt_token}  // Phase 5: Auth required

Response: 200 OK
{
  message: "File deleted successfully"
}

Response: 404 Not Found
{
  error: "File not found"
}
```

---

## Implementation Roadmap

### Phase 4A: Database Migration (Week 1)
- [ ] Create migration script `003_update_projects_schema.sql`
- [ ] Test migration on dev environment
- [ ] Verify data integrity after migration
- [ ] Update seed data with new schema
- [ ] Document rollback procedure

**Estimated Time:** 1-2 hours

### Phase 4B: Backend Model Updates (Week 1)
- [ ] Update `project.model.ts` with new fields and enums
- [ ] Update repositories to handle new columns
- [ ] Install Zod: `npm install zod`
- [ ] Create validation schemas in `project.validation.ts`
- [ ] Update controller methods with validation middleware
- [ ] Test API endpoints with Postman/Thunder Client

**Estimated Time:** 2-3 hours

### Phase 4C: Upload System (Week 1-2)
- [ ] Install Multer: `npm install multer @types/multer file-type`
- [ ] Create upload middleware with file validation
- [ ] Create upload routes (POST /api/upload/projects, DELETE /api/upload/projects/:filename)
- [ ] Configure Express static file serving for /uploads
- [ ] Test upload workflow (upload → store path → create project)
- [ ] Test file deletion

**Estimated Time:** 3-4 hours

### Phase 4D: Frontend Model Updates (Week 2)
- [ ] Update `project.model.ts` with new fields
- [ ] Create `ProjectStatus` enum and label mappings
- [ ] Update `ProjectsService` to handle new structure
- [ ] Update `ProjectCard` component to use `short_description`
- [ ] Create placeholder Project Detail page with `long_description`

**Estimated Time:** 2-3 hours

### Phase 4E: Frontend Validators (Week 2)
- [ ] Create `project.validators.ts` with custom validators
- [ ] Create `project-form.config.ts` with form group factory
- [ ] Test validators in isolation

**Estimated Time:** 1-2 hours

### Phase 5A: Admin Panel Components (Week 3-4)
- [ ] Create `TagInputComponent` (chip-based tag editor)
- [ ] Create `ImageUploadComponent` (single image upload with preview)
- [ ] Create `ImageGalleryEditorComponent` (multi-upload with drag-to-reorder)
- [ ] Create `ProjectFormComponent` (main admin form)
- [ ] Integrate all components
- [ ] Add form validation error displays

**Estimated Time:** 8-10 hours

### Phase 5B: Admin Panel Integration (Week 4-5)
- [ ] Create admin routes (protected, Phase 5 includes auth)
- [ ] Implement create project flow (upload images → fill form → submit)
- [ ] Implement edit project flow (load existing → modify → save)
- [ ] Implement delete project flow (confirm → delete images → delete record)
- [ ] Add success/error toast notifications
- [ ] Test full CRUD workflow

**Estimated Time:** 6-8 hours

### Phase 6: Contact Form (Week 5)
- [ ] Design contact form schema (name, email, message)
- [ ] Create backend endpoint POST /api/contact
- [ ] Add email sending (Nodemailer or email service)
- [ ] Create frontend contact form component
- [ ] Add rate limiting (express-rate-limit)
- [ ] Test spam protection

**Estimated Time:** 4-6 hours

---

## Success Criteria

### Database
- ✅ Migration runs without errors
- ✅ All existing data preserved
- ✅ New fields have correct types and constraints
- ✅ Indexes improve query performance

### Backend API
- ✅ All endpoints return correct data structure
- ✅ Zod validation catches invalid inputs
- ✅ Multer upload works with file type verification
- ✅ Static file serving exposes uploaded images
- ✅ Image deletion prevents path traversal attacks

### Frontend
- ✅ ProjectCard uses `short_description`
- ✅ Project Detail page shows `long_description`
- ✅ Status badges display correctly with colors
- ✅ Form validation prevents invalid submissions
- ✅ Image upload provides immediate feedback
- ✅ Tag editor allows easy add/remove

### Admin Panel
- ✅ Can create project with all fields
- ✅ Can upload thumbnail and gallery images
- ✅ Can edit existing project
- ✅ Can delete project (with image cleanup)
- ✅ Form shows clear validation errors
- ✅ Success/error notifications work

### Security
- ✅ File uploads validate MIME types (magic bytes)
- ✅ Filenames sanitized (UUID-based)
- ✅ File size limits enforced (5MB)
- ✅ Path traversal blocked in delete endpoint
- ✅ URL validation prevents XSS

---

## Future Enhancements (Post-v1)

### Content Enhancements
- [ ] Markdown support for `long_description` (editor + rendering)
- [ ] Rich text editor (TinyMCE, Quill, or Tiptap)
- [ ] Image optimization pipeline (sharp library for auto-resize/compress)
- [ ] WebP conversion for all uploads

### Admin UX
- [ ] Bulk operations (delete multiple projects)
- [ ] Project duplication (clone existing project)
- [ ] Draft auto-save (localStorage backup)
- [ ] Preview mode (see changes before publishing)

### Analytics
- [ ] View counts per project
- [ ] Link click tracking
- [ ] Popular tags analysis

### SEO
- [ ] Meta description field (separate from short_description)
- [ ] Open Graph image field
- [ ] Slug/URL-friendly name for routing

---

## 🚧 Implementation Status

**Last Updated:** December 11, 2025 (Evening Session)
**Current Phase:** Phase 4B Complete + Tests Written ✅

### ✅ Completed

#### Phase 4A: Database Migration (NOT YET RUN - PENDING SERVER ACCESS)
- [x] Migration script created: `database/migrations/003_update_projects_schema.sql`
- [x] Rollback script created: `database/migrations/003_rollback_projects_schema.sql`
- [x] Migration procedure documented: `database/migrations/003_migration_procedure.md`
- [ ] **PENDING:** Run migration on dev environment (user has no server access yet)

#### Phase 4B: Backend Model Updates ✅ COMPLETE
- [x] Updated `backend/src/models/project.model.ts`
  - New interfaces: `Project`, `CreateProjectInput`, `UpdateProjectInput`, `ProjectRow`
  - New enum: `ProjectStatus` (5 states)
  - Removed legacy fields: `description`, `image_url`
  - Added new fields: `short_description`, `long_description`, `case_study_url`, `display_order`

- [x] Installed Zod validation library
  - `npm install zod` in backend

- [x] Created `backend/src/validation/project.validation.ts`
  - `createProjectSchema` with all validation rules
  - `updateProjectSchema` (partial)
  - Modern Zod API (no deprecated methods)

- [x] Created `backend/src/middleware/validation.middleware.ts`
  - Generic `validateRequest<T>()` factory function
  - Zod error formatting
  - Proper TypeScript types

- [x] Updated `backend/src/routes/projects.routes.ts`
  - Added validation middleware to POST and PATCH routes
  - Changed PUT to PATCH (REST best practice)
  - Imported schemas and middleware

- [x] Updated `backend/src/repositories/projects.repository.ts`
  - Updated `findAll()` with new sorting: `display_order ASC, created_at DESC`
  - Updated `findFeatured()` to filter by `status IN ('completed', 'actively_maintained')`
  - Updated `create()` with all new fields
  - Updated `update()` with all new fields
  - Added `mapRowToProject()` helper (JSON parsing, type conversions)

- [x] Controller remains unchanged (validation handled by middleware)

#### Phase 4B Testing ✅ COMPLETE
- [x] Vitest configured (`vitest.config.ts`)
- [x] Test directory structure created (`src/__tests__/`)
- [x] Validation tests written (`project.validation.test.ts` - 22 tests)
  - Valid input tests (required fields, optional fields, defaults, trimming)
  - Invalid input tests (missing fields, length constraints, duplicate tags, URL formats)
  - Update schema tests (partial updates, empty updates)
- [x] **Bug discovered and fixed:** Update schema was applying defaults (would reset fields on empty PATCH)
- [x] All tests passing ✅

### 🔄 Current Status

**Backend is code-complete and tested for Phase 4B:**
1. ❌ Migration not yet run (user needs server access) - **NEXT STEP**
2. ✅ Validation tests written and passing (22 tests)
3. ⚠️ Repository tests not yet written (planned next session)
4. ⚠️ Integration tests not yet written (planned next session)
5. ❌ Not tested with actual API calls (requires migration first)

### 🎯 Next Steps (In Order)

#### Immediate: Run Migration & Continue Testing
1. **Run database migration** (when server access available)
   - Follow procedure in `database/migrations/003_migration_procedure.md`
   - Verify schema changes
   - Test with actual data

2. **Write tests for repository** (`projects.repository.test.ts`) — NEXT SESSION
   - Mock database with test data
   - Test CRUD operations
   - Test `mapRowToProject()` transformations
   - Test sorting logic

3. **Write tests for validation middleware** (`validation.middleware.test.ts`)
   - Test successful validation calls `next()`
   - Test failed validation returns 400 with formatted errors

4. **Integration tests** (`projects.integration.test.ts`)
   - Test full API flow: request → validation → controller → repository
   - Test POST /api/projects with valid/invalid data
   - Test PATCH /api/projects/:id

#### After Testing: Phase 4C - Upload System
- [ ] Install Multer: `npm install multer @types/multer file-type`
- [ ] Create `backend/src/middleware/upload.middleware.ts`
- [ ] Create `backend/src/routes/upload.routes.ts`
- [ ] Configure Express static serving: `app.use('/uploads', express.static(...))`
- [ ] Test upload flow: POST /api/upload/projects
- [ ] Test file deletion: DELETE /api/upload/projects/:filename

#### Then: Phase 4D - Frontend Updates
- [ ] Update `frontend/src/app/models/project.model.ts`
- [ ] Update `ProjectsService` to handle new fields
- [ ] Update `ProjectCard` to use `short_description`
- [ ] Create placeholder Project Detail page with `long_description`

### 📝 Important Notes

**Validation Strategy:**
- Backend uses Zod schemas in middleware (validates before controller)
- Frontend will use Angular Reactive Forms validators
- Same validation rules on both sides (security + UX)

**JSON Fields in MySQL:**
- `tags` (JSON array of strings) - REQUIRED
- `images` (JSON array of paths) - OPTIONAL
- Repository layer handles JSON.parse/stringify automatically

**Status ENUM Logic:**
- Featured projects: only `completed` or `actively_maintained`
- All projects page: show all except `archived` (filter toggle planned)
- In development: shows WIP work

**Sorting Logic:**
- Primary: `display_order ASC` (manual pinning, 0 = no priority)
- Secondary: `created_at DESC` (newest first for unpinned)

### 🧪 Test-Driven Development Approach

User prefers TDD methodology:
- Write tests BEFORE or ALONGSIDE feature implementation
- Tests document expected behavior
- Catch regressions early
- Build confidence in refactoring

**Testing Stack (Backend):**
- Jest or Vitest (TBD)
- Supertest for API integration tests
- Mock database for unit tests

**Session Summary (December 11, 2025 Evening):**
- ✅ Backend architecture complete (models, validation, middleware, routes, repository)
- ✅ Vitest testing framework configured
- ✅ 22 validation tests written and passing
- ✅ Critical bug discovered and fixed (update schema defaults issue)
- ✅ TypeScript configuration fixed (tsconfig.json include/exclude)
- 📝 Total implementation: ~500 lines of production code + ~300 lines of test code
- 🎯 Next: Run migration, write repository tests, then Phase 4C (upload system)

---

**End of Document**

*This specification serves as the single source of truth for the Projects model architecture. All implementation should reference this document.*
