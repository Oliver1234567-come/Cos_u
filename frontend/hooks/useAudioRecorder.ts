
import { useState, useRef, useCallback } from 'react';

interface RecorderState {
  isRecording: boolean;
  audioBlob: Blob | null;
  error: string | null;
}

export const useAudioRecorder = () => {
  const [state, setState] = useState<RecorderState>({
    isRecording: false,
    audioBlob: null,
    error: null,
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine supported mime type (Prioritize mp4/aac for iOS compatibility, fallback to webm)
      const mimeType = MediaRecorder.isTypeSupported('audio/mp4') 
        ? 'audio/mp4' 
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setState(prev => ({ ...prev, isRecording: false, audioBlob: blob }));
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setState(prev => ({ ...prev, isRecording: true, error: null, audioBlob: null }));

    } catch (err: any) {
      console.error("Microphone access denied:", err);
      setState(prev => ({ ...prev, error: "Microphone access denied. Please check permissions." }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    resetRecording: () => setState(prev => ({ ...prev, audioBlob: null }))
  };
};
