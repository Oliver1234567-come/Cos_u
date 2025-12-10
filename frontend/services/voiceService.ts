
const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:4000";

export const cloneVoice = async (audioBlob: Blob): Promise<{ success: boolean; voiceId: string }> => {
  const formData = new FormData();
  // Ensure the filename has an extension, though backend usually handles detection
  const ext = audioBlob.type.includes('mp4') ? 'm4a' : 'webm';
  formData.append('audio', audioBlob, `recording.${ext}`);

  const response = await fetch(`${API_BASE}/api/voice/clone`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to clone voice');
  }

  return response.json();
};

export const generateTTS = async (voiceId: string, text: string): Promise<string> => {
  const response = await fetch(`${API_BASE}/api/voice/tts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ voiceId, text }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate speech');
  }

  // Convert the arrayBuffer response to a playable Blob URL
  const arrayBuffer = await response.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
  return URL.createObjectURL(blob);
};
