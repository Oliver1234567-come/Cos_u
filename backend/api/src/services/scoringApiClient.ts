// backend/api/src/services/scoringApiClient.ts

import axios from "axios";
import FormData from "form-data";
import { ScoreBreakdown } from "../types/score";

const SCORING_SERVICE_URL =
  process.env.SCORING_SERVICE_URL || "http://127.0.0.1:8000";

/**
 * Call Python scoring service with base64 audio
 * Returns acoustic scores (delivery, language_use, topic_dev, overall)
 */
export async function scoringApiClient(
  audioBase64: string
): Promise<ScoreBreakdown> {
  try {
    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioBase64, "base64");

    // Create FormData
    // Note: Python service expects field name "file" (not "audio")
    const formData = new FormData();
    formData.append("file", audioBuffer, {
      filename: "audio.m4a",
      contentType: "audio/m4a",
    });

    const response = await axios.post(
      `${SCORING_SERVICE_URL}/score`,
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    // Python service returns: { delivery, language_use, topic_dev, overall }
    const data = response.data;

    return {
      delivery: data.delivery || 0,
      language_use: data.language_use || 0,
      topic_dev: data.topic_dev || 0,
      overall: data.overall || 0,
    };
  } catch (error: any) {
    console.error("🔥 Scoring API error:", error.message);
    throw new Error(`Scoring service failed: ${error.message}`);
  }
}

