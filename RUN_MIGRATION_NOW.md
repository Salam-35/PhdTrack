# 🚨 URGENT: Run Database Migration

## You're seeing this error because the database migration hasn't been run yet:
```
Could not find the 'acceptance_funding_status' column of 'universities' in the schema cache
```

## Quick Fix (5 minutes):

### Step 1: Copy the SQL
Copy this entire SQL block:

```sql
-- Add acceptance_funding_status column to universities table
ALTER TABLE universities
ADD COLUMN IF NOT EXISTS acceptance_funding_status TEXT
CHECK (acceptance_funding_status IN ('with-funding', 'without-funding', 'pending', 'unknown'))
DEFAULT 'unknown';

-- Update existing accepted universities to have unknown status
UPDATE universities
SET acceptance_funding_status = 'unknown'
WHERE status = 'accepted' AND acceptance_funding_status IS NULL;

COMMENT ON COLUMN universities.acceptance_funding_status IS 'Funding status for accepted applications: with-funding, without-funding, pending, or unknown';
```

### Step 2: Run in Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Click on "SQL Editor" in the left sidebar
3. Click "+ New Query"
4. Paste the SQL above
5. Click "Run" (or press Ctrl+Enter / Cmd+Enter)
6. You should see "Success. No rows returned"

### Step 3: Verify
After running the migration:
1. Refresh your application
2. Try adding/editing a university again
3. The error should be gone!

## Alternative: Using Supabase CLI (if installed)

```bash
cd /home/salam/Projects/PhdTrack
npx supabase db execute --file scripts/add-acceptance-funding.sql
```

## Need Help?
If you can't access the Supabase dashboard:
1. Check your .env file for NEXT_PUBLIC_SUPABASE_URL
2. Your project URL is: `https://supabase.com/dashboard/project/[your-project-id]`
3. The project ID is usually in your Supabase URL

---

**Note:** I've updated the form to handle cases where the column doesn't exist yet, but you still need to run the migration to use the full functionality.
