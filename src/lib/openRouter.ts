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

Analyze the candidate based on:
1. Resume
2. Interview responses
3. Follow-up performance

IMPORTANT RULES:
- Follow-up answers are more important than initial answers.
- Be realistic and strict in evaluation.
- Keep all explanations concise and professional.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not add \`\`\`json.
- Ensure all strings are properly escaped.
- Keep summaries short.
- Keep question analysis brief (max 1 short sentence).
- ALL scores must be integers between 1 and 100.

SCORING GUIDE:
- 90-100 = Exceptional / expert-level
- 70-89 = Strong
- 50-69 = Average
- 30-49 = Weak
- Below 30 = Poor

Resume:
${resumeText}

Interview Data:
${JSON.stringify(interviewData)}

Return EXACTLY this JSON structure:

{
  "overallScore": 0,
  "technicalScore": 0,
  "communicationScore": 0,
  "confidenceScore": 0,
  "resumeConsistencyScore": 0,

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
      "score": 0
    }
  ],

  "finalVerdict": ""
}

STRICT RULES:
- Do not omit any field.
- Do not add extra fields.
- All arrays must contain concise items only.
- questionAnalysis.analysis must be very short.
- finalVerdict must be under 80 words.
`;

  try {
    const completion = await openrouter.chat.completions.create({
      model: "nvidia/nemotron-3-super-120b-a12b:free",

      messages: [
        {
          role: "system",
          content:
            "You are a strict interview evaluator. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.2,
      max_tokens: 4000,
    });
    const raw = completion.choices?.[0]?.message?.content;

    return raw;
  } catch (error: any) {
    console.error("OPENROUTER FULL ERROR:");

    // important
    console.error(error);

    // api response
    console.error(error?.response?.data);

    // message
    console.error(error?.message);

    return null;
  }
}
export function parseReport(raw: any) {
  try {
    if (!raw) {
      throw new Error("Empty response");
    }

    if (typeof raw !== "string") {
      raw = JSON.stringify(raw);
    }

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // detect truncation
    if (!cleaned.endsWith("}")) {
      console.error("JSON LOOKS TRUNCATED");
    }

    return JSON.parse(cleaned);
  } catch (error: any) {
    console.error("PARSE ERROR:");
    console.error(error.message);

    // very useful
    console.error("RAW THAT FAILED:");
    console.error(raw);

    return {
      Report: "",
      parseError: true,
      errorMessage: error.message,
    };
  }
}

export async function scoreAnswers(
  question: string,
  answer: string,
): Promise<{
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  strength: string;
  weakness: string;
}> {
  const prompt = `
You are an experienced software engineering interviewer.

Evaluate the candidate's answer objectively.

Return ONLY valid JSON.

{
  "overallScore": number,
  "technicalScore": number,
  "communicationScore": number,
  "strength": "...",
  "weakness": "..."
}

Scoring Guide

Overall & Technical
8-10:
- Accurate and complete
- Good reasoning
- Covers key concepts

5-7:
- Mostly correct
- Missing important details
- Minor misconceptions

0-4:
- Incorrect
- Major misconceptions
- Very incomplete

Communication
8-10:
- Clear and well-structured

5-7:
- Understandable but somewhat unclear

0-4:
- Difficult to follow or very vague

Rules

- strength: One short phrase (max 8 words).
- weakness: One short phrase (max 8 words).
- Be strict but fair.
- Do not invent mistakes.
- Return JSON only.

Question:
${question}

Answer:
${answer}
`;


  try {
    const completion = await openrouter.chat.completions.create({
      model: "nvidia/nemotron-3-super-120b-a12b:free",
      messages: [
        {
          role: "system",
          content: "Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_object",
      },
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error) {
    console.error("scoreAnswers error:", error);
    return {
      overallScore: 0,
      technicalScore: 0,
      communicationScore: 0,
      strength: "Error occurred while scoring the answer.",
      weakness: "Error occurred while scoring the answer.",
    }; // neutral fallback so follow-up still generates
  }
}
