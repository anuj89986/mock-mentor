import OpenAI from "openai";

export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,

  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "AI Interview App",
  },
});

export async function generateReport(resumeText: string, interviewData: any) {
  const prompt = `
You are an expert AI interview evaluator.

Analyze the candidate deeply based on:
1. Resume
2. Interview responses
3. Follow-up performance

Follow-up questions are more important because they test depth.

Evaluate:
- technical skills
- communication
- confidence
- practical knowledge
- consistency with resume
- depth of understanding
- problem solving ability

IMPORTANT:
- ALL scores must be integers between 1 and 100.
- Never return scores in 1-10 scale.
- Use realistic evaluation scoring.
- 100 means exceptional/expert-level performance.
- 50 means average.
- Below 30 means poor performance.

Resume:
${resumeText}

Interview Data:
${JSON.stringify(interviewData)}

Return STRICT JSON ONLY.

Return format:

{
  "overallScore": number,
  "technicalScore": number,
  "communicationScore": number,
  "confidenceScore": number,
  "resumeConsistencyScore": number,

  "strengths": [],

  "weaknesses": [],

  "summary": "",

  "hireRecommendation": {
    "decision": "",
    "level": "",
    "recommendedConfidence": 0
  },

  "improvements": [],

  "resumeAnalysis": {
    "claimedSkills": [],
    "validatedSkills": [],
    "missingDepthAreas": [],
    "strongAreas": []
  },

  "questionAnalysis": [
    {
      "question": "",
      "questionType": "",
      "analysis": "",
      "score": number
    }
  ],

  "finalVerdict": ""
}
`;
  try {
    const completion = await openrouter.chat.completions.create({
      model: "nvidia/nemotron-3-super-120b-a12b:free",

      messages: [
        {
          role: "system",
          content: "You are a strict interview evaluator.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.3,
      max_tokens: 3000,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenRouter Error:", error);
    return null;
  }
}
export function parseReport(raw: string) {
  try {
    if(typeof raw !== "string") {
      raw = JSON.stringify(raw);
    }
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Report Parse Error:", error);
    return { Report: "" };
  }
}
