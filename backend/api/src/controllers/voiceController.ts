// backend/api/src/controllers/voiceController.ts
import { Request, Response } from "express";
import { cloneVoiceService, ttsWithVoiceService } from "../services/voiceService";

export async function cloneVoice(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio uploaded." });
    }

    const audioBuffer = req.file.buffer;
    const voiceId = await cloneVoiceService(audioBuffer);

    res.json({
      success: true,
      voiceId,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function generateSpeech(req: Request, res: Response) {
  try {
    const { voiceId, text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: "text is required.",
      });
    }

    const audio = await ttsWithVoiceService(voiceId, text);

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audio.length,
    });

    return res.send(audio);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
