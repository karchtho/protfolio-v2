-- Migration 003: Update Projects Table for Final Architecture
-- Adds short/long descriptions, case_study_url, display_order, updates status ENUM, removes image_url
-- Safe for existing data - all destructive operations happen AFTER data migration
-- ============================================================================
-- STEP 1: Add new columns with NULL defaults (safe for existing data)
-- ============================================================================
ALTER TABLE projects
ADD COLUMN short_description VARCHAR(500) DEFAULT NULL COMMENT 'Preview text for cards' AFTER name,
ADD COLUMN long_description TEXT DEFAULT NULL COMMENT 'Full description for detail page' AFTER short_description,
ADD COLUMN case_study_url VARCHAR(500) DEFAULT NULL COMMENT 'Link to case study' AFTER github_url,
ADD COLUMN display_order INT DEFAULT 0 COMMENT 'Manual sorting priority' AFTER is_featured;

-- ============================================================================
-- STEP 2: Migrate existing data (copy description to both new fields)
-- ============================================================================
-- Copy existing description to both fields
-- If description > 500 chars, truncate for short_description
UPDATE projects
SET
    short_description = IF (
        CHAR_LENGTH(description) > 500,
        CONCAT (LEFT (description, 497), '...'),
        description
    ),
    long_description = description
WHERE
    short_description IS NULL;

-- ============================================================================
-- STEP 3: Make new columns required (now that they have data)
-- ============================================================================
ALTER TABLE projects MODIFY COLUMN short_description VARCHAR(500) NOT NULL,
MODIFY COLUMN long_description TEXT NOT NULL;

-- ============================================================================
-- STEP 4: Update status ENUM (cannot directly modify ENUM with data)
-- ============================================================================
-- Strategy: Create new column, migrate data, drop old, rename new
-- Add new status column with updated ENUM
ALTER TABLE projects
ADD COLUMN status_new ENUM (
    'in_development',
    'completed',
    'actively_maintained',
    'deprecated',
    'archived'
) DEFAULT 'in_development' AFTER long_description;

-- Migrate existing status values to new column
UPDATE projects
SET
    status_new = CASE
        WHEN status = 'active' THEN 'completed' -- Assume active projects are completed
        WHEN status = 'archived' THEN 'archived' -- Keep archived as archived
        ELSE 'completed' -- Default fallback
    END;

-- Drop old status column
ALTER TABLE projects
DROP COLUMN status;

-- Rename new column to 'status'
ALTER TABLE projects CHANGE COLUMN status_new status ENUM (
    'in_development',
    'completed',
    'actively_maintained',
    'deprecated',
    'archived'
) DEFAULT 'in_development';

-- ============================================================================
-- STEP 5: Clean up deprecated columns
-- ============================================================================
-- Remove image_url (replaced by thumbnail)
-- Only drop if it exists (safety check)
ALTER TABLE projects
DROP COLUMN IF EXISTS image_url;

-- Remove old description column (data already migrated)
ALTER TABLE projects
DROP COLUMN description;

-- ============================================================================
-- STEP 6: Increase URL column lengths (255 → 500)
-- ============================================================================
ALTER TABLE projects MODIFY COLUMN url VARCHAR(500) DEFAULT NULL,
MODIFY COLUMN github_url VARCHAR(500) DEFAULT NULL;

-- ============================================================================
-- STEP 7: Add indexes for query performance
-- ============================================================================
-- Index for filtering by status
CREATE INDEX idx_status ON projects (status);

-- Index for filtering featured projects
CREATE INDEX idx_featured ON projects (is_featured);

-- Index for sorting by display order
CREATE INDEX idx_display_order ON projects (display_order);

-- Index for sorting by creation date
CREATE INDEX idx_created_at ON projects (created_at);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Verify the final schema
DESCRIBE projects;