import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
});

export async function generateQuestions(resumeText: string, interviewStyle: string) {
  const prompt = `
You are a strict interviewer.

Based on the resume below, infer:
- The candidate's role and seniority level
- Their tech stack and strengths
- Appropriate difficulty bar

Interview style requested: ${interviewStyle}
- "technical": hard skills, tools, architecture
- "behavioural": past experiences, teamwork, leadership  
- "mixed": balance of both

Generate exactly 2 questions tailored to this specific candidate.

Return ONLY JSON:
[{ "questionNumber": 1, "questionText": "..." }]

Rules:
- No explanation
- No extra text
- Strictly valid JSON

Resume:
${resumeText}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return text;
}

export async function generateFollowUp(
  originalQuestion: string,
  userAnswer: string,
  followUpCount: number, // 0 or 1
) {
  const prompt = `
You are a strict technical interviewer.

Original question: "${originalQuestion}"
Candidate's answer: "${userAnswer}"
Follow-up number: ${followUpCount + 1} of 2

Your job:
- Ask exactly ONE sharp follow-up question that digs deeper into their answer

Return ONLY JSON in this format:
{
  "followUpQuestion": "..."
}

Rules:
- No explanation
- No extra text  
- Strictly valid JSON
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return text;
}

export function parseQuestions(raw: string) {
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Parse Error:", error);
    return [];
  }
}

export function parseFollowUp(raw: string) {
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Follow-up Parse Error:", error);
    return { followUpQuestion: "" };
  }
}
