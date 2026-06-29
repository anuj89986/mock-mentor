import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import  authOption from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import SessionModel from "@/model/Session";
import ResumeModel from "@/model/Resume";
import { generateNextQuestion } from "@/lib/gemini";

export async function POST(request: Request) {
  // const session = await getServerSession(authOption);
  // if (!session) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  const { sessionId, sessionScore } = await request.json();
  if (!sessionId || sessionScore === undefined) {
    return NextResponse.json(
      { error: "Missing sessionId or sessionScore" },
      { status: 400 },
    );
  }

  await dbConnect();

  const interviewSession = await SessionModel.findById(sessionId);
  if (!interviewSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const resume = await ResumeModel.findById(interviewSession.resumeId);
  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const previousQuestions: string[] = [
    ...(interviewSession.initialQuestions?.map((q: any) => q.questionText) ?? []),
    ...(interviewSession.dynamicQuestions?.map((q: any) => q.questionText) ?? []),
  ];

  const raw = await generateNextQuestion(
    resume.extractedText,
    interviewSession.interviewStyle,
    sessionScore,
    previousQuestions,
  );

  let parsed: { questionText: string; questionType: "coding" | "verbal" };
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse generated question" },
      { status: 500 },
    );
  }

  // Optionally persist the dynamic question on the session for dedup later
  await SessionModel.findByIdAndUpdate(sessionId, {
    $push: { dynamicQuestions: parsed },
  });
  console.log("Session ID:", sessionId);
  return NextResponse.json({ question: parsed });
}