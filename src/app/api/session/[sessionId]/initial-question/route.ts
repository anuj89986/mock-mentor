import dbConnect from "@/lib/dbConnect";
import SessionModel from "@/model/Session";
import { NextResponse } from "next/server";

export async function GET(req : Request, { params }: { params: Promise<{ sessionId: string }> }) {
    const { sessionId } = await params;
    dbConnect();
    const session = await SessionModel.findById(sessionId);
    if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    return NextResponse.json({ initialQuestions: session.initialQuestions });
}
