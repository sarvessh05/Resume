import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { ResumeAnalysis } from './groq';

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error('Missing Google API key');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Strict schema for structured data extraction
const schema = {
  description: "Resume analysis result",
  type: SchemaType.OBJECT as const,
  properties: {
    parsed_data: {
      type: SchemaType.OBJECT as const,
      properties: {
        name: { type: SchemaType.STRING as const },
        email: { type: SchemaType.STRING as const },
        phone: { type: SchemaType.STRING as const },
        skills: { type: SchemaType.ARRAY as const, items: { type: SchemaType.STRING as const } },
        experience_years: { type: SchemaType.NUMBER as const },
        education: { type: SchemaType.ARRAY as const, items: { type: SchemaType.STRING as const } },
        roles: { type: SchemaType.ARRAY as const, items: { type: SchemaType.STRING as const } },
        projects: { type: SchemaType.ARRAY as const, items: { type: SchemaType.STRING as const } },
        summary: { type: SchemaType.STRING as const },
      },
      required: ["name", "email", "skills", "experience_years"],
    },
    match_score: { type: SchemaType.NUMBER as const },
    skill_match_score: { type: SchemaType.NUMBER as const },
    experience_match_score: { type: SchemaType.NUMBER as const },
    explanation: { type: SchemaType.STRING as const },
    strengths: { type: SchemaType.ARRAY as const, items: { type: SchemaType.STRING as const } },
    gaps: { type: SchemaType.ARRAY as const, items: { type: SchemaType.STRING as const } },
    recommendation: { type: SchemaType.STRING as const },
  },
  required: ["parsed_data", "match_score", "recommendation"],
};

/**
 * Debug function to check which models are available for your API Key
 */
async function logAvailableModels() {
  try {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await resp.json();
    console.log("API Key Model Permissions:", data.models?.map((m: any) => m.name));
  } catch (e) {
    console.error("Could not list models", e);
  }
}

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
  await logAvailableModels();

  // List of models to try in order of preference
  const modelNames = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-2.0-flash-001"];
  let lastError: any = null;

  for (const modelName of modelNames) {
    try {
      console.log(`Attempting analysis with: ${modelName}`);

      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: modelName.includes("1.5") ? schema : undefined, // Schema only for 1.5+
          temperature: 0.1,
        },
      });

      const prompt = `You are an expert HR analyst. Analyze this resume against the job requirements and be FAIR in your assessment.

JOB TITLE: ${jobRequirements.title}
REQUIRED SKILLS: ${jobRequirements.required_skills.join(', ')}
OPTIONAL SKILLS: ${jobRequirements.optional_skills.join(', ')}
EXPERIENCE NEEDED: ${jobRequirements.experience_min}-${jobRequirements.experience_max} years

RESUME:
${resumeText}

IMPORTANT SCORING GUIDELINES:
- If the candidate has ALL required skills, skill_match_score should be 80-100
- If the candidate has MOST required skills (2 out of 3), skill_match_score should be 60-79
- Match skills flexibly (e.g., "Django" matches "Django", "Python/Django", "Django Framework")
- Consider related experience even if exact years don't match
- Overall match_score should reflect: 60% skills + 40% experience
- Recommendation: "Shortlist" if match_score >= 70, "Review" if 50-69, "Reject" if < 50

Return a JSON object matching this exact structure:
{
  "parsed_data": {
    "name": "Full name from resume",
    "email": "email@example.com",
    "phone": "phone number or empty string",
    "skills": ["list all technical skills found"],
    "experience_years": 0,
    "education": ["degrees and universities"],
    "roles": ["job titles and companies"],
    "projects": ["notable projects"],
    "summary": "brief professional summary"
  },
  "match_score": 0-100,
  "skill_match_score": 0-100,
  "experience_match_score": 0-100,
  "explanation": "Detailed explanation of the match assessment",
  "strengths": ["key strengths that match the job"],
  "gaps": ["missing skills or experience"],
  "recommendation": "Shortlist" or "Review" or "Reject"
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Handle potential markdown wrapping in older models
      const cleanJson = text.replace(/```json|```/gi, "").trim();
      const analysis: ResumeAnalysis = JSON.parse(cleanJson);

      console.log(`Success using ${modelName}`);
      return analysis;

    } catch (error: any) {
      console.warn(`${modelName} failed:`, error.message);
      lastError = error;
      // If it's a 404, the loop continues to the next model
      if (!error.message.includes("404")) break; 
    }
  }

  // Final fallback if all models fail
  console.error('All Gemini models failed:', lastError);
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
      summary: 'Connection error with Gemini API.',
    },
    match_score: 0,
    skill_match_score: 0,
    experience_match_score: 0,
    explanation: `API Error: ${lastError?.message || 'Unknown'}`,
    strengths: [],
    gaps: ['Check API Key permissions or regional availability.'],
    recommendation: 'Review',
  };
}