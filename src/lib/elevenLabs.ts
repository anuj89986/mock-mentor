import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

let elevenlabs: ElevenLabsClient | null = null;

export function getElevenLabs() {
  if (!elevenlabs) {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      throw new Error("ELEVENLABS_API_KEY is not set");
    }

    elevenlabs = new ElevenLabsClient({
      apiKey,
    });
  }

  return elevenlabs;
}

export async function textToSpeech(text: string) {
  const elevenlabs = getElevenLabs();
  const audio = await elevenlabs.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
    text: text,
    modelId: "eleven_flash_v2_5",
    outputFormat: "mp3_44100_128",
  });
  return audio;
}
