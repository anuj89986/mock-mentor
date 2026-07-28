export const runtime = "nodejs";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { uploadFileToCloudinary} from "@/lib/cloudinary";
import pdf from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";
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

        let extractedText = "";

        if (fileEntry.type === "application/pdf") {
            const result = await pdf(buffer);
            extractedText = result.text?.trim() ?? "";
        } else if (
            fileEntry.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            const result = await mammoth.extractRawText({ buffer });
            extractedText = result.value?.trim() ?? "";
        } else {
            return NextResponse.json(
                { error: "Only PDF and DOCX files are allowed" },
                { status: 400 }
            );
        }

        if (!extractedText) {
            return NextResponse.json(
                { error: "Unable to extract text from file" },
                { status: 400 }
            );
        }

        const format = fileEntry.type === "application/pdf" ? "pdf" : "docx";
        const res = await uploadFileToCloudinary(buffer, format);

        if(!res.secure_url || !res.public_id){
            return NextResponse.json({ error: "Failed to save resume data" }, { status: 500 });
        }

        const uploadedResume = await ResumeModel.create({ extractedText: extractedText, fileUrl: res.secure_url, userId , publicId:res.public_id });

        return NextResponse.json({ message: "Resume uploaded successfully", uploadedResume }, { status: 200 });
    } catch (error) {
        console.error('Error uploading resume:', error);
        return NextResponse.json({ error: 'Failed to upload resume' }, { status: 500 });
    }
}