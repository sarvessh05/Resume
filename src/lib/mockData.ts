// Mock data for ResumeIQ platform

export interface Job {
  id: string;
  title: string;
  description: string;
  experience_min: number;
  experience_max: number;
  required_skills: string[];
  optional_skills: string[];
  status: 'active' | 'closed' | 'draft';
  total_resumes: number;
  processed_resumes: number;
  created_at: string;
}

export interface Candidate {
  id: string;
  job_id: string;
  resume_filename: string;
  parsed_data: {
    name: string;
    email: string;
    phone?: string;
    skills: string[];
    experience_years: number;
    education: string[];
    roles: string[];
    projects?: string[];
    summary?: string;
  };
  match_score: number;
  skill_match_score: number;
  experience_match_score: number;
  explanation: string;
  strengths: string[];
  gaps: string[];
  recommendation: 'Shortlist' | 'Review' | 'Reject';
  processed_at: string;
}

export interface DashboardStats {
  active_jobs: number;
  total_resumes: number;
  avg_match_score: number;
  shortlisted: number;
}

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    description: 'We are looking for a Senior Frontend Engineer to join our team. You will be responsible for building modern, scalable web applications using React and TypeScript.',
    experience_min: 4,
    experience_max: 8,
    required_skills: ['React', 'TypeScript', 'CSS', 'JavaScript'],
    optional_skills: ['Next.js', 'GraphQL', 'Testing'],
    status: 'active',
    total_resumes: 45,
    processed_resumes: 42,
    created_at: '2024-01-15',
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    description: 'Join our engineering team as a Full Stack Developer. You will work on both frontend and backend technologies to deliver end-to-end solutions.',
    experience_min: 2,
    experience_max: 5,
    required_skills: ['Python', 'React', 'PostgreSQL', 'API Design'],
    optional_skills: ['Docker', 'AWS', 'Redis'],
    status: 'active',
    total_resumes: 28,
    processed_resumes: 28,
    created_at: '2024-01-20',
  },
  {
    id: '3',
    title: 'Machine Learning Engineer',
    description: 'We need a Machine Learning Engineer to develop and deploy ML models at scale. Experience with NLP and deep learning is preferred.',
    experience_min: 3,
    experience_max: 7,
    required_skills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps'],
    optional_skills: ['Kubernetes', 'Spark', 'NLP'],
    status: 'active',
    total_resumes: 15,
    processed_resumes: 12,
    created_at: '2024-01-25',
  },
];

export const mockCandidates: Candidate[] = [
  {
    id: 'c1',
    job_id: '1',
    resume_filename: 'sarah_chen_resume.pdf',
    parsed_data: {
      name: 'Sarah Chen',
      email: 'sarah.chen@email.com',
      phone: '+1 (555) 123-4567',
      skills: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'CSS', 'JavaScript', 'Testing', 'Tailwind CSS'],
      experience_years: 6,
      education: ['MS Computer Science - Stanford University', 'BS Computer Science - UC Berkeley'],
      roles: ['Senior Frontend Engineer at Meta', 'Frontend Developer at Stripe', 'Software Engineer at Airbnb'],
      projects: ['Built component library used by 50+ teams', 'Led migration to TypeScript'],
      summary: 'Experienced frontend engineer with expertise in React ecosystem and design systems.',
    },
    match_score: 95,
    skill_match_score: 98,
    experience_match_score: 92,
    explanation: 'Sarah is an exceptional candidate with extensive experience in React and TypeScript. Her background at top tech companies and proven track record in building scalable frontend systems makes her an ideal fit.',
    strengths: ['Expert-level React and TypeScript skills', 'Experience at FAANG companies', 'Strong design system expertise', 'Leadership experience'],
    gaps: [],
    recommendation: 'Shortlist',
    processed_at: '2024-01-28',
  },
  {
    id: 'c2',
    job_id: '1',
    resume_filename: 'alex_rodriguez_cv.pdf',
    parsed_data: {
      name: 'Alex Rodriguez',
      email: 'alex.r@email.com',
      phone: '+1 (555) 234-5678',
      skills: ['React', 'JavaScript', 'CSS', 'HTML', 'Vue.js', 'Node.js'],
      experience_years: 4,
      education: ['BS Computer Science - MIT'],
      roles: ['Frontend Developer at Shopify', 'Junior Developer at IBM'],
      summary: 'Frontend developer with strong JavaScript fundamentals and e-commerce experience.',
    },
    match_score: 78,
    skill_match_score: 75,
    experience_match_score: 82,
    explanation: 'Alex has solid frontend skills and meets the experience requirement. Limited TypeScript experience is a gap, but their strong JavaScript foundation suggests quick upskilling potential.',
    strengths: ['Strong JavaScript fundamentals', 'E-commerce domain experience', 'Growth trajectory'],
    gaps: ['Limited TypeScript experience', 'No GraphQL or Next.js exposure'],
    recommendation: 'Review',
    processed_at: '2024-01-28',
  },
  {
    id: 'c3',
    job_id: '1',
    resume_filename: 'michael_johnson.pdf',
    parsed_data: {
      name: 'Michael Johnson',
      email: 'm.johnson@email.com',
      skills: ['React', 'TypeScript', 'Redux', 'CSS', 'JavaScript', 'Jest'],
      experience_years: 5,
      education: ['BS Software Engineering - Georgia Tech'],
      roles: ['Senior Frontend Developer at Netflix', 'Frontend Engineer at Spotify'],
      summary: 'Performance-focused frontend engineer with streaming platform expertise.',
    },
    match_score: 88,
    skill_match_score: 90,
    experience_match_score: 85,
    explanation: 'Michael brings excellent React and TypeScript experience from high-scale streaming platforms. His focus on performance optimization aligns well with our needs.',
    strengths: ['Performance optimization expertise', 'High-scale application experience', 'Strong testing skills'],
    gaps: ['Less experience with Next.js'],
    recommendation: 'Shortlist',
    processed_at: '2024-01-28',
  },
  {
    id: 'c4',
    job_id: '1',
    resume_filename: 'emma_wilson.pdf',
    parsed_data: {
      name: 'Emma Wilson',
      email: 'emma.w@email.com',
      skills: ['HTML', 'CSS', 'jQuery', 'Bootstrap'],
      experience_years: 2,
      education: ['Bootcamp Graduate - General Assembly'],
      roles: ['Junior Web Developer at Local Agency'],
      summary: 'Entry-level developer transitioning from bootcamp.',
    },
    match_score: 32,
    skill_match_score: 25,
    experience_match_score: 40,
    explanation: 'Emma lacks the required React and TypeScript experience for this senior role. Consider for junior positions instead.',
    strengths: ['Eager to learn', 'Design sensibility'],
    gaps: ['No React experience', 'No TypeScript', 'Insufficient seniority', 'Limited professional experience'],
    recommendation: 'Reject',
    processed_at: '2024-01-28',
  },
];

export const mockDashboardStats: DashboardStats = {
  active_jobs: 3,
  total_resumes: 88,
  avg_match_score: 72,
  shortlisted: 24,
};
