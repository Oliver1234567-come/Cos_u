
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Sparkles, CheckCircle, RefreshCw, Volume2 } from 'lucide-react';
import { Button } from '../components/Button';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { cloneVoice, generateTTS } from '../services/voiceService';
import { TechLogo } from '../components/TechLogo';
import { ViewState } from '../types';

interface VoiceCloneLabProps {
  changeView: (view: ViewState) => void;
}

export const VoiceCloneLab: React.FC<VoiceCloneLabProps> = ({ changeView }) => {
  const [voiceId, setVoiceId] = useState<string | null>(null);

  // Load saved voiceId on mount
  useEffect(() => {
    const saved = localStorage.getItem('cosu_voice_id');
    if (saved) setVoiceId(saved);
  }, []);

  const handleVoiceCreated = (id: string) => {
    setVoiceId(id);
    localStorage.setItem('cosu_voice_id', id);
  };

  return (
    <div className="min-h-screen p-6 pb-24 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
         <button onClick={() => changeView(ViewState.HOME)} className="bg-white/5 p-2 rounded-full hover:bg-white/10">
           <span className="text-xs font-bold text-neutral-dim px-2">BACK</span>
         </button>
         <div className="flex items-center gap-2">
            <TechLogo className="w-8 h-8" />
            <span className="font-bold text-white">Voice Lab</span>
         </div>
         <div className="w-12" />
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-white">AI Voice Clone</h1>
        <p className="text-sm text-neutral-dim">
          {voiceId 
            ? "Your voice is active. Generate samples below." 
            : "Record a short clip to create your AI voice."}
        </p>
      </div>

      {/* 1. Recorder Section */}
      {!voiceId ? (
        <RecorderAndClone onVoiceCreated={handleVoiceCreated} />
      ) : (
        <div className="bg-bg-surface border border-accent-primary/20 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(177,250,99,0.1)]">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                <CheckCircle size={20} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Voice Ready</div>
                <div className="text-xs text-neutral-dim font-mono opacity-70">ID: {voiceId.slice(0, 8)}...</div>
              </div>
           </div>
           <button 
             onClick={() => { setVoiceId(null); localStorage.removeItem('cosu_voice_id'); }}
             className="text-xs text-neutral-dim hover:text-white underline"
           >
             Reset
           </button>
        </div>
      )}

      {/* 2. Player Section */}
      {voiceId && <SamplePlayer voiceId={voiceId} />}
    </div>
  );
};

// --- Sub-Component: Recorder ---
const RecorderAndClone: React.FC<{ onVoiceCreated: (id: string) => void }> = ({ onVoiceCreated }) => {
  const { isRecording, audioBlob, startRecording, stopRecording, resetRecording, error } = useAudioRecorder();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = async () => {
    if (!audioBlob) return;
    setIsProcessing(true);
    try {
      const result = await cloneVoice(audioBlob);
      if (result.success) {
        onVoiceCreated(result.voiceId);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to clone voice. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-bg-surface border border-white/5 rounded-3xl p-6 space-y-6 text-center">
       
       <div className="h-32 flex items-center justify-center">
          {isRecording ? (
            <div className="relative">
               <div className="absolute inset-0 bg-accent-secondary/20 rounded-full animate-ping" />
               <div className="w-20 h-20 rounded-full bg-accent-secondary/10 border border-accent-secondary text-accent-secondary flex items-center justify-center animate-pulse">
                  <Mic size={32} />
               </div>
            </div>
          ) : audioBlob ? (
            <div className="w-full bg-bg-deep rounded-xl p-4 flex items-center justify-between border border-white/5">
               <span className="text-xs font-mono text-accent-primary">recording_01.wav</span>
               <button onClick={resetRecording} className="p-2 hover:bg-white/10 rounded-full">
                 <RefreshCw size={16} className="text-neutral-dim" />
               </button>
            </div>
          ) : (
             <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 text-neutral-dim flex items-center justify-center">
                <Mic size={32} />
             </div>
          )}
       </div>

       {error && <p className="text-xs text-red-400">{error}</p>}

       <div className="space-y-3">
         {!audioBlob ? (
            <Button 
              fullWidth 
              onClick={isRecording ? stopRecording : startRecording}
              className={isRecording ? "!bg-accent-secondary !text-white border-none" : ""}
            >
              <div className="flex items-center justify-center gap-2">
                 {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={18} />}
                 <span>{isRecording ? "Stop Recording" : "Start Recording"}</span>
              </div>
            </Button>
         ) : (
            <Button fullWidth onClick={handleUpload} disabled={isProcessing}>
               {isProcessing ? (
                 <span className="flex items-center gap-2">
                   <RefreshCw className="animate-spin" size={18} /> Processing...
                 </span>
               ) : (
                 <span className="flex items-center gap-2">
                   <Sparkles size={18} /> Create Voice Clone
                 </span>
               )}
            </Button>
         )}
         
         {!isRecording && !audioBlob && (
           <p className="text-xs text-neutral-dim">Read a sentence clearly for best results.</p>
         )}
       </div>
    </div>
  );
};

// --- Sub-Component: Player ---
const SamplePlayer: React.FC<{ voiceId: string }> = ({ voiceId }) => {
  const [text, setText] = useState("Hello! This is your AI cloned voice speaking.");
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setAudioUrl(null); // Reset previous
    try {
      const url = await generateTTS(voiceId, text);
      setAudioUrl(url);
    } catch (err) {
      console.error(err);
      alert("Error generating audio.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-play when audio is ready
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(e => console.log("Autoplay blocked", e));
    }
  }, [audioUrl]);

  return (
    <div className="space-y-4">
      <div className="bg-bg-surface border border-white/5 rounded-3xl p-6 space-y-4">
         <h3 className="font-bold text-white text-sm uppercase tracking-wide">Test Your Voice</h3>
         
         <textarea
           className="w-full bg-bg-deep rounded-xl p-4 text-white text-sm border border-white/10 focus:border-accent-primary focus:outline-none resize-none"
           rows={3}
           value={text}
           onChange={(e) => setText(e.target.value)}
           placeholder="Type something for your AI voice to say..."
         />

         <Button fullWidth variant="secondary" onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? (
               <span className="flex items-center gap-2">
                 <RefreshCw className="animate-spin" size={16} /> Generating...
               </span>
            ) : (
               <span className="flex items-center gap-2">
                 <Volume2 size={16} /> Generate Audio
               </span>
            )}
         </Button>
      </div>

      {audioUrl && (
        <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-2xl p-4 flex items-center gap-4 animate-slide-up">
           <button 
             onClick={() => audioRef.current?.play()}
             className="w-10 h-10 rounded-full bg-accent-primary text-bg-deep flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
           >
             <Play size={18} fill="currentColor" />
           </button>
           <div className="flex-1">
              <div className="h-1 bg-accent-primary/20 rounded-full overflow-hidden w-full">
                 <div className="h-full bg-accent-primary w-full animate-[dash_2s_linear_infinite]" />
              </div>
              <p className="text-[10px] text-accent-primary mt-1 font-bold uppercase tracking-wider">Audio Ready</p>
           </div>
           <audio ref={audioRef} src={audioUrl} className="hidden" />
        </div>
      )}
    </div>
  );
};
