import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ExamType } from '../types';
import { Waveform } from '../components/Waveform';
import { TechLogo } from '../components/TechLogo';
import { Mic, Timer } from 'lucide-react';
import { EXAM_TASKS } from '../constants';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

interface HomeProps {
  user: UserProfile;
  onSubmitRecording: (payload: { audioBlob: Blob; taskDuration: number }) => Promise<void>;
}

export const Home: React.FC<HomeProps> = ({ user, onSubmitRecording }) => {
  const timerRef = useRef<number | null>(null);
  const { isRecording, audioBlob, startRecording, stopRecording, resetRecording, error: recorderError } = useAudioRecorder();
  
  const examType = user.examType || ExamType.GENERAL;
  const availableTasks = EXAM_TASKS[examType];
  const [selectedTask, setSelectedTask] = useState(availableTasks[0]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const getTaskDuration = (eType: ExamType, taskName: string): number => {
    if (eType === ExamType.TOEFL) {
      if (taskName.includes('Task 1')) return 45;
      return 60;
    }
    if (eType === ExamType.IELTS) {
      if (taskName.includes('Part 2')) return 120;
      if (taskName.includes('Part 3')) return 60;
    }
    return 60;
  };

  const maxDuration = getTaskDuration(examType, selectedTask);
  const [timeLeft, setTimeLeft] = useState(maxDuration);

  useEffect(() => {
    setTimeLeft(getTaskDuration(examType, selectedTask));
    if (timerRef.current) clearInterval(timerRef.current);
  }, [selectedTask, examType]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, stopRecording]);

  useEffect(() => {
    if (!audioBlob) return;
    const submit = async () => {
      try {
        setSubmitError(null);
        setIsUploading(true);
        await onSubmitRecording({ audioBlob, taskDuration: maxDuration });
        resetRecording();
      } catch (error: any) {
        setSubmitError(error.message || 'Scoring failed. Please try again.');
      } finally {
        setIsUploading(false);
      }
    };
    submit();
  }, [audioBlob, maxDuration, onSubmitRecording, resetRecording]);

  const toggleRecording = () => {
    if (isUploading) return;
    if (isRecording) {
      stopRecording();
    } else {
      if (timeLeft === 0) setTimeLeft(maxDuration);
      startRecording();
      setSubmitError(null);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col p-6 relative">
      <div className="flex justify-between items-center relative z-10 mb-8">
        <div className="flex items-center gap-3">
           <TechLogo className="w-10 h-10" />
           <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Cos_u</h1>
        </div>
        
        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${isRecording ? 'bg-accent-secondary animate-pulse text-accent-secondary' : 'bg-accent-primary animate-pulse-slow text-accent-primary'}`} />
            <span className="text-xs font-medium text-neutral-dim">{user.points} pts</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full mb-10">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 mask-linear-fade px-1">
          {availableTasks.map((task) => (
            <button
              key={task}
              onClick={() => setSelectedTask(task)}
              className={`relative whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs font-medium transition-all duration-300 border backdrop-blur-md ${
                selectedTask === task 
                  ? 'bg-accent-primary/10 border-accent-primary/50 text-accent-primary shadow-[0_0_15px_rgba(177,250,99,0.15)]' 
                  : 'bg-white/5 border-white/5 text-neutral-dim hover:text-white hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {selectedTask === task && (
                 <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-accent-primary/20 pointer-events-none" />
              )}
              {task}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-16 relative z-10">
        <div className="text-center space-y-5 relative">
           <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[60px] transition-all duration-700 ${isRecording ? 'bg-accent-secondary/10 opacity-100' : 'bg-transparent opacity-0'}`} />
           
           <div className={`text-8xl font-bold tabular-nums tracking-tighter transition-all duration-500 bg-clip-text text-transparent relative z-10 ${
             isRecording 
             ? 'bg-gradient-to-b from-[#FE7733] to-[#FF9E66] drop-shadow-[0_0_20px_rgba(254,119,51,0.3)]' 
             : 'bg-gradient-to-b from-white to-white/50'
           }`}>
              {formatTime(timeLeft)}
           </div>
           
           <div className="flex items-center justify-center gap-2 text-neutral-dim text-xs bg-white/5 backdrop-blur-md py-2 px-5 rounded-full border border-white/10 mx-auto w-fit shadow-lg">
              <Timer size={14} className={isRecording ? 'text-accent-secondary animate-pulse' : 'text-neutral-dim'} />
              <span className="font-medium tracking-widest uppercase text-[10px] opacity-80">
                {isRecording ? 'Recording Live' : `Max Time: ${formatTime(maxDuration)}`}
              </span>
           </div>
        </div>

        <div className="flex flex-col items-center gap-8 w-full mt-auto mb-12">
          <div className="h-24 w-full max-w-sm relative">
             <Waveform isActive={isRecording} />
          </div>

          <div className="relative group">
            <button
              onClick={toggleRecording}
              className="relative z-20 outline-none tap-highlight-transparent disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isUploading}
            >
              <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${isRecording ? 'scale-105' : 'group-hover:scale-105'}`}>
                 <div className={`absolute inset-[-10px] rounded-full blur-xl transition-all duration-1000 ${
                   isRecording ? 'bg-accent-secondary/30 animate-pulse' : 'bg-accent-primary/20 opacity-0 group-hover:opacity-100'
                 }`} />
                 <div className={`absolute inset-0 rounded-full border transition-colors duration-300 ${isRecording ? 'border-[#FE7733]/50 shadow-[0_0_20px_rgba(254,119,51,0.4)]' : 'border-[#B1FA63]/30 shadow-[0_0_15px_rgba(177,250,99,0.2)]'}`} />
                 <div className={`absolute inset-[3px] rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden shadow-[inset_0_2px_4px_rgba(255,255,255,0.15)] ${
                   isRecording 
                   ? 'bg-gradient-to-br from-[#FE7733] to-[#D95D1E]' 
                   : 'bg-gradient-to-br from-[#B1FA63] to-[#8EE042]'
                 }`}>
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                    {isRecording ? (
                      <div className="w-8 h-8 bg-white rounded-md shadow-sm" /> 
                    ) : (
                      <Mic className="w-10 h-10 text-bg-surface drop-shadow-md" strokeWidth={2.5} />
                    )}
                 </div>
              </div>
            </button>
            
            {isRecording && (
               <>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full border border-accent-secondary/40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full border border-accent-secondary/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" />
               </>
            )}
          </div>

          <p className={`text-sm font-medium tracking-widest uppercase transition-colors duration-300 ${isRecording ? 'text-accent-secondary animate-pulse' : 'text-neutral-dim/50'}`}>
            {isRecording ? 'Recording...' : isUploading ? 'Uploading...' : 'Tap to Start'}
          </p>

          {(submitError || recorderError) && (
            <p className="text-xs text-red-400 text-center max-w-sm">
              {submitError || recorderError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};