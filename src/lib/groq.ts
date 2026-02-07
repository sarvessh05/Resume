import Groq from 'groq-sdk';

const apiKey = import.meta.env.VITE_GROQ_API_KEY;

if (!apiKey) {
  throw new Error('Missing Groq API key');
}

export const groq = new Groq({
  apiKey,
  dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
});

export interface ResumeAnalysis {
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
}

export async function analyzeResume(
  resumeText: string,
  jobRequirements: {
    title: string;
    description: string;
    required_skills: string[];
    optional_skills: string[];
    experience_min: number;
    experience_max: number;
  }
): Promise<ResumeAnalysis> {
  const prompt = `You are an expert HR analyst. Analyze the following resume against the job requirements and provide a detailed assessment.

JOB REQUIREMENTS:
Title: ${jobRequirements.title}
Description: ${jobRequirements.description}
Required Skills: ${jobRequirements.required_skills.join(', ')}
Optional Skills: ${jobRequirements.optional_skills.join(', ')}
Experience Range: ${jobRequirements.experience_min}-${jobRequirements.experience_max} years

RESUME:
${resumeText}

Provide your analysis in the following JSON format:
{
  "parsed_data": {
    "name": "candidate name",
    "email": "email address",
    "phone": "phone number if available",
    "skills": ["skill1", "skill2", ...],
    "experience_years": number,
    "education": ["degree1", "degree2", ...],
    "roles": ["role1 at company1", "role2 at company2", ...],
    "projects": ["project1", "project2", ...],
    "summary": "brief professional summary"
  },
  "match_score": number (0-100),
  "skill_match_score": number (0-100),
  "experience_match_score": number (0-100),
  "explanation": "detailed explanation of the match",
  "strengths": ["strength1", "strength2", ...],
  "gaps": ["gap1", "gap2", ...],
  "recommendation": "Shortlist" | "Review" | "Reject"
}

Be thorough and objective in your analysis.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || '';
    
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const analysis: ResumeAnalysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
}
