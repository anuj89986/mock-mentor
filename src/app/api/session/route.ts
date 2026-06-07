import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";
import { NextResponse } from "next/server";
import DbConnect from "@/lib/dbConnect";
import SessionModel from "@/model/Session";
import "@/model/Report";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await DbConnect();
  const sessions = await SessionModel.find({ userId: session.user.id })
    .select("_id status createdAt report")
    .populate({
      path: "report",
      select:
        "overallScore technicalScore communicationScore confidenceScore resumeConsistencyScore -_id",
    });
  return NextResponse.json({ sessions }, { status: 200 });
}
