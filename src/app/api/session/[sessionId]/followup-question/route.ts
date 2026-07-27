import { NextResponse } from "next/server";
import { generateFollowUp, parseFollowUp } from "@/lib/gemini";
import DbConnect from "@/lib/dbConnect";
import { scoreAnswers } from "@/lib/openRouter";
import { withTimeout } from "@/lib/retry";

export async function POST(req: Request) {
  const { originalQuestion, originalAnswer, followUpCount, previousFollowUpQuestion, latestAnswer } = await req.json();

  if (!originalQuestion || !originalAnswer) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (followUpCount === undefined || followUpCount < 0 || followUpCount > 2) {
    return NextResponse.json({ error: "Invalid follow-up count" }, { status: 400 });
  }

  await DbConnect();

  try {
    const scoreData = await withTimeout(
      scoreAnswers(
        followUpCount === 0 ? originalQuestion : previousFollowUpQuestion,
        followUpCount === 0 ? originalAnswer : latestAnswer,
      ),
      15000,
    );

    const followUpQuestion = await withTimeout(
      generateFollowUp(originalQuestion, originalAnswer, followUpCount, previousFollowUpQuestion, latestAnswer, scoreData),
      20000,
    );

    if (!followUpQuestion) {
      return NextResponse.json({ error: "Failed to generate follow-up question" }, { status: 503 });
    }

    return NextResponse.json({ followUpQuestion: parseFollowUp(followUpQuestion), score: scoreData });
  } catch (error) {
    console.error("followup-question error:", error);
    return NextResponse.json({ error: "AI didn't respond in time, please retry" }, { status: 503 });
  }
}