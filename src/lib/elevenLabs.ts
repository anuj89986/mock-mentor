import { ElevenLabsClient} from "@elevenlabs/elevenlabs-js";

const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
});
export async function textToSpeech(text: string) {
    const audio = await elevenlabs.textToSpeech.convert(
	"JBFqnCBsd6RMkjVDRZzb",
	{
		text: text,
		modelId: "eleven_flash_v2_5",
		outputFormat: "mp3_44100_128",
	},
);
    return audio;
}

