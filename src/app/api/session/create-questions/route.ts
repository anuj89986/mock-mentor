export const runtime = "nodejs";

import dbConnect from "@/lib/dbConnect";
import { generateQuestions,parseQuestions } from "@/lib/gemini";
import { NextResponse } from "next/server";
import pdf from "pdf-parse/lib/pdf-parse.js";

export async function POST(req: Request) {
  dbConnect();
  const formData = await req.formData();
  const fileEntry = formData.get("resume") as File | null;

  if (!fileEntry) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (fileEntry.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Only PDF files are allowed" },
      { status: 400 }
    );
  }

    const buffer = Buffer.from(await fileEntry.arrayBuffer());
    const result = await pdf(buffer);
    if(!result.text || result.text.trim() === ""){
        return NextResponse.json({ error: "Unable to extract text from PDF" }, { status: 400 });
    }
  try {
    const questions = await generateQuestions(result.text);
    const parsedQuestions = await parseQuestions(questions);
    // SessionModel.create({})
    return NextResponse.json({ questions: parsedQuestions });
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json({ error: "Error generating questions" }, { status: 500 });
  }
}
