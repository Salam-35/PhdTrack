# Database Migration Instructions

## Overview
This migration adds the `acceptance_funding_status` column to the `universities` table to distinguish between acceptances with and without funding.

## Migration File
Location: `/scripts/add-acceptance-funding.sql`

## How to Run the Migration

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `/scripts/add-acceptance-funding.sql`
4. Paste into the SQL Editor
5. Click "Run" to execute the migration

### Option 2: Using Supabase CLI
```bash
# Make sure you're in the project directory
cd /home/salam/Projects/PhdTrack

# Run the migration
supabase db execute --file scripts/add-acceptance-funding.sql
```

### Option 3: Using psql (if you have direct database access)
```bash
psql -h <your-supabase-host> -U postgres -d postgres -f scripts/add-acceptance-funding.sql
```

## What This Migration Does
1. Adds a new column `acceptance_funding_status` to the `universities` table
2. Sets the default value to `'unknown'`
3. Adds a CHECK constraint to ensure only valid values are stored:
   - `'with-funding'` - Accepted with funding
   - `'without-funding'` - Accepted without funding
   - `'pending'` - Funding decision pending
   - `'unknown'` - Unknown funding status
4. Updates any existing accepted universities to have `'unknown'` status

## After Migration
Once the migration is complete, you can:
1. View universities on the dashboard sorted by status priority (accepted with funding appears at the top)
2. When editing a university with "accepted" status, you'll see a new field to specify funding status
3. The dashboard and applications page will clearly show which acceptances include funding

## Rollback (if needed)
If you need to rollback this migration:
```sql
ALTER TABLE universities DROP COLUMN IF EXISTS acceptance_funding_status;
```

## Notes
- This is a non-destructive migration - it won't delete or modify existing data
- All existing universities will continue to work as before
- The new field is optional and defaults to 'unknown'
