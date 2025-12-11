import { z } from 'zod';

/**
 * Validation schema for creating a project
 * Enforces all business rules and constraints
 */
export const createProjectSchema = z.object({
  // ============================================================================
  // Required fields
  // ============================================================================

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
    .array(z.string().trim().min(2, 'Tag must be at least 2 characters').max(50))
    .min(1, 'At least one tag is required')
    .max(20, 'Maximum 20 tags allowed')
    .refine((tags) => new Set(tags).size === tags.length, {
      message: 'Duplicate tags are not allowed',
    }),

  // ============================================================================
  // Optional fields
  // ============================================================================

  url: z
    .string()
    .regex(/^https?:\/\/.+\..+/, 'Must be a valid URL')
    .max(500)
    .optional()
    .or(z.literal('')), // Allow empty string (converts to undefined)

  github_url: z
    .string()
    .regex(
      /^https:\/\/(github|gitlab|bitbucket)\.(com|org)\/.+/,
      'Must be a GitHub, GitLab, or Bitbucket URL',
    )
    .max(500)
    .optional()
    .or(z.literal('')),

  case_study_url: z
    .string()
    .regex(/^https?:\/\/.+\..+/, 'Must be a valid URL')
    .max(500)
    .optional()
    .or(z.literal('')),

  thumbnail: z
    .string()
    .regex(/^uploads\/projects\/[\w-]+\.(webp|jpg|jpeg|png|gif)$/, 'Invalid image path format')
    .optional(),

  images: z
    .array(z.string().regex(/^uploads\/projects\/[\w-]+\.(webp|jpg|jpeg|png|gif)$/))
    .max(10, 'Maximum 10 images allowed')
    .optional(),

  status: z
    .enum(['in_development', 'completed', 'actively_maintained', 'deprecated', 'archived'])
    .default('in_development'),

  is_featured: z.boolean().default(false),

  display_order: z.number().int().min(0).max(9999).default(0),
});

/**
 * Validation schema for updating a project
 * All fields optional (partial update)
 * IMPORTANT: No defaults applied - empty update means "no changes", not "reset to defaults"
 */
export const updateProjectSchema = createProjectSchema
  .omit({ status: true, is_featured: true, display_order: true }) // Remove fields with defaults
  .partial()
  .extend({
    // Re-add the fields WITHOUT defaults
    status: z
      .enum(['in_development', 'completed', 'actively_maintained', 'deprecated', 'archived'])
      .optional(),
    is_featured: z.boolean().optional(),
    display_order: z.number().int().min(0).max(9999).optional(),
  });

  /**
   * Type inference from Zod schemas
   * These types are automatically inferred from the schemas above
   */
  export type CreateProjectValidated = z.infer<typeof createProjectSchema>;
  export type UpdateProjectValidated = z.infer<typeof updateProjectSchema>;