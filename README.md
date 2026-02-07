# ResumeIQ - AI-Powered Resume Screening Platform

An intelligent resume screening system that uses AI to analyze and match candidates with job requirements.

## Features

- 🤖 AI-powered resume analysis using Groq API
- 📄 PDF/DOCX resume parsing
- 🎯 Smart candidate matching and scoring
- 📊 Dashboard with analytics
- 🔐 Secure authentication
- ☁️ Cloud storage with Supabase

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Supabase (Database & Storage)
- Groq API (AI Analysis)

## Setup

1. Clone the repository:
```sh
git clone https://github.com/sarvessh05/Resume.git
cd Resume
```

2. Install dependencies:
```sh
npm install
```

3. Create a `.env` file with your credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
```

4. Start the development server:
```sh
npm run dev
```

## Deployment

Build for production:
```sh
npm run build
```

## License

MIT
