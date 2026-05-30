import { NextResponse } from "next/server";
import ReportModel from "@/model/Report";
import "@/model/Resume";
import DbConnect from "@/lib/dbConnect";

export async function GET(request : Request ,  { params }: { params: Promise<{ sessionId: string }> }) {
    const { sessionId } = await params;
    await DbConnect();
    const report = await ReportModel.findOne({ sessionId });
    if (!report) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    return NextResponse.json({ report }, { status: 200 });
}