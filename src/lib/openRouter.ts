import OpenAI from "openai";

let openrouter: OpenAI | null = null;

export function getOpenRouter() {
  if (!openrouter) {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not set");
    }

    openrouter = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
      defaultHeaders: {
        "HTTP-Referer": "http://mock-mentor-production.up.railway.app",
        "X-Title": "AI Interview App",
      },
    });
  }

  return openrouter;
}

export async function generateReport(resumeText: string, interviewData: any) {
  const prompt = `
You are a Senior Software Engineer evaluating an internship-level interview.

Evaluate the candidate fairly based on the resume and interview.

Guidelines:
- Be balanced and professional.
- Reward demonstrated knowledge.
- Give partial credit where appropriate.
- Follow-up answers should influence the evaluation.
- Most good candidates should score between 70 and 85.
- Reserve 90+ for exceptional performance.

Evaluate:
- Technical knowledge
- Problem solving
- Communication
- Confidence
- Resume consistency

Resume:

${resumeText}

Interview Data:

${JSON.stringify(interviewData)}

Return ONLY valid JSON.

{
  "overallScore": 0,
  "technicalScore": 0,
  "communicationScore": 0,
  "confidenceScore": 0,
  "resumeConsistencyScore": 0,

  "strengths": [],

  "weaknesses": [],

  "summary": "",

  "improvements": []
}

Rules:
- Return only the JSON object.
- Do not add extra fields.
- All scores must be integers from 1-100.
- strengths: 3-5 concise points.
- weaknesses: 2-4 concise points.
- improvements: 3-5 actionable suggestions.
- summary: under 80 words.
`;

  try {
    const openrouter = getOpenRouter();
    const completion = await openrouter.chat.completions.create({
      model: "nvidia/nemotron-3-ultra-550b-a55b:free",

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
      max_tokens: 5000,
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
    const openrouter = getOpenRouter();
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
