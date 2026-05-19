import authOptions from "@/lib/auth";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/dbConnect";
import ResumeModel from "@/model/Resume";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { publicId } = await req.json();
    if (!publicId) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    try {
        await dbConnect();
        await ResumeModel.findOneAndDelete({ publicId });
        await deleteFromCloudinary(publicId);
        return NextResponse.json({ message: "Resume deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error('Error deleting resume:', error);
        return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 });
    }
}