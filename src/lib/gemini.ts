import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ResumeAnalysis } from './groq';

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error('Missing Google API key');
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeResumeWithGemini(
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
  console.log(`🔷 Using Gemini for analysis: ${resumeText.length} characters`);

  const prompt = `You are an expert HR analyst. Analyze this resume against the job requirements.

JOB: ${jobRequirements.title}
REQUIRED SKILLS: ${jobRequirements.required_skills.join(', ')}
OPTIONAL SKILLS: ${jobRequirements.optional_skills.join(', ')}
EXPERIENCE NEEDED: ${jobRequirements.experience_min}-${jobRequirements.experience_max} years

RESUME:
${resumeText}

Analyze the candidate and return ONLY a JSON object with this exact structure:
{
  "parsed_data": {
    "name": "Full Name from resume",
    "email": "email@example.com",
    "phone": "phone number or empty string",
    "skills": ["skill1", "skill2", "skill3"],
    "experience_years": 5,
    "education": ["Degree - University"],
    "roles": ["Job Title at Company"],
    "projects": ["Notable project"],
    "summary": "Brief professional summary"
  },
  "match_score": 85,
  "skill_match_score": 90,
  "experience_match_score": 80,
  "explanation": "Detailed explanation of why this candidate matches or doesn't match",
  "strengths": ["Key strength 1", "Key strength 2"],
  "gaps": ["Missing skill or gap"],
  "recommendation": "Shortlist"
}

SCORING RULES:
- match_score: Overall fit (0-100)
- skill_match_score: How well skills match (0-100)
- experience_match_score: How well experience matches (0-100)
- recommendation: "Shortlist" (80+), "Review" (50-79), or "Reject" (<50)

Return ONLY the JSON object, no other text.`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 4000,
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log('✅ Gemini response received:', text.substring(0, 200) + '...');

    // Parse the JSON response
    const analysis: ResumeAnalysis = JSON.parse(text);

    // Validate required fields
    if (!analysis.parsed_data || typeof analysis.match_score !== 'number') {
      throw new Error('Invalid response structure from Gemini');
    }

    // Ensure recommendation is valid
    if (!['Shortlist', 'Review', 'Reject'].includes(analysis.recommendation)) {
      analysis.recommendation = 'Review';
    }

    console.log('✅ Analysis complete:', {
      name: analysis.parsed_data.name,
      score: analysis.match_score,
      recommendation: analysis.recommendation,
    });

    return analysis;
  } catch (error) {
    console.error('❌ Gemini analysis error:', error);

    // Return a fallback response
    return {
      parsed_data: {
        name: 'Candidate (Analysis Failed)',
        email: 'see-resume@example.com',
        phone: '',
        skills: ['See resume for details'],
        experience_years: 0,
        education: ['See resume'],
        roles: ['See resume'],
        projects: [],
        summary: 'Automatic analysis failed. Please review manually.',
      },
      match_score: 50,
      skill_match_score: 50,
      experience_match_score: 50,
      explanation: 'Unable to complete automatic analysis. Manual review recommended.',
      strengths: ['Manual review required'],
      gaps: ['Automatic analysis unavailable'],
      recommendation: 'Review',
    };
  }
}
