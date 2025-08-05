-- Create Universities table
CREATE TABLE IF NOT EXISTS universities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  program TEXT NOT NULL,
  degree TEXT CHECK (degree IN ('PhD', 'Masters')) NOT NULL,
  location TEXT NOT NULL,
  ranking INTEGER,
  application_fee DECIMAL(10,2) DEFAULT 0,
  deadline DATE NOT NULL,
  status TEXT CHECK (status IN ('not-started', 'in-progress', 'submitted', 'under-review', 'interview', 'accepted', 'rejected', 'waitlisted')) DEFAULT 'not-started',
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  requirements TEXT[] DEFAULT '{}',
  gre_required BOOLEAN DEFAULT false,
  gre_score TEXT,
  sop_length INTEGER DEFAULT 0,
  funding_available BOOLEAN DEFAULT false,
  funding_types TEXT[] DEFAULT '{}',
  funding_amount TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Professors table
CREATE TABLE IF NOT EXISTS professors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  university TEXT NOT NULL,
  department TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  office TEXT,
  research_areas TEXT[] DEFAULT '{}',
  recent_papers TEXT[] DEFAULT '{}',
  h_index INTEGER DEFAULT 0,
  citations INTEGER DEFAULT 0,
  contact_status TEXT CHECK (contact_status IN ('not-contacted', 'contacted', 'replied', 'meeting-scheduled', 'rejected')) DEFAULT 'not-contacted',
  last_contact DATE,
  next_followup DATE,
  notes TEXT DEFAULT '',
  fit_score INTEGER CHECK (fit_score >= 1 AND fit_score <= 10) DEFAULT 5,
  availability TEXT CHECK (availability IN ('available', 'limited', 'not-available')) DEFAULT 'available',
  funding_status TEXT CHECK (funding_status IN ('funded', 'seeking', 'unknown')) DEFAULT 'unknown',
  response_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('sop', 'personal-statement', 'research-statement', 'cv', 'transcript', 'lor', 'writing-sample', 'other')) NOT NULL,
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('not-started', 'draft', 'review', 'final', 'submitted')) DEFAULT 'not-started',
  version INTEGER DEFAULT 1,
  word_count INTEGER,
  word_limit INTEGER,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  deadline DATE,
  notes TEXT DEFAULT '',
  shared_with TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Timeline Events table
CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  type TEXT CHECK (type IN ('deadline', 'meeting', 'task', 'milestone', 'reminder')) NOT NULL,
  status TEXT CHECK (status IN ('upcoming', 'today', 'completed', 'overdue')) DEFAULT 'upcoming',
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  professor_id UUID REFERENCES professors(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('application', 'professor', 'document', 'test', 'interview', 'decision')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);

-- Create RLS policies
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE professors ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can add user authentication later)
CREATE POLICY "Allow all operations on universities" ON universities FOR ALL USING (true);
CREATE POLICY "Allow all operations on professors" ON professors FOR ALL USING (true);
CREATE POLICY "Allow all operations on documents" ON documents FOR ALL USING (true);
CREATE POLICY "Allow all operations on timeline_events" ON timeline_events FOR ALL USING (true);

-- Storage policies
CREATE POLICY "Allow all operations on documents bucket" ON storage.objects FOR ALL USING (bucket_id = 'documents');
