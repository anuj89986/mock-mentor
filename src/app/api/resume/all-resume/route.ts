import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";
import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import ResumeModel from "@/model/Resume";

export async function GET(req : Request) {
    const session = await getServerSession(authOptions);
    if(!session){
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const resume = await ResumeModel.find({userId : session.user?.id.toString()}).sort({ createdAt: -1 });

    return NextResponse.json({ resume }, { status: 200 });
}
