# Fix Storage Error - Quick Guide

## The Problem
You're seeing: **"StorageApiError: new row violates row-level security policy"**

This means the Supabase storage bucket doesn't have the right permissions.

## The Solution (2 minutes)

### Step 1: Go to Supabase SQL Editor
1. Open your Supabase project: https://ijdfaxrkhectzannhpjr.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run This SQL
Copy and paste the entire content from `supabase-setup-simple.sql` and click **Run**

**OR** just run this quick fix:

```sql
-- Quick fix for storage permissions
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop old policies
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;

-- Create new public policies
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resumes');

CREATE POLICY "Allow public updates"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'resumes');

CREATE POLICY "Allow public deletes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'resumes');
```

### Step 3: Verify Storage Bucket
1. Go to **Storage** in Supabase sidebar
2. You should see a bucket called **resumes**
3. It should show as **Public**

### Step 4: Restart Your App
```bash
npm run dev
```

## Alternative: Manual Setup

If SQL doesn't work, do this manually:

1. **Go to Storage** in Supabase
2. **Create bucket** named `resumes`
3. Make it **Public**
4. **Click on the bucket** → **Policies**
5. **Add these policies:**
   - INSERT: Allow public
   - SELECT: Allow public
   - UPDATE: Allow public
   - DELETE: Allow public

## Test It
1. Go to http://localhost:8080
2. Login
3. Create a job
4. Try uploading a resume
5. Should work now! ✅

## Still Having Issues?

Check browser console (F12) for the exact error message and let me know!
