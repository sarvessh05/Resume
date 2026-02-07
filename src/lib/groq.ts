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
  // Truncate resume text if too long (keep first 8000 chars for context)
  const maxResumeLength = 8000;
  const truncatedResume = resumeText.length > maxResumeLength 
    ? resumeText.substring(0, maxResumeLength) + '\n\n[Resume truncated for analysis...]'
    : resumeText;

  console.log(`Analyzing resume: ${truncatedResume.length} characters (original: ${resumeText.length})`);

  const prompt = `Analyze this resume for the job: ${jobRequirements.title}

REQUIRED SKILLS: ${jobRequirements.required_skills.join(', ')}
OPTIONAL SKILLS: ${jobRequirements.optional_skills.join(', ')}
EXPERIENCE: ${jobRequirements.experience_min}-${jobRequirements.experience_max} years

RESUME:
${truncatedResume}

Return ONLY valid JSON with this exact structure:
{
  "parsed_data": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "phone or empty string",
    "skills": ["skill1", "skill2"],
    "experience_years": 5,
    "education": ["degree1"],
    "roles": ["Job Title at Company"],
    "projects": ["project1"],
    "summary": "Brief summary"
  },
  "match_score": 85,
  "skill_match_score": 90,
  "experience_match_score": 80,
  "explanation": "Brief explanation of match",
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1"],
  "recommendation": "Shortlist"
}

Use "Shortlist" (80+), "Review" (50-79), or "Reject" (<50) for recommendation.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert HR analyst. Respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 3000, // Increased from 2000
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '';
    console.log('Groq AI Response:', content);
    
    // Try to extract JSON from the response
    let jsonStr = content.trim();
    
    // Remove markdown code blocks if present
    jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find JSON object
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', content);
      throw new Error('Failed to parse AI response - no JSON found');
    }

    try {
      const analysis: ResumeAnalysis = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!analysis.parsed_data || !analysis.match_score) {
        throw new Error('Invalid response structure');
      }
      
      return analysis;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Attempted to parse:', jsonMatch[0]);
      throw new Error('Failed to parse AI response - invalid JSON');
    }
  } catch (error) {
    console.error('Error analyzing resume:', error);
    
    // Return a fallback response instead of failing completely
    if (error instanceof Error && error.message.includes('parse')) {
      console.warn('Using fallback analysis due to parse error');
      return {
        parsed_data: {
          name: 'Unknown Candidate',
          email: 'not-found@example.com',
          skills: ['Unable to parse'],
          experience_years: 0,
          education: ['Unable to parse'],
          roles: ['Unable to parse'],
        },
        match_score: 50,
        skill_match_score: 50,
        experience_match_score: 50,
        explanation: 'Unable to fully analyze resume due to parsing error. Please review manually.',
        strengths: ['Manual review required'],
        gaps: ['Unable to analyze automatically'],
        recommendation: 'Review',
      };
    }
    
    throw error;
  }
}
