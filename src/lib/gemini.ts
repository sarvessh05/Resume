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
  type: SchemaType.OBJECT,
  properties: {
    parsed_data: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING },
        email: { type: SchemaType.STRING },
        phone: { type: SchemaType.STRING },
        skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        experience_years: { type: SchemaType.NUMBER },
        education: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        roles: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        projects: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        summary: { type: SchemaType.STRING },
      },
      required: ["name", "email", "skills", "experience_years"],
    },
    match_score: { type: SchemaType.NUMBER },
    skill_match_score: { type: SchemaType.NUMBER },
    experience_match_score: { type: SchemaType.NUMBER },
    explanation: { type: SchemaType.STRING },
    strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    gaps: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    recommendation: { type: SchemaType.STRING },
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
  const modelNames = ["gemini-1.5-pro-latest", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-1.5-flash"];
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

      const prompt = `Analyze this resume against the job requirements.
      
      JOB: ${jobRequirements.title}
      REQUIRED SKILLS: ${jobRequirements.required_skills.join(', ')}
      EXPERIENCE NEEDED: ${jobRequirements.experience_min}-${jobRequirements.experience_max} years

      RESUME:
      ${resumeText}

      Return a JSON object matching this structure:
      {
        "parsed_data": { "name": "", "email": "", "phone": "", "skills": [], "experience_years": 0, "education": [], "roles": [], "projects": [], "summary": "" },
        "match_score": 0-100,
        "skill_match_score": 0-100,
        "experience_match_score": 0-100,
        "explanation": "",
        "strengths": [],
        "gaps": [],
        "recommendation": "Shortlist" | "Review" | "Reject"
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