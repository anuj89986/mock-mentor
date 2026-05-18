export const runtime = "nodejs";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import pdf from "pdf-parse/lib/pdf-parse.js";
import ResumeModel from "@/model/Resume";
import authOptions from "@/lib/auth";
import { getServerSession } from "next-auth/next";


export async function POST(req: Request) {
    try{
        await dbConnect();
        const formData = await req.formData();
        const fileEntry = formData.get("resume") as File | null;
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session?.user?.id.toString();

        if (!fileEntry) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }
        if (fileEntry.type !== "application/pdf") {
            return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
        }

        const bytes = await fileEntry.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const result = await pdf(buffer);

        if(!result.text || result.text.trim() === ""){
            return NextResponse.json({ error: "Unable to extract text from PDF" }, { status: 400 });
        }
        const fileUrl = await uploadToCloudinary(buffer);

        if(!fileUrl){
            return NextResponse.json({ error: "Failed to save resume data" }, { status: 500 });
        }

        const uploadedResume = await ResumeModel.create({ extractedText: result.text, fileUrl, userId });

        return NextResponse.json({ message: "Resume uploaded successfully", uploadedResume }, { status: 200 });
    } catch (error) {
        console.error('Error uploading resume:', error);
        return NextResponse.json({ error: 'Failed to upload resume' }, { status: 500 });
    }
}