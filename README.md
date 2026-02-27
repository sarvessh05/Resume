# Smart Hire Hub - AI-Powered Resume Screening Platform

> Revolutionize your hiring process with intelligent resume analysis and candidate matching powered by AI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite)

## Overview

Smart Hire Hub is a modern, AI-powered recruitment platform that automates resume screening and candidate evaluation. Upload resumes, let AI analyze them against job requirements, and get instant match scores with detailed insights.

## Features

### Core Functionality
- **AI-Powered Analysis** - Dual AI engine (Gemini & Groq) for accurate resume evaluation
- **Smart Matching** - Intelligent skill matching with flexible scoring algorithms
- **PDF Extraction** - Advanced PDF text extraction using PDF.js
- **Batch Processing** - Upload multiple resumes simultaneously
- **Real-time Scoring** - Instant match scores, skill analysis, and recommendations

### User Experience
- **Modern Dashboard** - Clean, intuitive interface with analytics
- **Job Management** - Create, view, and delete job postings
- **Candidate Profiles** - Detailed candidate views with AI insights
- **Resume Download** - Direct resume file downloads from cloud storage
- **Email Integration** - One-click candidate contact via email

### Technical Features
- **Cloud Storage** - Secure resume storage with Supabase
- **Authentication** - Simple and secure login system
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Type Safety** - Full TypeScript implementation

## Tech Stack

### Frontend
- **React 18.3** - Modern UI library
- **TypeScript 5.5** - Type-safe development
- **Vite 7.3** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful component library
- **Framer Motion** - Smooth animations

### Backend & Services
- **Supabase** - PostgreSQL database and file storage
- **Google Gemini 1.5** - Primary AI analysis engine
- **Groq (Llama 3.3)** - Fallback AI engine
- **PDF.js** - Client-side PDF text extraction

### Key Libraries
- `pdfjs-dist` - PDF parsing
- `@google/generative-ai` - Gemini API integration
- `groq-sdk` - Groq API integration
- `react-router-dom` - Client-side routing
- `sonner` - Toast notifications

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Google AI API key (Gemini)
- Groq API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sarvessh05/Resume.git
cd Resume
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_API_KEY=your_google_gemini_api_key
VITE_GROQ_API_KEY=your_groq_api_key
```

4. **Set up Supabase database**

Run the SQL scripts in your Supabase SQL editor:
- `supabase-schema.sql` - Creates tables and storage buckets
- `supabase-setup-simple.sql` - Sets up storage policies

5. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## Project Structure

```
smart-hire-hub/
├── src/
│   ├── components/
│   │   ├── layout/          # Layout components
│   │   └── ui/              # shadcn/ui components
│   ├── hooks/               # Custom React hooks
│   ├── lib/
│   │   ├── gemini.ts        # Gemini AI integration
│   │   ├── groq.ts          # Groq AI integration
│   │   ├── resumeParser.ts  # PDF text extraction
│   │   ├── supabase.ts      # Supabase client
│   │   └── utils.ts         # Utility functions
│   ├── pages/
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Jobs.tsx         # Job listings
│   │   ├── CreateJob.tsx    # Job creation form
│   │   ├── JobDetail.tsx    # Job details & resume upload
│   │   ├── CandidatesList.tsx  # Candidates list
│   │   └── CandidateDetail.tsx # Candidate profile
│   ├── App.tsx              # App routing
│   └── main.tsx             # App entry point
├── public/                  # Static assets
├── supabase-schema.sql      # Database schema
└── package.json             # Dependencies
```

## Usage Guide

### 1. Login
- Default credentials: `admin@example.com` / `admin123`
- Or use any email/password combination

### 2. Create a Job
- Navigate to Jobs → Create New Job
- Fill in job details, required skills, and experience range
- Submit to create the job posting

### 3. Upload Resumes
- Open the job detail page
- Drag & drop PDF resumes or click to browse
- AI automatically analyzes each resume
- View match scores and recommendations

### 4. Review Candidates
- Click "View Candidates" to see all applicants
- Filter by recommendation (Shortlist/Review/Reject)
- Click on a candidate to view detailed analysis

### 5. Take Action
- Download candidate resumes
- Contact candidates via email
- Delete jobs when positions are filled

## AI Scoring System

### Match Score Calculation
- **60%** - Skills match weight
- **40%** - Experience match weight

### Scoring Thresholds
- **80-100**: Shortlist - Strong candidate
- **50-79**: Review - Consider for evaluation
- **0-49**: Reject - Does not meet requirements

### AI Analysis Includes
- Parsed candidate data (name, email, skills, experience)
- Skill match score with flexible matching
- Experience match score
- Detailed explanation of the match
- Key strengths identified
- Potential gaps or missing skills
- Final recommendation

## API Keys Setup

### Google Gemini API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `.env` as `VITE_GOOGLE_API_KEY`

### Groq API
1. Visit [Groq Console](https://console.groq.com/)
2. Create an account and generate API key
3. Add to `.env` as `VITE_GROQ_API_KEY`

### Supabase
1. Create a project at [Supabase](https://supabase.com/)
2. Get your project URL and anon key from Settings → API
3. Add to `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## Building for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

The build output will be in the `dist/` directory, ready for deployment.

## Deployment

### Recommended Platforms
- **Vercel** - Zero-config deployment
- **Netlify** - Continuous deployment from Git
- **Cloudflare Pages** - Fast global CDN

### Environment Variables
Make sure to set all environment variables in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_API_KEY`
- `VITE_GROQ_API_KEY`

## Troubleshooting

### PDF Extraction Issues
- Ensure `pdfjs-dist` is properly installed
- Check browser console for worker errors
- Verify PDF files are not password-protected

### AI Analysis Failures
- Check API keys are valid and have quota
- Verify network connectivity
- Check browser console for detailed error messages

### Supabase Connection Issues
- Verify Supabase URL and keys are correct
- Check storage bucket policies are set up
- Ensure database tables exist

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Supabase](https://supabase.com/) for backend infrastructure
- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [Groq](https://groq.com/) for fast AI inference

## Support

For support, email ghotekarsarvesh@gmail.com or open an issue in the GitHub repository.

---

Made with ❤️ by Sarvessh
