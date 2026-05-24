import { NextResponse } from "next/server";
import { generateFollowUp } from "@/lib/gemini";
import DbConnect from "@/lib/dbConnect";
import { parseFollowUp } from "@/lib/gemini";

export async function POST(req : Request ) {
    const { originalQuestion, userAnswer, followUpCount } = await req.json();
    if(!originalQuestion || !userAnswer) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if(followUpCount === undefined || followUpCount < 0 || followUpCount > 2) {
        return NextResponse.json({ error: "Invalid follow-up count" }, { status: 400 });
    }
    await DbConnect();
    const followUpQuestion = await generateFollowUp(originalQuestion, userAnswer, followUpCount);
    if(!followUpQuestion) {
        return NextResponse.json({ error: "Failed to generate follow-up question" }, { status: 500 });
    }
    const cleanedFollowUp = parseFollowUp(followUpQuestion);
    return NextResponse.json({ followUpQuestion : cleanedFollowUp });
}