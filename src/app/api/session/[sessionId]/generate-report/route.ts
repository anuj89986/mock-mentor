import { NextResponse } from "next/server";
import { generateReport, parseReport } from "@/lib/openRouter";
import SessionModel from "@/model/Session";
import ReportModel from "@/model/Report";
import "@/model/Resume";
import DbConnect from "@/lib/dbConnect";
export async function POST(request : Request ,  { params }: { params: Promise<{ sessionId: string }> }) {
    const { interviewData } = await request.json();
    if(!interviewData) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    await DbConnect();
    const { sessionId } = await params;
    const session = await SessionModel.findById(sessionId).populate('resumeId');
    if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    session.status = "completed";
    await session.save();

    const resumeText = (session?.resumeId as any)?.extractedText;
    if(!resumeText) {
        return NextResponse.json({ error: "Resume text not found" }, { status: 404 });
    }
    const report = await generateReport(resumeText, interviewData);
    if(!report) {
        return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
    }
    const cleanedReport = parseReport(report);
    const reportDoc = await ReportModel.create({
        sessionId,
        userId: session.userId,
        ...cleanedReport
    });

    session.report = reportDoc._id;
    await session.save();

    return NextResponse.json({ report : reportDoc }, { status: 200 });
}