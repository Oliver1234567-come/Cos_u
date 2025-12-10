import type { SampleAudioResponse, ScoreResponse } from "../types";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:4000";

export interface ScoreRequest {
  audioBlob: Blob;
  examType: string;
  targetScore: number;
  timeLimitSec?: number;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const base64 = result.split(",")[1] || result;
        resolve(base64);
      } else {
        reject(new Error("Unable to read audio data"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    let message = errorText;
    try {
      const data = JSON.parse(errorText);
      message = data.error || data.detail || message;
    } catch {
      // ignore
    }
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function scoreSpeech({
  audioBlob,
  examType,
  targetScore,
  timeLimitSec = 45,
}: ScoreRequest): Promise<ScoreResponse> {
  const audioBase64 = await blobToBase64(audioBlob);

  const payload = {
    audioBase64,
    examType,
    targetScore,
    timeLimitSec,
  };

  const response = await fetch(`${API_BASE}/api/score/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<ScoreResponse>(response);
}

export interface SampleAudioPayload {
  transcript: string;
  targetScore: number;
  examType: string;
  taskType: string;
  timeLimitSec: number;
  voiceId: string;
}

export async function fetchSampleAudio(
  payload: SampleAudioPayload
): Promise<SampleAudioResponse> {
  const response = await fetch(`${API_BASE}/api/score/sample/audio`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<SampleAudioResponse>(response);
}

