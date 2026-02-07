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
  // Truncate resume text if too long (keep first 4000 chars for context)
  const maxResumeLength = 4000; // Reduced from 8000 to leave more room for output
  const truncatedResume = resumeText.length > maxResumeLength 
    ? resumeText.substring(0, maxResumeLength) + '\n[Truncated]'
    : resumeText;

  console.log(`Analyzing resume: ${truncatedResume.length} characters (original: ${resumeText.length})`);

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
    
    // If token limit error, try with even shorter resume
    if (error instanceof Error && error.message.includes('max completion tokens')) {
      console.warn('Token limit reached, trying with shorter resume...');
      
      try {
        // Try again with much shorter resume
        const veryShortResume = resumeText.substring(0, 2000);
        const shortPrompt = `Job: ${jobRequirements.title}
Skills: ${jobRequirements.required_skills.slice(0, 3).join(', ')}

Resume (excerpt):
${veryShortResume}

Return JSON with: name, email, skills array, experience_years, match_score (0-100), recommendation ("Shortlist"/"Review"/"Reject")`;

        const retryCompletion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: 'Return JSON only.' },
            { role: 'user', content: shortPrompt },
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.1,
          max_tokens: 2000,
          response_format: { type: 'json_object' },
        });

        const retryContent = retryCompletion.choices[0]?.message?.content || '';
        const retryJson = JSON.parse(retryContent);
        
        // Map to our structure
        return {
          parsed_data: {
            name: retryJson.name || 'Unknown',
            email: retryJson.email || 'not-found@example.com',
            phone: retryJson.phone || '',
            skills: retryJson.skills || [],
            experience_years: retryJson.experience_years || 0,
            education: retryJson.education || [],
            roles: retryJson.roles || [],
            projects: retryJson.projects || [],
            summary: retryJson.summary || '',
          },
          match_score: retryJson.match_score || 50,
          skill_match_score: retryJson.skill_match_score || 50,
          experience_match_score: retryJson.experience_match_score || 50,
          explanation: retryJson.explanation || 'Analyzed with reduced context due to length.',
          strengths: retryJson.strengths || ['See resume for details'],
          gaps: retryJson.gaps || ['Manual review recommended'],
          recommendation: retryJson.recommendation || 'Review',
        };
      } catch (retryError) {
        console.error('Retry also failed:', retryError);
        // Fall through to fallback below
      }
    }
    
    // Return a fallback response instead of failing completely
    if (error instanceof Error && (error.message.includes('parse') || error.message.includes('token'))) {
      console.warn('Using fallback analysis due to error');
      return {
        parsed_data: {
          name: 'Candidate (Review Required)',
          email: 'review-required@example.com',
          skills: ['Unable to parse - manual review needed'],
          experience_years: 0,
          education: ['See resume'],
          roles: ['See resume'],
        },
        match_score: 50,
        skill_match_score: 50,
        experience_match_score: 50,
        explanation: 'Unable to fully analyze resume automatically. Manual review recommended.',
        strengths: ['Manual review required'],
        gaps: ['Unable to analyze automatically'],
        recommendation: 'Review',
      };
    }
    
    throw error;
  }
}
