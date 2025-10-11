-- Add acceptance_funding_status column to universities table
-- This helps distinguish between accepted with funding and accepted without funding

ALTER TABLE universities
ADD COLUMN IF NOT EXISTS acceptance_funding_status TEXT
CHECK (acceptance_funding_status IN ('with-funding', 'without-funding', 'pending', 'unknown'))
DEFAULT 'unknown';

-- Update existing accepted universities to have unknown status
UPDATE universities
SET acceptance_funding_status = 'unknown'
WHERE status = 'accepted' AND acceptance_funding_status IS NULL;

COMMENT ON COLUMN universities.acceptance_funding_status IS 'Funding status for accepted applications: with-funding, without-funding, pending, or unknown';
