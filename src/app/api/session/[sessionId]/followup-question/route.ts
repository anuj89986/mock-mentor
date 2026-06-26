import { NextResponse } from "next/server";
import { generateFollowUp } from "@/lib/gemini";
import DbConnect from "@/lib/dbConnect";
import { parseFollowUp } from "@/lib/gemini";
import { scoreAnswers } from "@/lib/openRouter";

export async function POST(req : Request ) {
    const { originalQuestion, originalAnswer, followUpCount ,previousFollowUpQuestion, latestAnswer } = await req.json();
    if(!originalQuestion || !originalAnswer) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if(followUpCount === undefined || followUpCount < 0 || followUpCount > 2) {
        return NextResponse.json({ error: "Invalid follow-up count" }, { status: 400 });
    }
    await DbConnect();
    const scoreData = await scoreAnswers(followUpCount === 0 ? originalQuestion : previousFollowUpQuestion,followUpCount === 0 ? originalAnswer : latestAnswer);
    const followUpQuestion = await generateFollowUp(originalQuestion, originalAnswer, followUpCount, previousFollowUpQuestion, latestAnswer, scoreData);
    if(!followUpQuestion) {
        return NextResponse.json({ error: "Failed to generate follow-up question" }, { status: 500 });
    }
    const cleanedFollowUp = parseFollowUp(followUpQuestion);
    return NextResponse.json({ followUpQuestion : cleanedFollowUp, score : scoreData });
}