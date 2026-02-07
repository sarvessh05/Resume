-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  experience_min INTEGER NOT NULL,
  experience_max INTEGER NOT NULL,
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  optional_skills TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
  total_resumes INTEGER NOT NULL DEFAULT 0,
  processed_resumes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  resume_filename TEXT NOT NULL,
  resume_url TEXT NOT NULL,
  parsed_data JSONB NOT NULL,
  match_score INTEGER NOT NULL,
  skill_match_score INTEGER NOT NULL,
  experience_match_score INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  strengths TEXT[] NOT NULL DEFAULT '{}',
  gaps TEXT[] NOT NULL DEFAULT '{}',
  recommendation TEXT NOT NULL CHECK (recommendation IN ('Shortlist', 'Review', 'Reject')),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_candidates_job_id ON candidates(job_id);
CREATE INDEX IF NOT EXISTS idx_candidates_match_score ON candidates(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'resumes');

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Create policies for jobs table
CREATE POLICY "Allow all operations on jobs"
ON jobs FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Create policies for candidates table
CREATE POLICY "Allow all operations on candidates"
ON candidates FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
