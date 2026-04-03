import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview", 

});

export async function generateQuestions(resumeText: string) {
  const prompt = `
You are an AI interviewer.

Based on the resume below, generate exactly 5 interview questions.

Return ONLY JSON in this format:
[
  {
    "questionNumber": 1,
    "questionText": "..."
  }
]

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

export function parseQuestions(raw: string) {
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Parse Error:", error);
    return [];
  }
}