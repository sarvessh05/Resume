import Groq from 'groq-sdk';
import { analyzeResumeWithGemini } from './gemini';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * Resume analysis result structure
 */
export interface ResumeAnalysis {
  parsed_data: {
    name: string;
    email: string;
    phone: string;
    skills: string[];
    experience_years: number;
    education: string[];
    roles: string[];
    projects: string[];
    summary: string;
  };
  match_score: number;
  skill_match_score: number;
  experience_match_score: number;
  explanation: string;
  strengths: string[];
  gaps: string[];
  recommendation: 'Shortlist' | 'Review' | 'Reject';
}

/**
 * Analyzes a resume using AI (Gemini primary, Groq fallback)
 * 
 * @param resumeText - Extracted text from resume
 * @param jobRequirements - Job requirements for matching
 * @returns Promise<ResumeAnalysis> - Structured analysis result
 */
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
  // Try Gemini first (handles long resumes better)
  try {
    return await analyzeResumeWithGemini(resumeText, jobRequirements);
  } catch (geminiError) {
    console.warn('Gemini failed, trying Groq as fallback...', geminiError);
    
    // Fallback to Groq for shorter resumes
    return await analyzeResumeWithGroq(resumeText, jobRequirements);
  }
}

/**
 * Analyzes resume using Groq AI (fallback option)
 * Truncates long resumes to fit token limits
 */
async function analyzeResumeWithGroq(
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
  // Truncate if too long (Groq has token limits)
  const truncatedResume = resumeText.length > 8000
    ? resumeText.substring(0, 8000) + '\n\n[Content truncated for processing...]'
    : resumeText;

  const prompt = `Job: ${jobRequirements.title}
Required: ${jobRequirements.required_skills.slice(0, 5).join(', ')}
Optional: ${jobRequirements.optional_skills?.slice(0, 3).join(', ') || 'None'}
Experience: ${jobRequirements.experience_min}-${jobRequirements.experience_max}y

Resume:
${truncatedResume}

SCORING: If candidate has all required skills, skill_match_score 80-100. Match skills flexibly. Shortlist if match_score >= 70.

Return JSON:
{"parsed_data":{"name":"","email":"","phone":"","skills":[],"experience_years":0,"education":[],"roles":[],"projects":[],"summary":""},"match_score":0,"skill_match_score":0,"experience_match_score":0,"explanation":"","strengths":[],"gaps":[],"recommendation":"Review"}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an HR analyst. Return valid JSON only. Be fair in scoring - if candidate has required skills, give high scores.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '';
    
    // Extract and parse JSON
    let jsonStr = content.trim();
    jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response - no JSON found');
    }

    try {
      const analysis: ResumeAnalysis = JSON.parse(jsonMatch[0]);
      
      if (!analysis.parsed_data || !analysis.match_score) {
        throw new Error('Invalid response structure');
      }
      
      return analysis;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse AI response - invalid JSON');
    }
  } catch (error) {
    console.error('Error analyzing resume:', error);
    
    // Token limit fallback - try with faster model
    if (error instanceof Error && error.message.includes('max completion tokens')) {
      try {
        const retryCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an HR analyst. Return valid JSON only.',
            },
            {
              role: 'user',
              content: prompt.substring(0, 4000),
            },
          ],
          model: 'llama-3.1-8b-instant',
          temperature: 0.1,
          max_tokens: 2000,
          response_format: { type: 'json_object' },
        });

        const retryContent = retryCompletion.choices[0]?.message?.content || '';
        const retryJson = retryContent.trim().replace(/```json\s*/g, '').replace(/```\s*/g, '');
        const retryMatch = retryJson.match(/\{[\s\S]*\}/);
        
        if (retryMatch) {
          return JSON.parse(retryMatch[0]);
        }
      } catch (retryError) {
        console.error('Retry also failed:', retryError);
      }
    }
    
    // Final fallback response
    return {
      parsed_data: {
        name: 'Analysis Failed',
        email: '',
        phone: '',
        skills: [],
        experience_years: 0,
        education: [],
        roles: [],
        projects: [],
        summary: 'Unable to analyze resume automatically.',
      },
      match_score: 50,
      skill_match_score: 50,
      experience_match_score: 50,
      explanation: 'Automatic analysis failed. Manual review recommended.',
      strengths: ['Manual review required'],
      gaps: ['Automatic analysis unavailable'],
      recommendation: 'Review',
    };
  }
}
