-- Rollback for Migration 003
-- Restores previous schema structure
-- WARNING: This will lose data from new fields (case_study_url, display_order)
-- ============================================================================
-- STEP 1: Restore old columns
-- ============================================================================
ALTER TABLE projects
ADD COLUMN description TEXT AFTER name,
ADD COLUMN image_url VARCHAR(255) AFTER github_url;

-- ============================================================================
-- STEP 2: Add old status column
-- ============================================================================
ALTER TABLE projects
ADD COLUMN status_old ENUM ('active', 'archived') DEFAULT 'active';

-- Migrate status back to old ENUM
UPDATE projects
SET
    status_old = CASE
        WHEN status IN (
            'completed',
            'actively_maintained',
            'in_development'
        ) THEN 'active'
        WHEN status IN ('deprecated', 'archived') THEN 'archived'
        ELSE 'active'
    END;

-- ============================================================================
-- STEP 3: Migrate data back to old structure
-- ============================================================================
-- Copy long_description back to description
UPDATE projects
SET
    description = long_description,
    image_url = thumbnail;

-- ============================================================================
-- STEP 4: Drop new columns
-- ============================================================================
ALTER TABLE projects
DROP COLUMN short_description,
DROP COLUMN long_description,
DROP COLUMN case_study_url,
DROP COLUMN display_order,
DROP COLUMN status;

-- Rename old status back
ALTER TABLE projects CHANGE COLUMN status_old status ENUM ('active', 'archived') DEFAULT 'active';

-- ============================================================================
-- STEP 5: Drop indexes
-- ============================================================================
DROP INDEX IF EXISTS idx_status ON projects;

DROP INDEX IF EXISTS idx_featured ON projects;

DROP INDEX IF EXISTS idx_display_order ON projects;

DROP INDEX IF EXISTS idx_created_at ON projects;

-- ============================================================================
-- STEP 6: Restore old URL column lengths
-- ============================================================================
ALTER TABLE projects MODIFY COLUMN url VARCHAR(255) DEFAULT NULL,
MODIFY COLUMN github_url VARCHAR(255) DEFAULT NULL;

-- ============================================================================
-- ROLLBACK COMPLETE
-- ============================================================================
DESCRIBE projects;