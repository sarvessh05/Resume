# ResumeIQ Setup Instructions

## Prerequisites
- Node.js 18+ installed
- Supabase account
- Groq API key

## Step 1: Database Setup

1. Go to your Supabase project: https://ijdfaxrkhectzannhpjr.supabase.co
2. Navigate to SQL Editor
3. Run the SQL script from `supabase-schema.sql` to create tables and storage bucket

## Step 2: Storage Setup

1. In Supabase Dashboard, go to Storage
2. Verify the `resumes` bucket was created
3. Update storage policies if needed (already configured in SQL script)

## Step 3: Environment Variables

The `.env` file is already configured with your credentials:
- Supabase URL
- Supabase Anon Key
- Groq API Key

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Run the Application

```bash
npm run dev
```

The application will be available at http://localhost:8080

## Step 6: Test the System

1. Login with any credentials (simple auth for demo)
2. Create a new job opening
3. Upload PDF or DOCX resumes
4. View AI-powered candidate analysis

## Features

- ✅ Job creation and management
- ✅ Resume upload (PDF/DOCX)
- ✅ AI-powered resume analysis with Groq
- ✅ Candidate matching and scoring
- ✅ Dashboard with statistics
- ✅ Candidate filtering and search

## Troubleshooting

### Resume Upload Issues
- Ensure Supabase storage bucket is created
- Check storage policies are set correctly
- Verify file types are PDF or DOCX

### AI Analysis Errors
- Verify Groq API key is correct
- Check API rate limits
- Ensure resume text extraction is working

### Database Errors
- Run the SQL schema script
- Check table permissions
- Verify RLS policies are enabled

## Production Deployment

For production:
1. Move Groq API calls to a backend service (don't expose API key in browser)
2. Implement proper authentication (Supabase Auth)
3. Add rate limiting
4. Optimize resume parsing (use dedicated service)
5. Add error tracking (Sentry, etc.)

## Support

For issues, check:
- Supabase logs
- Browser console
- Network tab for API errors
