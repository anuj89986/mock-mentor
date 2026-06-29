import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite",
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

The interview has just started.

Your goal is to sound exactly like a real interviewer speaking naturally, not like an AI or someone reading a questionnaire.

Interview style: ${interviewStyle}

Style meanings:
- technical → coding, debugging, architecture, scalability, tech stack decisions
- behavioural → teamwork, ownership, communication, conflict, leadership
- mixed → combination of both

Instructions:
- Generate EXACTLY ONE question.
- Before asking the question, begin naturally like a real interviewer would.
- Examples of natural openings:
  - "Hi Anuj, thanks for joining today. Let's get started."
  - "Good to meet you. Hope you're doing well. Let's begin."
  - "Alright, thanks for being here. I'd like to start with something from your resume."
- Do NOT make the introduction longer than two short sentences.
- After the greeting, immediately transition into ONE specific question.
- The entire response (greeting + question) must be at most 45 words.
- The question itself must be at most 30 words.
- Ask only ONE thing.
- No follow-up questions.
- No explanations.
- No bullet points.
- No numbered lists.

QUESTION TYPE:
- Set "questionType" to "coding" ONLY if the candidate must write code or solve an algorithm.
- Otherwise use "verbal".

QUESTION QUALITY:
- Base the question on a SPECIFIC detail from the resume, not a generic topic.
- Match the candidate's experience level strictly from the resume.
- Avoid textbook questions.
- Sound conversational and slightly probing, like a real interviewer.
- Every generation should focus on a different resume detail so repeated interviews feel unique.

Return ONLY valid JSON.

Format:
{
  "questionText": "...",
  "questionType": "coding" | "verbal"
}

Resume:
${resumeText}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return text;
}

export async function generateNextQuestion(
  resumeText: string,
  interviewStyle: string,
  report: {
    overallScore: number;
    technicalScore: number;
    communicationScore: number;
    strength: string;
    weakness: string;
  },
  previousQuestions: string[],
) {
  // Map score to a difficulty band
  const difficulty =
  report.overallScore <= 4
    ? "Junior level. Test fundamentals before increasing complexity."
    : report.overallScore <= 7
    ? "Mid-level. Probe understanding with practical scenarios."
    : "Senior level. Ask challenging real-world and edge-case questions.";

const previous = previousQuestions.length
  ? previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")
  : "None";

const prompt = `
You are an experienced senior software engineer conducting a LIVE technical interview.

Your personality:
- Professional and formal.
- Calm, confident and natural.
- Speak exactly like a real interviewer.
- Never sound robotic or AI-generated.
- Use short transition phrases before asking the next question.

Possible transition examples:
- "Alright, that's good."
- "Makes sense."
- "Thanks for explaining that."
- "Okay, let's move on."
- "Interesting."
- "Good. Now I'd like to switch gears."
- "Let's discuss something different."
- "Alright, let's look at another area."

Never repeat the exact transition every time.

-------------------------
Candidate Resume
-------------------------
${resumeText}

-------------------------
Interview Style
-------------------------
${interviewStyle}

-------------------------
Current Evaluation
-------------------------
Overall Score: ${report.overallScore}/10
Technical Score: ${report.technicalScore}/10
Communication Score: ${report.communicationScore}/10

Candidate Strength:
${report.strength}

Candidate Weakness:
${report.weakness}

Difficulty Guidance:
${difficulty}

-------------------------
Questions Already Asked
-------------------------
${previous}

Your task:

Generate ONLY the NEXT interview question.

Requirements:

1. The question MUST be based primarily on the candidate's resume.
2. If a weakness was identified, occasionally ask a question that evaluates that area.
3. If a strength was identified, probe deeper into it instead of asking generic questions.
4. Do NOT repeat or closely resemble previous questions.
5. Mix resume discussion with practical software engineering questions naturally.
6. Only ask ONE question.
7. Maximum 40 words.
8. The interviewer should first say one short transition sentence and then ask the question.
9. The transition should sound exactly like a human interviewer speaking in a live interview.
10. Do NOT provide hints, explanations or solutions.

Question Type Rules:

Return "coding" if the candidate is expected to write code or solve an algorithm.

Return "verbal" if the candidate should explain a concept, architecture, design decision, project experience, debugging approach, trade-off, or behavioural scenario.

Return ONLY valid JSON.

{
  "questionText": "Alright, that's good. You mentioned using Redis for caching in your project. Why did you choose Redis over in-memory caching, and what trade-offs did you consider?",
  "questionType": "verbal"
}
`;

const result = await model.generateContent(prompt);
return result.response.text();
}

export async function generateFollowUp(
  originalQuestion: string,
  originalAnswer: string,
  followUpCount: number, // 0 or 1
  previousFollowUpQuestion: string,
  latestAnswer: string,
  score: {
    overallScore: number;
    technicalScore: number;
    communicationScore: number;
    strength: string;
    weakness: string;
  },
) {
  const prompt = `You are a senior software engineer conducting a LIVE technical interview.

Original question:
"${originalQuestion}"

Candidate's original answer:
"${originalAnswer}"

Previous follow-up:
"${previousFollowUpQuestion || "None"}"

Candidate's latest answer:
"${latestAnswer || originalAnswer}"

Evaluation:
- Overall Score: ${score.overallScore}
- Technical Score: ${score.technicalScore}
- Communication Score: ${score.communicationScore}
- Strength: "${score.strength}"
- Weakness: "${score.weakness}"

Current follow-up: ${followUpCount + 1} of 2

Your task:
* * Ask EXACTLY ONE short, natural follow-up question that continues the interview using the candidate's latest answer while staying focused on the original question.
* The question must sound like a spontaneous, spoken reaction in a real interview.
* Keep it concise: maximum 2 sentences, under 30 words.
* NEVER repeat a previous question. Dig deeper or pivot if they are stuck.
* Avoid robotic phrasing, corporate jargon, or textbook definitions.

Guidelines:
- - Base the question primarily on the candidate's latest answer, using the original answer and identified weakness as additional context.
- Use the score only to adjust difficulty.
- If Technical Score >= 8, ask an advanced question involving edge cases, optimization, scalability, trade-offs, or production scenarios.
- If Technical Score is 5-7, verify understanding or ask about the missing detail.
- If Technical Score < 5, ask a simpler conceptual question or pivot to a related fundamental topic.
- If Communication Score is low, keep the question short and direct.
- Never repeat the original question or any previous follow-up.
- Sound like a real interviewer, not an AI.
- Maximum 2 sentences.
- Under 30 words.

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
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [parsed];
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
