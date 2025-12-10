// backend/api/src/services/voiceService.ts
import axios from "axios";
import FormData from "form-data";

const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;

// --------------- 1) 克隆用户声音（首次录音 ）----------------
export async function cloneVoiceService(audioBuffer: Buffer) {
  try {
    const form = new FormData();
    form.append("voice", audioBuffer, { filename: "sample.wav" });

    const resp = await axios.post(
      "https://api.elevenlabs.io/v1/voices/add",
      form,
      {
        headers: {
          "xi-api-key": ELEVEN_API_KEY!,
          ...form.getHeaders(),
        },
      }
    );

    const voiceId = resp.data.voice_id;
    return voiceId;
  } catch (err: any) {
    console.error("Voice cloning error:", err?.response?.data || err.message);
    throw new Error("Failed to clone voice.");
  }
}

// --------------- 2) 使用 voice_id 生成 AI Sample 音频 ----------------
export async function ttsWithVoiceService(voiceId: string | undefined, text: string) {
  try {
    if (!voiceId) {
      throw new Error(
        "voiceId is required. Clone the student's voice first and provide the resulting voiceId."
      );
    }

    const resp = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: "eleven_turbo_v2", // 成本更低
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.8,
        },
      },
      {
        headers: {
          "xi-api-key": ELEVEN_API_KEY!,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    return resp.data; // buffer
  } catch (err: any) {
    const apiError =
      err?.response?.data?.detail ||
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message;
    console.error("TTS error:", err?.response?.data || err.message);
    throw new Error(apiError || "Failed to generate speech.");
  }
}
