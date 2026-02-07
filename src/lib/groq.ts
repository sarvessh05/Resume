import Groq from 'groq-sdk';
import { analyzeResumeWithGemini } from './gemini';

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
  // Use Gemini as primary (handles long resumes better)
  console.log(`Resume length: ${resumeText.length} characters`);
  
  try {
    // Try Gemini first (better for long documents)
    return await analyzeResumeWithGemini(resumeText, jobRequirements);
  } catch (geminiError) {
    console.warn('Gemini failed, trying Groq as fallback...', geminiError);
    
    // Fallback to Groq for shorter resumes
    return await analyzeResumeWithGroq(resumeText, jobRequirements);
  }
}

// Groq implementation (now as fallback)
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
  // Truncate resume text if too long (keep first 4000 chars for context)
  const maxResumeLength = 4000;
  const truncatedResume = resumeText.length > maxResumeLength 
    ? resumeText.substring(0, maxResumeLength) + '\n[Truncated]'
    : resumeText;

  console.log(`Using Groq: ${truncatedResume.length} characters (original: ${resumeText.length})`);

  // Very concise prompt to save tokens
  const prompt = `Job: ${jobRequirements.title}
Required: ${jobRequirements.required_skills.slice(0, 5).join(', ')}
Experience: ${jobRequirements.experience_min}-${jobRequirements.experience_max}y

Resume:
${truncatedResume}

Return JSON:
{"parsed_data":{"name":"","email":"","phone":"","skills":[],"experience_years":0,"education":[],"roles":[],"projects":[],"summary":""},"match_score":0,"skill_match_score":0,"experience_match_score":0,"explanation":"","strengths":[],"gaps":[],"recommendation":"Review"}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an HR analyst. Return valid JSON only. Be concise.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1, // Lower temperature for more focused output
      max_tokens: 4000, // Increased significantly
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
    
    // If token limit error, try with faster model and shorter resume
    if (error instanceof Error && error.message.includes('max completion tokens')) {
      console.warn('Token limit reached, trying with faster model...');
      
      try {
        // Try again with much shorter resume and faster model
        const veryShortResume = resumeText.substring(0, 1500);
        const shortPrompt = `Analyze resume for: ${jobRequirements.title}

Resume:
${veryShortResume}

Return JSON: {"name":"","email":"","skills":[],"experience_years":0,"match_score":50,"recommendation":"Review"}`;

        const retryCompletion = await groq.chat.completions.create({
          messages: [
            { role: 'user', content: shortPrompt },
          ],
          model: 'llama-3.1-8b-instant', // Faster, smaller model
          temperature: 0.1,
          max_tokens: 1000,
        });

        const retryContent = retryCompletion.choices[0]?.message?.content || '{}';
        
        // Try to parse JSON from response
        let retryJson;
        try {
          const jsonMatch = retryContent.match(/\{[\s\S]*\}/);
          retryJson = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
        } catch {
          retryJson = {};
        }
        
        // Map to our structure with defaults
        return {
          parsed_data: {
            name: retryJson.name || 'Candidate (Auto-analyzed)',
            email: retryJson.email || 'see-resume@example.com',
            phone: '',
            skills: Array.isArray(retryJson.skills) ? retryJson.skills : ['See resume'],
            experience_years: retryJson.experience_years || 0,
            education: ['See resume'],
            roles: ['See resume'],
            projects: [],
            summary: 'Analyzed with reduced context',
          },
          match_score: retryJson.match_score || 50,
          skill_match_score: 50,
          experience_match_score: 50,
          explanation: 'Analyzed with reduced context due to resume length. Manual review recommended for detailed assessment.',
          strengths: ['See full resume for details'],
          gaps: ['Manual review recommended'],
          recommendation: retryJson.recommendation || 'Review',
        };
      } catch (retryError) {
        console.error('Retry also failed:', retryError);
        // Fall through to fallback below
      }
    }
    
    // Return a fallback response instead of failing completely
    console.warn('Using fallback analysis');
    return {
      parsed_data: {
        name: 'Candidate (Review Required)',
        email: 'review-required@example.com',
        phone: '',
        skills: ['Manual review needed'],
        experience_years: 0,
        education: ['See resume'],
        roles: ['See resume'],
        projects: [],
        summary: '',
      },
      match_score: 50,
      skill_match_score: 50,
      experience_match_score: 50,
      explanation: 'Resume uploaded successfully. Automatic analysis unavailable - manual review recommended.',
      strengths: ['Manual review required'],
      gaps: ['Automatic analysis unavailable'],
      recommendation: 'Review',
    };
  }
}
