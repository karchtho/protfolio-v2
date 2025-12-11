# Migration 003 — Execution Procedure

## Prerequisites
- Docker containers running (`docker-compose up -d`)
- MySQL root password ready (from `backend/.env`)

---

## Step 1: Backup Database

```bash
docker exec portfolio-mysql mysqldump -u root -p portfoliodb > backup_pre_migration_003_$(date +%Y%m%d_%H%M%S).sql
```

**Check:** Backup file created in current directory

---

## Step 2: Verify Current Schema

```bash
docker exec -it portfolio-mysql mysql -u root -p portfoliodb -e "DESCRIBE projects;"
```

**Check:** See current columns (should have `description`, `image_url`, old status ENUM)

---

## Step 3: Run Migration

```bash
docker exec -i portfolio-mysql mysql -u root -p portfoliodb < database/migrations/003_update_projects_schema.sql
```

**Check:** No errors, sees `DESCRIBE projects;` output at end

---

## Step 4: Verify Schema Changes

```bash
docker exec -it portfolio-mysql mysql -u root -p portfoliodb -e "DESCRIBE projects;"
```

**Expected:**
- ✅ `short_description` (VARCHAR(500), NOT NULL)
- ✅ `long_description` (TEXT, NOT NULL)
- ✅ `case_study_url` (VARCHAR(500), NULL)
- ✅ `display_order` (INT, DEFAULT 0)
- ✅ `status` ENUM with 5 values
- ❌ `description` (removed)
- ❌ `image_url` (removed)

---

## Step 5: Verify Data Migration

```bash
docker exec -it portfolio-mysql mysql -u root -p portfoliodb -e "SELECT id, name, short_description, long_description, status, display_order FROM projects LIMIT 3;"
```

**Expected:**
- Both description fields populated
- Status values are `completed`
- `display_order` is `0`

---

## Step 6: Verify Indexes

```bash
docker exec -it portfolio-mysql mysql -u root -p portfoliodb -e "SHOW INDEX FROM projects;"
```

**Expected indexes:**
- `idx_status`
- `idx_featured`
- `idx_display_order`
- `idx_created_at`

---

## Rollback (If Needed)

```bash
docker exec -i portfolio-mysql mysql -u root -p portfoliodb < database/migrations/003_rollback_projects_schema.sql
```

---

## Success Criteria

- [x] Backup created
- [x] New columns exist and are NOT NULL
- [x] Data migrated (no NULL values in required fields)
- [x] Old columns removed
- [x] Status ENUM has 5 values
- [x] 4 indexes created
- [x] No errors in any command
