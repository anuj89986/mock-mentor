import { AssemblyAI } from "assemblyai";
import { NextResponse } from "next/server";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file" },
        { status: 400 }
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const transcript = await client.transcripts.transcribe({
      audio: buffer,
    });

    return NextResponse.json({
      text: transcript.text,
    });

  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Transcription failed" },
      { status: 500 }
    );
  }
}