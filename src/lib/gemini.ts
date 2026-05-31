import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
});

export async function generateQuestions(resumeText: string, interviewStyle: string) {
  const prompt = `
You are a strict interviewer conducting a LIVE interview.

Your questions must sound like spoken conversation, NOT written paragraphs.

Interview style: ${interviewStyle}

Style meanings:

* technical → coding, projects, debugging, scalability, architecture
* behavioural → teamwork, communication, ownership, challenges
* mixed → combination of both

Instructions:

* Generate EXACTLY 2 questions
* Keep each question SHORT
* Maximum 2 sentences per question
* Maximum 35 words per question
* Questions must sound natural when spoken aloud
* Avoid long explanations
* Avoid AI-style wording
* Avoid textbook phrasing
* Questions should feel like a real interviewer talking live

VERY IMPORTANT:

* Start question 1 with a short greeting
* Start question 2 with a natural transition/reaction
* The interviewer should react briefly before moving ahead

Examples of GOOD style:

* "Hi Anuj, thanks for joining. Can you walk me through your bank project?"
* "Alright, that makes sense. How did you handle authentication there?"
* "Okay, let's move to the next one. Why did you choose MongoDB?"
* "Interesting. What would break first if traffic suddenly increased?"

Examples of BAD style:

* "Can you explain the architecture, scalability, optimization, authentication strategy, and deployment workflow..."
* Long multi-part questions
* Robotic formal wording

Questions must:

* Match the candidate's experience level
* Be based on the resume/projects
* Feel slightly strict but realistic
* Ask only ONE main thing at a time

Return ONLY valid JSON.

Format:
[
{
"questionNumber": 1,
"questionText": "..."
},
{
"questionNumber": 2,
"questionText": "..."
}
]

Rules:

* No markdown
* No explanation
* No extra text
* Strictly valid JSON

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
  previousFollowUpQuestion: string,
  previousFollowUpAnswer: string
) {
  const prompt = `
You are a strict but realistic interviewer conducting a live interview.

Original question:
"${originalQuestion}"

Candidate answer:
"${userAnswer}"

Previous follow-up question:
"${previousFollowUpQuestion || ""}"

Previous follow-up answer:
"${previousFollowUpAnswer || ""}"

Current follow-up number:
${followUpCount + 1} of 2

Your task:

* Ask EXACTLY ONE short and natural follow-up question
* Make it feel like a real interviewer speaking live
* Dig deeper based on the candidate's latest response
* Keep the question concise
* Avoid robotic or overly formal wording

Conversation behavior:

* If the answer is strong:
  briefly acknowledge and go deeper

Examples:

* "Good. Why did you choose that?"

* "Alright. How would that scale?"

* "Makes sense. What if traffic doubles?"

* If the answer is weak/confused:
  challenge or clarify naturally

Examples:

* "Can you explain that a bit better?"

* "Why exactly would that happen?"

* "I'm not fully convinced. Can you justify it?"

* If the candidate says they don't know:
  respond professionally and move on

Examples:

* "That's okay. Then how would you approach it?"
* "No worries. What would you try first?"
* "Alright, let's think through it together."

Return ONLY valid JSON.

Format:
{
"followUpQuestion": "..."
}

Rules:

* Question must sound human
* Keep it short
* No explanation
* No markdown
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
    return { followUpQuestion: "" };
  }
}
