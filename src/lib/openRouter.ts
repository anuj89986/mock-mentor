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
You are an experienced Senior Software Engineer conducting a post-interview evaluation.

Your goal is to fairly evaluate a candidate based on their resume and interview performance.

## Evaluation Principles

- Be fair, balanced and professional.
- Reward demonstrated knowledge.
- Do not be overly strict.
- Do not be overly generous.
- Give credit for partially correct reasoning.
- Minor mistakes should only slightly reduce scores.
- Consider the entire interview, not just one answer.
- Follow-up responses should have a higher impact because they demonstrate deeper understanding.
- Assume this is an internship or entry-level software engineering interview unless the resume clearly indicates otherwise.

## Score Guidelines

95-100: Exceptional

90-94: Excellent

80-89: Strong

70-79: Good

60-69: Average

50-59: Below Average

Below 50: Poor

Scoring notes:

- Most competent internship candidates should naturally score between 70 and 85.
- Reserve 90+ for outstanding candidates.
- Reserve below 50 for candidates who struggled throughout the interview.
- Base scores only on demonstrated performance.

Evaluate:

- Technical knowledge
- Problem solving
- Communication
- Confidence
- Resume consistency
- Follow-up performance
- Practical software engineering understanding

Resume:

${resumeText}

Interview Data:

${JSON.stringify(interviewData)}

Return ONLY valid JSON.

Do not return markdown.

Return EXACTLY this schema:

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

Rules:

- Return ONLY the JSON object.
- Do not omit any field.
- Do not add extra fields.
- All scores must be integers between 1 and 100.
- strengths: 3-6 concise items.
- weaknesses: 2-5 concise items.
- improvements: actionable suggestions.
- summary: under 80 words.
- questionAnalysis.analysis: one short sentence (max 20 words).
- finalVerdict: under 80 words.
`;

  try {
    const completion = await openrouter.chat.completions.create({
      model: "nvidia/nemotron-3-super-120b-a12b:free",

      messages: [
        {
          role: "system",
          content:
            "You are an experienced software engineering interviewer. Evaluate candidates fairly and consistently. Return ONLY valid JSON.",
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
