// backend/api/src/services/scoringClient.ts
import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const SCORING_SERVICE_URL =
  process.env.SCORING_SERVICE_URL || "http://localhost:8000";

export async function sendToScoringService(audioPath: string) {
  const formData = new FormData();
  formData.append("audio", fs.createReadStream(audioPath));

  const response = await axios.post(`${SCORING_SERVICE_URL}/score`, formData, {
    headers: formData.getHeaders(),
  });

  return response.data;
}
