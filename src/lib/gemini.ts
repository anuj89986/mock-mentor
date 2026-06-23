import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.85,
    responseMimeType: "application/json",
  },
});

export async function generateQuestions(
  resumeText: string,
  interviewStyle: string,
) {
  const prompt = `You are a strict, experienced industry interviewer conducting a LIVE interview.

Your questions must sound like spontaneous, spoken conversation, NOT written paragraphs or textbook definitions.

Interview style: ${interviewStyle}

Style meanings:
* technical → coding, debugging, scalability, architecture, specific tech stack decisions
* behavioural → teamwork, communication, ownership, navigating failures or tight deadlines
* mixed → combination of both

Instructions:
* Generate EXACTLY 2 questions.
* Keep each question SHORT. Maximum 2 sentences and 35 words per question.
* Questions must sound natural when spoken aloud. Use conversational fillers or brief acknowledgments.
* Avoid long explanations, AI-style wording, or robotic phrasing.
* Ask only ONE main thing at a time. No multi-part questions.
* Match the candidate's experience level based strictly on the resume.

QUESTION TYPE DEFINITIONS:
* Set "questionType" to "coding" ONLY IF the question requires the candidate to write actual code or solve an algorithm.
* Set "questionType" to "verbal" IF the question is conceptual, architectural, behavioural, or just requires a spoken explanation.

VARIETY & RANDOMIZATION (CRITICAL):
* Even if the resume and style inputs are identical to previous runs, you MUST ask completely different questions. 
* To do this, randomly select a DIFFERENT, highly specific focal point (a minor project detail, a specific library mentioned, a distinct bullet point) rather than asking general overview questions.

FLOW & TONE:
* Start question 1 with a short, professional greeting and immediately dive into a specific resume detail.
* Start question 2 with a natural, slightly skeptical, or probing transition based on how an interviewer might react.

Examples of GOOD style:
* "Hi Anuj, thanks for joining. I was looking at the medical portal project on your resume—why did you specifically choose Node.js for the backend?"
* "Alright, fair enough. But what would happen to that system if traffic suddenly spiked by 10x?"
* "Okay, let's pivot. Tell me about a time you strongly disagreed with a team member on a technical approach."
* "Interesting. Walk me through the exact steps you took to debug that routing issue."

Examples of BAD style:
* "Can you explain the architecture, scalability, optimization, authentication strategy, and deployment workflow..." (Too long, multi-part)
* "What are the four pillars of object-oriented programming?" (Too textbook)

Return ONLY valid JSON.

Format:
[
  {
    "questionNumber": 1,
    "questionText": "...",
    "questionType": "coding" | "verbal"
  },
  {
    "questionNumber": 2,
    "questionText": "...",
    "questionType": "coding" | "verbal"
  }
]

Resume:${resumeText}

`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return text;
}

export async function generateFollowUp(
  originalQuestion: string,
  userAnswer: string,
  followUpCount: number, // 0 or 1
  previousFollowUpQuestion: string,
  previousFollowUpAnswer: string,
  score: number
) {
  const prompt = `You are a strict, experienced industry interviewer conducting a LIVE interview.

Original question:
"${originalQuestion}"

Candidate's latest answer:
"${userAnswer}"

Previous context (if any):
- Prior follow-up asked: "${previousFollowUpQuestion || "None"}"
- Candidate's prior answer: "${previousFollowUpAnswer || "None"}"

Current follow-up number: ${followUpCount + 1} of 2

Your task:
* Ask EXACTLY ONE short, natural follow-up question based on the candidate's LATEST answer.
* The question must sound like a spontaneous, spoken reaction in a real interview.
* Keep it concise: maximum 2 sentences, under 30 words.
* NEVER repeat a previous question. Dig deeper or pivot if they are stuck.
* Avoid robotic phrasing, corporate jargon, or textbook definitions.

QUESTION TYPE DEFINITIONS:
* Set "followUpType" to "coding" ONLY IF you are explicitly asking them to write code, solve an algorithm, or type out an implementation based on their answer.
* Set "followUpType" to "verbal" IF you are asking for reasoning, architecture, clarification, or testing their conceptual knowledge.

CONVERSATIONAL BEHAVIOR:
* If the answer is strong: Briefly acknowledge and test the limits. 
  Example: "Makes sense. But how would that logic hold up if the database went down?"
* If the answer is weak/confused: Challenge them naturally. 
  Example: "I'm not fully following your routing logic there. Can you clarify how the data actually moves?"
* If the candidate doesn't know: Respond professionally and pivot to a related concept. 
  Example: "No worries. Let's step back—how would you approach it if you didn't have to use that specific library?"

Return ONLY valid JSON.

Format:
{
  "followUpQuestion": "...",
  "followUpType": "coding" | "verbal"
}

Rules:
* No markdown
* No explanation
* No extra text
* Strictly valid JSON
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
    return { followUpQuestion: "", followUpType: "verbal" };
  }
}
