import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import authOptions from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import SessionModel from "@/model/Session";
import { generateQuestions, parseQuestions } from "@/lib/gemini";
import ResumeModel from "@/model/Resume";

export async function POST(request: Request) {
  const { interviewStyle, resumeId } = await request.json();
  const session = await getServerSession(authOptions);
  connectDB();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!interviewStyle || !resumeId) {
    return NextResponse.json(
      { error: "Missing interviewStyle or resumeId" },
      { status: 400 },
    );
  }
  const userId = session?.user?.id.toString();
  const resume = await ResumeModel.findById(resumeId);
  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }
  const questions = await generateQuestions(
    resume.extractedText,
    interviewStyle,
  );
  const parsedQuestions = await parseQuestions(questions);

  const newSession = await SessionModel.create({
    interviewStyle,
    resumeId,
    userId,
    initialQuestions: parsedQuestions,
  });
  if (!newSession) {
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  }
  return NextResponse.json(
    { sessionId: newSession._id.toString() },
    { status: 201 },
  );
}
