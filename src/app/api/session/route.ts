import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";
import { NextResponse } from "next/server";
import DbConnect from "@/lib/dbConnect";
import SessionModel from "@/model/Session";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
     DbConnect();
     const sessions = await SessionModel.find({ userId: session.user.id }).select("id status");
     return NextResponse.json({ sessions }, { status: 200 });
}