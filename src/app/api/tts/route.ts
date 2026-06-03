import { textToSpeech } from "@/lib/elevenLabs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text) {
      return new NextResponse("Bad Request: 'text' is required", { status: 400 });
    }
    const audio = await textToSpeech(text);
    if (!audio) {
      return new NextResponse("Internal Server Error: Failed to generate audio", { status: 500 });
    }
    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("Error in TTS route:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
