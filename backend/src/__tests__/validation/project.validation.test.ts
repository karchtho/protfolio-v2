  import { describe, expect,it } from 'vitest';
  import { z } from 'zod';

  import { createProjectSchema, updateProjectSchema } from '../../validation/project.validation';

  /**
   * Test Suite: Project Validation Schemas
   * Tests Zod validation rules for creating and updating projects
   */

  describe('Project Validation Schemas', () => {
    // ============================================================================
    // createProjectSchema Tests
    // ============================================================================

    describe('createProjectSchema', () => {
      // ------------------------------------------------------------------------
      // Valid Input Tests (Should Pass)
      // ------------------------------------------------------------------------

      it('should accept valid project data with all required fields', () => {
        const validData = {
          name: 'Portfolio V2',
          short_description: 'A modern personal portfolio built with Angular and Node.js.',
          long_description: 'This is a comprehensive portfolio application featuring a custom backend API, MySQL database, and a modern Angular frontend with standalone components and signals.',
          tags: ['Angular', 'TypeScript', 'Node.js', 'MySQL'],
        };

        const result = createProjectSchema.parse(validData);

        // Should parse successfully
        expect(result).toBeDefined();
        expect(result.name).toBe('Portfolio V2');
        expect(result.tags).toEqual(['Angular', 'TypeScript', 'Node.js', 'MySQL']);
      });

      it('should accept valid data with optional fields', () => {
        const validData = {
          name: 'Portfolio V2',
          short_description: 'A modern personal portfolio.',
          long_description: 'Full description of the portfolio project with technical details.',
          tags: ['Angular'],
          url: 'https://example.com',
          github_url: 'https://github.com/user/repo',
          case_study_url: 'https://blog.example.com/portfolio',
          thumbnail: 'uploads/projects/portfolio-thumb.webp',
          images: ['uploads/projects/img1.webp', 'uploads/projects/img2.webp'],
          status: 'completed' as const,
          is_featured: true,
          display_order: 1,
        };

        const result = createProjectSchema.parse(validData);

        expect(result.url).toBe('https://example.com');
        expect(result.status).toBe('completed');
        expect(result.is_featured).toBe(true);
        expect(result.display_order).toBe(1);
      });

      it('should apply default values for optional fields', () => {
        const minimalData = {
          name: 'Test Project',
          short_description: 'Short description for testing purposes only.',
          long_description: 'Long description with enough characters to pass validation.',
          tags: ['Test'],
        };

        const result = createProjectSchema.parse(minimalData);

        // Check defaults are applied
        expect(result.status).toBe('in_development');
        expect(result.is_featured).toBe(false);
        expect(result.display_order).toBe(0);
      });

      it('should trim whitespace from string fields', () => {
        const dataWithWhitespace = {
          name: '  Portfolio V2  ',
          short_description: '  Short description with spaces  ',
          long_description: '  Long description with plenty of characters to meet minimum  ',
          tags: ['Angular', 'TypeScript'],
        };

        const result = createProjectSchema.parse(dataWithWhitespace);

        // Whitespace should be trimmed
        expect(result.name).toBe('Portfolio V2');
        expect(result.short_description).not.toMatch(/^\s/);
        expect(result.short_description).not.toMatch(/\s$/);
      });

      it('should accept empty strings for optional URL fields', () => {
        const dataWithEmptyUrls = {
          name: 'Test Project',
          short_description: 'Testing empty URL handling in validation schema.',
          long_description: 'Longer description to meet the minimum character requirement.',
          tags: ['Test'],
          url: '',
          github_url: '',
          case_study_url: '',
        };

        const result = createProjectSchema.parse(dataWithEmptyUrls);

        // Empty strings should be accepted (converted to undefined by .or(z.literal('')))
        expect(result).toBeDefined();
      });

      // ------------------------------------------------------------------------
      // Invalid Input Tests (Should Fail)
      // ------------------------------------------------------------------------

      it('should reject missing required fields', () => {
        const invalidData = {
          name: 'Test Project',
          // Missing short_description, long_description, tags
        };

        expect(() => createProjectSchema.parse(invalidData)).toThrow(z.ZodError);
      });

      it('should reject name that is too short', () => {
        const invalidData = {
          name: 'A', // Only 1 character
          short_description: 'Valid short description here.',
          long_description: 'Valid long description with enough characters.',
          tags: ['Test'],
        };

        try {
          createProjectSchema.parse(invalidData);
          expect.fail('Should have thrown ZodError');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toContain('at least 2 characters');
        }
      });

      it('should reject short_description that is too short', () => {
        const invalidData = {
          name: 'Test Project',
          short_description: 'Too short', // Less than 20 characters
          long_description: 'Valid long description with enough characters to pass.',
          tags: ['Test'],
        };

        expect(() => createProjectSchema.parse(invalidData)).toThrow(z.ZodError);
      });

      it('should reject short_description that exceeds 500 characters', () => {
        const invalidData = {
          name: 'Test Project',
          short_description: 'x'.repeat(501), // 501 characters
          long_description: 'Valid long description.',
          tags: ['Test'],
        };

        expect(() => createProjectSchema.parse(invalidData)).toThrow(z.ZodError);
      });

      it('should reject long_description that is too short', () => {
        const invalidData = {
          name: 'Test Project',
          short_description: 'Valid short description for testing.',
          long_description: 'Too short', // Less than 50 characters
          tags: ['Test'],
        };

        expect(() => createProjectSchema.parse(invalidData)).toThrow(z.ZodError);
      });

      it('should reject empty tags array', () => {
        const invalidData = {
          name: 'Test Project',
          short_description: 'Valid short description for testing empty tags array.',
          long_description: 'This is a valid long description with enough characters to meet the minimum requirement of fifty characters.',
          tags: [], // Empty array
        };

        try {
          createProjectSchema.parse(invalidData);
          expect.fail('Should have thrown ZodError');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toContain('At least one tag is required');
        }
      });

      it('should reject duplicate tags', () => {
        const invalidData = {
          name: 'Test Project',
          short_description: 'Valid short description for testing duplicate tags.',
          long_description: 'This is a valid long description with enough characters to meet the minimum requirement of fifty characters.',
          tags: ['Angular', 'TypeScript', 'Angular'], // Duplicate 'Angular'
        };

        try {
          createProjectSchema.parse(invalidData);
          expect.fail('Should have thrown ZodError');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toContain('Duplicate tags are not allowed');
        }
      });

      it('should reject too many tags (> 20)', () => {
        const invalidData = {
          name: 'Test Project',
          short_description: 'Valid short description.',
          long_description: 'Valid long description with enough characters.',
          tags: Array.from({ length: 21 }, (_, i) => `Tag${i}`), // 21 tags
        };

        expect(() => createProjectSchema.parse(invalidData)).toThrow(z.ZodError);
      });

      it('should reject invalid URL format', () => {
        const invalidData = {
          name: 'Test Project',
          short_description: 'Valid short description.',
          long_description: 'Valid long description with enough characters.',
          tags: ['Test'],
          url: 'not-a-valid-url', // Invalid URL
        };

        expect(() => createProjectSchema.parse(invalidData)).toThrow(z.ZodError);
      });

      it('should reject non-GitHub URL for github_url field', () => {
        const invalidData = {
          name: 'Test Project',
          short_description: 'Valid short description.',
          long_description: 'Valid long description with enough characters.',
          tags: ['Test'],
          github_url: 'https://example.com/repo', // Not GitHub/GitLab/Bitbucket
        };

        expect(() => createProjectSchema.parse(invalidData)).toThrow(z.ZodError);
      });

      it('should reject invalid image path format', () => {
        const invalidData = {
          name: 'Test Project',
          short_description: 'Valid short description.',
          long_description: 'Valid long description with enough characters.',
          tags: ['Test'],
          thumbnail: 'invalid/path/image.jpg', // Doesn't match uploads/projects/ pattern
        };

        expect(() => createProjectSchema.parse(invalidData)).toThrow(z.ZodError);
      });

      it('should reject invalid status enum value', () => {
        const invalidData = {
          name: 'Test Project',
          short_description: 'Valid short description.',
          long_description: 'Valid long description with enough characters.',
          tags: ['Test'],
          status: 'invalid_status', // Not a valid enum value
        };

        expect(() => createProjectSchema.parse(invalidData)).toThrow(z.ZodError);
      });

      it('should reject display_order outside valid range', () => {
        const invalidData = {
          name: 'Test Project',
          short_description: 'Valid short description.',
          long_description: 'Valid long description with enough characters.',
          tags: ['Test'],
          display_order: 10000, // Exceeds max (9999)
        };

        expect(() => createProjectSchema.parse(invalidData)).toThrow(z.ZodError);
      });
    });

    // ============================================================================
    // updateProjectSchema Tests
    // ============================================================================

    describe('updateProjectSchema', () => {
      it('should accept partial updates with any single field', () => {
        const partialUpdate = {
          name: 'Updated Name',
        };

        const result = updateProjectSchema.parse(partialUpdate);
        expect(result.name).toBe('Updated Name');
      });

      it('should accept empty object without applying defaults', () => {
        const emptyUpdate = {};

        const result = updateProjectSchema.parse(emptyUpdate);

        // Empty update should mean "no changes" - no defaults applied
        expect(result).toEqual({});
      });

      it('should apply same validation rules as create schema', () => {
        const invalidUpdate = {
          name: 'A', // Too short
        };

        expect(() => updateProjectSchema.parse(invalidUpdate)).toThrow(z.ZodError);
      });

      it('should accept multiple fields at once', () => {
        const multiFieldUpdate = {
          name: 'Updated Project',
          status: 'completed' as const,
          is_featured: true,
        };

        const result = updateProjectSchema.parse(multiFieldUpdate);
        expect(result.name).toBe('Updated Project');
        expect(result.status).toBe('completed');
        expect(result.is_featured).toBe(true);
      });
    });
  });
