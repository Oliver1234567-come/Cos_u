import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '../components/Button';
import { ViewState, UserProfile, EvaluationState, ExamType } from '../types';
import { Sparkles, Mic, Square, AlertTriangle } from 'lucide-react';
import { AmplitudeVisualizer } from '../components/AmplitudeVisualizer';
import { fetchSampleAudio } from '../services/api';

interface EvaluationProps {
  user: UserProfile;
  changeView: (view: ViewState) => void;
  evaluation: EvaluationState;
  onRetry: () => void;
  onDismiss: () => void;
}

enum EvalStage {
  LOADING,
  RESULT,
  AI_CLONE,
  SHADOWING,
  PAYWALL_TRIGGER
}

// Generate Smooth Wave Data for AI (Simulating Pitch Contour)
const generateSmoothWave = (points: number) => {
  return Array.from({ length: points }, (_, i) => {
    // Combine sine waves to create natural-looking speech intonation
    const x = i / points * Math.PI * 4; 
    const mainWave = Math.sin(x);
    const detailWave = Math.sin(x * 3) * 0.3;
    const noise = Math.random() * 0.1;
    // Normalize to 0.1 - 0.9 range
    return 0.5 + (mainWave + detailWave + noise) * 0.35; 
  });
};

const MOCK_AI_AMPLITUDES = generateSmoothWave(50);

const getScoreColor = (score: number) => {
  if (score >= 24) {
    return { color: 'text-accent-primary', bar: 'bg-accent-primary', label: 'Strong' };
  }
  if (score >= 18) {
    return { color: 'text-yellow-400', bar: 'bg-yellow-400', label: 'Needs Polish' };
  }
  return { color: 'text-red-400', bar: 'bg-red-400', label: 'Focus Area' };
};

export const Evaluation: React.FC<EvaluationProps> = ({
  user,
  changeView,
  evaluation,
  onRetry,
  onDismiss
}) => {
  const [stage, setStage] = useState<EvalStage>(EvalStage.LOADING);
  const [targetSlider, setTargetSlider] = useState(24);
  const [attempts, setAttempts] = useState(0);
  const [isShadowing, setIsShadowing] = useState(false);
  const [voiceId, setVoiceId] = useState<string | null>(null);

  // Visualization State
  const [userAmplitudes, setUserAmplitudes] = useState<number[]>(new Array(50).fill(0));
  const [progress, setProgress] = useState(0); // 0 to 100
  const sessionInterval = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [sampleAudioUrl, setSampleAudioUrl] = useState<string | null>(null);
  const [sampleScript, setSampleScript] = useState('');
  const [sampleLoading, setSampleLoading] = useState(false);
  const [sampleError, setSampleError] = useState<string | null>(null);
  const [samplePlaybackProgress, setSamplePlaybackProgress] = useState(0);
  const sampleScriptRef = useRef<HTMLDivElement | null>(null);
  const [sampleWaveData, setSampleWaveData] = useState<number[]>(MOCK_AI_AMPLITUDES);
  const sampleWaveAnimationRef = useRef<number | null>(null);
  const [isSamplePlaying, setIsSamplePlaying] = useState(false);
  const shadowingStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const amplitudeAnimationRef = useRef<number | null>(null);
  const [shadowingError, setShadowingError] = useState<string | null>(null);

  useEffect(() => {
    if (evaluation.loading) {
      setStage(EvalStage.LOADING);
    } else if (!evaluation.loading && evaluation.result && stage === EvalStage.LOADING) {
      setStage(EvalStage.RESULT);
    }
  }, [evaluation.loading, evaluation.result, stage]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('cosu_voice_id');
    if (saved) setVoiceId(saved);
  }, []);

  // Shadowing progress
  useEffect(() => {
    if (!isShadowing) {
      if (sessionInterval.current) {
        clearInterval(sessionInterval.current);
      }
      setProgress(0);
      return;
    }

    const totalDuration = 5000;
    const updateInterval = 50;
    const steps = totalDuration / updateInterval;
    const increment = 100 / steps;

    sessionInterval.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsShadowing(false);
          setAttempts((c) => c + 1);
          return 100;
        }
        return prev + increment;
      });
    }, updateInterval);

    return () => {
      if (sessionInterval.current) {
        clearInterval(sessionInterval.current);
      }
    };
  }, [isShadowing]);

  const stopShadowingAudio = () => {
    if (amplitudeAnimationRef.current) {
      cancelAnimationFrame(amplitudeAnimationRef.current);
      amplitudeAnimationRef.current = null;
    }
    analyserRef.current = null;
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => undefined);
      audioContextRef.current = null;
    }
    if (shadowingStreamRef.current) {
      shadowingStreamRef.current.getTracks().forEach((track) => track.stop());
      shadowingStreamRef.current = null;
    }
    setUserAmplitudes(new Array(50).fill(0));
  };

  // Shadowing microphone input
  useEffect(() => {
    if (!isShadowing) {
      stopShadowingAudio();
      return;
    }

    let cancelled = false;

    const startAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        shadowingStreamRef.current = stream;
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const bufferLength = analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);

        const updateAmplitude = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteTimeDomainData(dataArray);
          const sum = dataArray.reduce((acc, val) => acc + Math.abs(val - 128), 0);
          const amplitude = Math.min(0.95, Math.max(0.05, sum / bufferLength / 128));
          setUserAmplitudes((prev) => {
            const next = [...prev.slice(1), amplitude];
            return next;
          });
          amplitudeAnimationRef.current = requestAnimationFrame(updateAmplitude);
        };

        updateAmplitude();
      } catch (error) {
        console.error('Shadowing microphone error:', error);
        setShadowingError('Microphone access required for shadowing. Please allow microphone permission.');
        setIsShadowing(false);
      }
    };

    startAudio();

    return () => {
      cancelled = true;
      stopShadowingAudio();
    };
  }, [isShadowing]);


  const handleAIClone = () => {
    setStage(EvalStage.SHADOWING);
    setUserAmplitudes(new Array(50).fill(0));
    setProgress(0);
  };

  const toggleShadowing = () => {
    if (isShadowing) {
      // Manual Stop
      setIsShadowing(false);
      stopShadowingAudio();
      setAttempts(prev => prev + 1);
    } else {
      // Start Session
      if (attempts >= 5 && !user.isPro) {
         changeView(ViewState.PAYWALL);
         return;
      }
      setUserAmplitudes(new Array(50).fill(0));
      setProgress(0);
      setIsShadowing(true);
    }
  };

  const result = evaluation.result;

  const dimensionScores = useMemo(() => {
    if (!result) return [];
    return [
      { label: 'Delivery', score: result.final_score.delivery },
      { label: 'Language Use', score: result.final_score.language_use },
      { label: 'Topic Dev', score: result.final_score.topic_dev },
    ];
  }, [result]);

  const resolveTaskType = () => {
    switch (user.examType) {
      case ExamType.IELTS:
        return 'part2';
      case ExamType.PTE:
        return 'read_aloud';
      case ExamType.DUOLINGO:
        return 'describe_image';
      default:
        return 'task1';
    }
  };

  const handlePlayAISample = async () => {
    if (!result) return;
    if (!voiceId) {
      setSampleError("Please clone your voice in Voice Lab before generating AI samples.");
      return;
    }
    setSampleLoading(true);
    setSampleError(null);
    setSamplePlaybackProgress(0);
    setIsSamplePlaying(false);
    try {
      const payload = {
        transcript: result.transcript || '',
        targetScore: targetSlider,
        examType: (user.examType || ExamType.TOEFL).toLowerCase(),
        taskType: resolveTaskType(),
        timeLimitSec: 60,
        voiceId,
      };

      const response = await fetchSampleAudio(payload);
      const audioData = response.audioBase64.startsWith('data:')
        ? response.audioBase64
        : `data:audio/mpeg;base64,${response.audioBase64}`;

      setSampleScript(response.sample);
      setSampleAudioUrl(audioData);

      requestAnimationFrame(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => undefined);
        }
      });
    } catch (error: any) {
      setSampleError(error.message || 'Failed to generate AI sample.');
    } finally {
      setSampleLoading(false);
    }
  };

  const sampleSegments = useMemo(() => {
    if (!sampleScript) return [];
    return sampleScript.split(/(\s+)/).filter(Boolean);
  }, [sampleScript]);
  const highlightedSegmentCount = sampleSegments.length
    ? Math.floor(sampleSegments.length * samplePlaybackProgress)
    : 0;

  useEffect(() => {
    if (!sampleScriptRef.current) return;
    sampleScriptRef.current.scrollTo({
      top: sampleScriptRef.current.scrollHeight * samplePlaybackProgress,
      behavior: 'smooth',
    });
  }, [samplePlaybackProgress]);

  useEffect(() => {
    if (!isSamplePlaying) {
      if (sampleWaveAnimationRef.current) {
        cancelAnimationFrame(sampleWaveAnimationRef.current);
        sampleWaveAnimationRef.current = null;
      }
      return;
    }

    const animate = () => {
      setSampleWaveData((prev) =>
        prev.map((_, idx) => {
          const base = 0.5 + Math.sin(Date.now() / 250 + idx / 4) * 0.25;
          const jitter = (Math.random() - 0.5) * 0.2;
          return Math.min(0.95, Math.max(0.05, base + jitter));
        })
      );
      sampleWaveAnimationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (sampleWaveAnimationRef.current) {
        cancelAnimationFrame(sampleWaveAnimationRef.current);
        sampleWaveAnimationRef.current = null;
      }
    };
  }, [isSamplePlaying]);

  const handleSampleAudioTimeUpdate = () => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const progressValue =
      audioRef.current.currentTime / audioRef.current.duration;
    setSamplePlaybackProgress(progressValue);
  };

  const handleSampleAudioPlay = () => setIsSamplePlaying(true);
  const handleSampleAudioPause = () => setIsSamplePlaying(false);
  const handleSampleAudioEnded = () => {
    setIsSamplePlaying(false);
    setSamplePlaybackProgress(1);
  };

  if (evaluation.error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <h2 className="text-white text-xl font-semibold">Scoring Failed</h2>
        <p className="text-neutral-dim text-sm">{evaluation.error}</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onRetry}>
            Try Again
          </Button>
          <Button onClick={onDismiss}>Back Home</Button>
        </div>
      </div>
    );
  }

  if (stage === EvalStage.LOADING || evaluation.loading || !result) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 space-y-8 text-center">
        <div className="relative w-24 h-24">
           {/* Pulsing ring */}
           <div className="absolute inset-0 rounded-full border-2 border-white/5 animate-ping opacity-20"></div>
           <div className="absolute inset-0 rounded-full border border-white/10"></div>
           <div className="absolute inset-0 rounded-full border-t-2 border-accent-primary animate-spin shadow-[0_0_15px_rgba(177,250,99,0.3)]"></div>
        </div>
        <div>
           <h2 className="text-xl font-medium text-white">Analyzing Speech</h2>
           <p className="text-neutral-dim text-sm mt-2 font-light">Checking intonation, logic, and delivery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 p-6 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between relative z-20">
        <button onClick={onDismiss} className="text-neutral-dim hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10">
           <span className="text-xs font-bold px-2">CLOSE</span>
        </button>
        <span className="font-semibold text-white/90 tracking-wide uppercase text-xs">Analysis Report</span>
        <div className="w-16"></div>
      </div>

      {/* Overall Score */}
      {stage === EvalStage.RESULT && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 text-center border border-white/10 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-accent-primary via-white to-accent-secondary opacity-50"></div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/10 blur-[50px] rounded-full pointer-events-none" />
             
             <h3 className="text-neutral-dim uppercase tracking-[0.2em] text-[10px] mb-4 font-bold">
               {result.exam_ui_score.examType.toUpperCase()} Overall Score
             </h3>
             <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-accent-primary to-white mb-3 drop-shadow-[0_0_10px_rgba(177,250,99,0.2)]">
                {result.final_score.overall.toFixed(1)}
                <span className="text-3xl text-neutral-dim/50 font-light">
                  /30
                </span>
             </div>
             <p className="text-sm text-neutral-dim font-light">
               {result.improvements[0] || 'Great job! Keep polishing your delivery.'}
             </p>
          </div>

          {/* Dimensions */}
          <div className="space-y-3">
            {dimensionScores.map(dim => {
              const styles = getScoreColor(dim.score);
              return (
                <div key={dim.label} className="flex items-center justify-between bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group">
                 <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-white group-hover:text-white/90">{dim.label}</span>
                    <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${styles.bar} opacity-80`}
                        style={{ width: `${Math.min(100, (dim.score / 30) * 100)}%` }}
                      ></div>
                    </div>
                 </div>
                 <div className="flex flex-col items-end">
                   <span className={`font-bold text-lg ${styles.color} drop-shadow-sm`}>
                     {dim.score.toFixed(1)}
                   </span>
                   <span className="text-[10px] uppercase text-neutral-dim">{styles.label}</span>
                 </div>
                </div>
              );
            })}
          </div>

          {/* Analysis */}
          <div className="bg-accent-primary/5 p-6 rounded-3xl space-y-3 border border-accent-primary/20 relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-20 h-20 bg-accent-primary/20 blur-2xl rounded-full" />
             <h4 className="font-bold text-accent-primary text-xs uppercase tracking-wider flex items-center gap-2">
               <Sparkles size={14} /> AI Improvement Tip
             </h4>
             <ul className="text-sm text-neutral-dim leading-relaxed font-light space-y-2 list-disc pl-4">
               {result.improvements.length > 0 ? (
                 result.improvements.map((tip, idx) => <li key={idx}>{tip}</li>)
               ) : (
                 <li>Solid performance. Keep practicing for even more natural delivery.</li>
               )}
             </ul>
          </div>

          {result.transcript && (
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-sm text-neutral-dim leading-relaxed">
              <h4 className="text-xs uppercase tracking-[0.2em] text-white/60 mb-2 font-semibold">Transcript</h4>
              <p className="text-white/80">{result.transcript}</p>
            </div>
          )}

          <Button fullWidth onClick={() => setStage(EvalStage.AI_CLONE)}>
            <span className="flex items-center justify-center gap-2">
               Generate AI Sample <Sparkles className="w-4 h-4" />
            </span>
          </Button>
        </div>
      )}

      {/* AI Clone Slider Stage */}
      {stage === EvalStage.AI_CLONE && (
        <div className="space-y-10 animate-fade-in pt-10">
           <div className="text-center space-y-3">
             <h2 className="text-3xl font-bold text-white tracking-tight">Clone your voice</h2>
             <p className="text-neutral-dim text-sm">Hear how you would sound with a perfect score.</p>
           </div>

           <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] text-center space-y-8 border border-white/5 shadow-2xl relative">
                <div className="text-8xl font-bold text-accent-primary drop-shadow-[0_0_20px_rgba(177,250,99,0.2)]">{targetSlider}</div>
                
                <input 
                  type="range" 
                  min="23" 
                  max="30" 
                  value={targetSlider}
                  onChange={(e) => setTargetSlider(parseInt(e.target.value))}
                  className="w-full h-2 bg-bg-deep rounded-full appearance-none cursor-pointer accent-accent-primary"
                  style={{ background: `linear-gradient(to right, #B1FA63 0%, #B1FA63 ${(targetSlider - 23) / 7 * 100}%, #111418 ${(targetSlider - 23) / 7 * 100}%, #111418 100%)` }}
                />
                
                <p className="text-xs text-neutral-dim uppercase tracking-widest font-bold">Target Score</p>
           </div>

           <Button fullWidth onClick={handleAIClone}>
             Generate Sample ({targetSlider})
           </Button>
        </div>
      )}

      {/* Shadowing Stage */}
      {stage === EvalStage.SHADOWING && (
        <div className="space-y-6 animate-fade-in h-full flex flex-col">
           
           {/* Header */}
           <div className="flex justify-between items-center text-xs font-medium text-neutral-dim px-2">
              <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5">Target: <span className="text-accent-primary">{targetSlider}</span></span>
              <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5"><span className="text-white">{Math.max(0, 5 - attempts)}</span> attempts left</span>
           </div>

           {/* Dual Intonation Visualizer (AI Top / User Bottom) */}
           <div className={`relative rounded-[2rem] bg-bg-deep border border-white/5 overflow-hidden transition-all duration-500 p-6 space-y-8 shadow-2xl ${isShadowing ? 'ring-1 ring-accent-secondary/50' : ''}`}>
              
              {/* AI Section (Neon Green) */}
              <div className="space-y-2">
                 <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-accent-primary font-bold">
                    <span>AI Intonation (Target)</span>
                    <Sparkles size={10} />
                 </div>
                 <div className="h-20 w-full bg-white/5 rounded-xl border border-white/5 overflow-hidden relative">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 border-b border-white/5 top-1/2"></div>
                    <AmplitudeVisualizer 
                       data={sampleWaveData} 
                       progress={isSamplePlaying ? samplePlaybackProgress * 100 : progress} 
                       color="bg-accent-primary" 
                       isLive={isSamplePlaying}
                    />
                 </div>
              </div>

              {/* User Section (Orange) */}
              <div className="space-y-2">
                 <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-accent-secondary font-bold">
                    <span>Your Intonation</span>
                    {isShadowing && <div className="w-2 h-2 rounded-full bg-accent-secondary animate-pulse" />}
                 </div>
                 <div className="h-20 w-full bg-white/5 rounded-xl border border-white/5 overflow-hidden relative">
                    <div className="absolute inset-0 border-b border-white/5 top-1/2"></div>
                    <AmplitudeVisualizer 
                       data={userAmplitudes} 
                       progress={progress} 
                       color="bg-accent-secondary" 
                       isLive={isShadowing}
                    />
                 </div>
              </div>
           </div>

           {/* AI Sample Player */}
           <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5 space-y-4">
             <div className="flex items-center justify-between gap-3">
               <div>
                 <p className="text-xs uppercase tracking-[0.2em] text-white/60">AI Sample</p>
                 <p className="text-sm text-neutral-dim">Target score {targetSlider}</p>
               </div>
               {!voiceId ? (
                 <Button
                   variant="secondary"
                   onClick={() => changeView(ViewState.VOICE_LAB)}
                 >
                   Clone Voice First
                 </Button>
               ) : (
                 <Button
                   variant="secondary"
                   onClick={handlePlayAISample}
                   disabled={sampleLoading}
                 >
                   {sampleLoading ? 'Generating…' : 'Generate & Play AI Sample'}
                 </Button>
               )}
             </div>
            {!voiceId && (
              <p className="text-xs text-accent-secondary">
                Clone your voice in Voice Lab to hear AI samples with your tone.
              </p>
            )}
             {sampleError && (
               <p className="text-xs text-red-400">{sampleError}</p>
             )}
            {/* Optimized Text Content - Scrollable */}
            {sampleScript && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Optimized Answer</p>
                <div
                  ref={sampleScriptRef}
                  className="text-sm text-white/80 leading-relaxed bg-white/5 rounded-2xl p-4 border border-white/5 max-h-40 overflow-y-auto scrollbar-hide"
                >
                  <p className="flex flex-wrap gap-1">
                    {sampleSegments.map((segment, idx) => {
                      const isHighlighted = idx <= highlightedSegmentCount;
                      return (
                        <span
                          key={`${segment}-${idx}`}
                          className={isHighlighted ? 'text-white font-medium' : 'text-white/50'}
                        >
                          {segment}
                        </span>
                      );
                    })}
                  </p>
                </div>
              </div>
            )}
            {/* Audio Player */}
            {sampleAudioUrl && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Audio Playback</p>
                <audio
                  ref={audioRef}
                  src={sampleAudioUrl}
                  controls
                  className="w-full"
                  onTimeUpdate={handleSampleAudioTimeUpdate}
                  onPlay={handleSampleAudioPlay}
                  onPause={handleSampleAudioPause}
                  onEnded={handleSampleAudioEnded}
                />
              </div>
            )}
           </div>

           {/* Transcript */}
           <div className="flex-1 bg-white/5 backdrop-blur-sm p-6 rounded-[2rem] text-lg leading-relaxed border border-white/5 overflow-y-auto max-h-40 scrollbar-hide shadow-inner">
              <p className={isShadowing ? "text-white transition-colors duration-300" : "text-neutral-dim"}>
                <span className="text-accent-primary font-medium border-b border-accent-primary/20 pb-0.5">Personally, I prefer</span> working alone rather than in a team. 
                <span className={isShadowing ? "text-white/90" : "text-neutral-dim/50"}> This is primarily because</span> I can concentrate better without distractions.
              </p>
           </div>

           {/* Action Button */}
           <div className="mt-auto space-y-4 pt-2">
             <button 
               onClick={toggleShadowing}
               className={`w-full h-20 rounded-[2rem] flex items-center justify-center gap-4 transition-all duration-500 shadow-xl ${
                 isShadowing 
                 ? 'bg-bg-surface border border-accent-secondary/50' 
                 : 'bg-gradient-to-r from-bg-surface to-bg-surface/80 border border-white/5 hover:border-white/20'
               }`}
             >
               <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
                 isShadowing ? 'bg-accent-secondary text-white scale-110 shadow-[0_0_20px_rgba(254,119,51,0.4)]' : 'bg-accent-primary text-bg-surface'
               }`}>
                 {isShadowing ? <Square size={18} fill="currentColor" /> : <Mic size={24} />}
               </div>
               <div className="text-left">
                 <div className={`font-bold text-lg tracking-wide ${isShadowing ? 'text-accent-secondary' : 'text-white'}`}>
                    {isShadowing ? 'STOP & GRADE' : 'TAP TO SHADOW'}
                 </div>
                 <div className="text-[10px] uppercase tracking-wider text-neutral-dim opacity-70">
                    {isShadowing ? 'Recording in progress...' : 'Sync with AI rhythm'}
                 </div>
               </div>
             </button>

             {!user.isPro && attempts >= 3 && attempts < 5 && (
                 <p className="text-center text-xs text-accent-secondary animate-pulse font-medium tracking-wide">
                    {5 - attempts} free attempts remaining
                 </p>
             )}
            {shadowingError && (
                <p className="text-xs text-red-400 text-center">{shadowingError}</p>
            )}
           </div>
        </div>
      )}
    </div>
  );
};