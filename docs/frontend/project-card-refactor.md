# Project Card Refactor - Design Decisions

**Date:** 2025-12-23
**Context:** Refactoring ProjectCard to display all project metadata from the model

---

## Problem Statement

The `Project` model contains more data than currently displayed in `ProjectCard`:
- ❌ `status` (5-state enum) - NOT displayed
- ❌ `case_study_url` - NOT displayed
- ❌ `is_featured` - NOT displayed (used only for backend filtering)

**Goal:** Display relevant metadata while keeping the UI clean and scalable for admin CRUD interface.

---

## Design Decisions

### 1. Status Badge Display

**Decision:** Display ALL 5 status states (complete transparency)

**Options Considered:**
- ✅ **Option A (CHOSEN):** Display all statuses - avoid inconsistency
- ❌ Option B: Display only "special" statuses (hide "completed")

**Rationale:**
- Users expect transparency about project state
- Simpler logic (no conditional hiding)
- Consistent UI across all projects

**Implementation:**
- Create reusable `StatusBadge` component
- Map status to color variants (blue/green/purple/orange/gray)
- Display badge prominently on cards

---

### 2. Case Study Link

**Decision:** Keep DB field but **DO NOT display** in UI (for now)

**Options Considered:**
- ❌ Option A: External link button [Read Case Study →]
- ❌ Option B: Integrated case study section in detail page
- ✅ **Option C (CHOSEN):** Hide for now, focus on good descriptions

**Rationale:**
- No blog articles written yet
- `long_description` sufficient for v1
- Can add button later when articles exist
- Keep DB schema (cheap, future-proof)

**Implementation:**
- `case_study_url` remains in model/DB
- NOT rendered in ProjectCard
- Focus on quality `short_description` + `long_description`

---

### 3. Featured Indicator

**Decision:** NO visual indicator (it's just a backend filter)

**Rationale:**
- `is_featured` is used to select projects for home page
- No need for "Featured" badge or special styling
- Users don't need to see this metadata (internal curation)

**Implementation:**
- `is_featured` used by `ProjectsService.loadFeaturedProjects()`
- No UI changes to ProjectCard

---

### 4. Component Architecture

**Decision:** Single flexible `ProjectCard` component with variants

**Options Considered:**
- ✅ **Option A (CHOSEN):** One component with `variant` prop
- ❌ Option B: Separate `ProjectCard` and `AdminProjectCard`

**Rationale:**
- Follows composition over inheritance pattern
- Easier to maintain (single source of truth)
- Scalable (easy to add new variants)
- Better for testing

**Implementation:**
```typescript
<ProjectCard
  project={project}
  variant="public" | "admin"
/>
```

**Variants:**
- `public`: Display for end users (home + projects page)
- `admin`: Additional metadata + edit/delete actions

---

## Component Structure

```
components/
├── project-card/
│   ├── project-card.ts          # Main component with variants
│   ├── project-card.html
│   ├── project-card.scss
│   └── status-badge.ts          # Reusable status badge
```

---

## UI Wireframes

### Public Variant (Home + Projects Page)

```
┌─────────────────────────────────────┐
│ [Status Badge]                      │ ← NEW: Status badge
│                                     │
│ [Image Thumbnail]                   │
│                                     │
│ Project Name                        │
│ Short description...                │
│                                     │
│ [tag1] [tag2] [tag3]               │
│                                     │
│ [Live Demo] [GitHub]                │ ← Case Study hidden
└─────────────────────────────────────┘
```

### Admin Variant (Admin Panel)

```
┌─────────────────────────────────────┐
│ [Status Badge]                      │
│                                     │
│ [Image Thumbnail]                   │
│                                     │
│ Project Name                        │
│ Short description...                │
│                                     │
│ [tag1] [tag2] [tag3]               │
│                                     │
│ Featured: ☑️  Display Order: 3     │ ← Admin metadata
│                                     │
│ [Edit] [Delete]                     │ ← Admin actions
└─────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Status Badge (Current)
- [ ] Create `StatusBadge` component
- [ ] Add status badge to `ProjectCard`
- [ ] Style with color variants
- [ ] Update `ProjectCard` template

### Phase 2: Admin Variant (Next)
- [ ] Add `variant` input to `ProjectCard`
- [ ] Implement admin metadata display
- [ ] Add edit/delete action buttons
- [ ] Wire up admin actions in admin page

### Phase 3: Detail Page (Future)
- [ ] Create ProjectDetail page component
- [ ] Display `long_description`
- [ ] Implement image carousel
- [ ] Add breadcrumb navigation

---

## Status Enum Mapping

```typescript
export enum ProjectStatus {
  IN_DEVELOPMENT = 'in_development',       // Blue badge
  COMPLETED = 'completed',                 // Green badge
  ACTIVELY_MAINTAINED = 'actively_maintained', // Purple badge
  DEPRECATED = 'deprecated',               // Orange badge
  ARCHIVED = 'archived',                   // Gray badge
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.IN_DEVELOPMENT]: 'In Development',
  [ProjectStatus.COMPLETED]: 'Completed',
  [ProjectStatus.ACTIVELY_MAINTAINED]: 'Actively Maintained',
  [ProjectStatus.DEPRECATED]: 'Deprecated',
  [ProjectStatus.ARCHIVED]: 'Archived',
};

export const PROJECT_STATUS_VARIANTS: Record<ProjectStatus, string> = {
  [ProjectStatus.IN_DEVELOPMENT]: 'blue',
  [ProjectStatus.COMPLETED]: 'green',
  [ProjectStatus.ACTIVELY_MAINTAINED]: 'purple',
  [ProjectStatus.DEPRECATED]: 'orange',
  [ProjectStatus.ARCHIVED]: 'gray',
};
```

---

## Notes

- **Case Study Future:** When blog articles exist, add conditional button:
  ```html
  @if (project().case_study_url) {
    <app-button label="Read Case Study" [href]="project().case_study_url" />
  }
  ```

- **Featured Future:** If visual indicator needed later, add subtle styling:
  ```scss
  &--featured {
    border: 2px solid var(--primary);
    box-shadow: var(--shadow-lg);
  }
  ```

---

**Last Updated:** 2025-12-23
**Status:** ✅ Decisions finalized, ready for implementation
