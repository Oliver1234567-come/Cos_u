
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UserProfile, ExamType } from '../types';
import { Button } from '../components/Button';
import { TechLogo } from '../components/TechLogo';
import { ChevronLeft, Check, ArrowRight, X } from 'lucide-react';
import { AGE_GROUPS, CONTINENTS, COUNTRIES_BY_CONTINENT, EXAM_OPTIONS } from '../constants';

interface OnboardingProps {
  onComplete: (profile: Partial<UserProfile>) => void;
}

// iOS-style Wheel Picker Column Component
const PickerColumn = ({ 
  items, 
  selectedValue, 
  onSelect, 
  label 
}: { 
  items: { value: string; label: string }[]; 
  selectedValue: string | null; 
  onSelect: (val: string) => void;
  label?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to selected item on mount or change
  useEffect(() => {
    if (containerRef.current && selectedValue) {
      const selectedEl = containerRef.current.querySelector(`[data-value="${selectedValue}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [selectedValue]); // Only auto-scroll when value changes externally or initially

  return (
    <div className="relative h-64 w-full flex-1 group">
      {/* Label */}
      {label && <div className="absolute -top-6 left-0 right-0 text-center text-[10px] uppercase tracking-widest text-neutral-dim/50 font-bold">{label}</div>}

      {/* Central Highlight Bar (Glass) */}
      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-12 bg-white/5 border-y border-white/10 rounded-lg pointer-events-none z-0 backdrop-blur-[2px]" />
      
      {/* Scroll Container */}
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto no-scrollbar snap-y snap-mandatory py-[calc(8rem-1.5rem)] relative z-10"
        style={{ 
          maskImage: 'linear-gradient(to bottom, transparent, black 40%, black 60%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 40%, black 60%, transparent)' 
        }}
      >
        {items.map((item) => {
          const isSelected = item.value === selectedValue;
          return (
            <div 
              key={item.value}
              data-value={item.value}
              onClick={() => onSelect(item.value)}
              className={`h-12 flex items-center justify-center snap-center cursor-pointer transition-all duration-300 ${
                isSelected 
                  ? 'text-white font-bold text-lg scale-105' 
                  : 'text-neutral-dim/40 text-sm font-medium hover:text-neutral-dim/70'
              }`}
            >
              <span className="truncate px-2">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  
  // Initialize with 'asia' so the picker isn't empty initially
  const [selectedContinent, setSelectedContinent] = useState<string>('asia');
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    targetScore: 80, // Default
    nationality: 'China', // Default initial selection
  });

  const updateData = (key: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => Math.max(0, prev - 1));

  // Step 1: Continent Data Mapping
  const continentItems = useMemo(() => CONTINENTS.map(c => ({ value: c.id, label: c.label })), []);
  
  // Step 1: Country Data Mapping (Dependent on Continent)
  const countryItems = useMemo(() => {
    const list = COUNTRIES_BY_CONTINENT[selectedContinent] || [];
    return list.map(c => ({ value: c, label: c }));
  }, [selectedContinent]);

  // Auto-select first country when continent changes if current selection is invalid
  useEffect(() => {
    const list = COUNTRIES_BY_CONTINENT[selectedContinent] || [];
    if (!list.includes(formData.nationality || '')) {
      if (list.length > 0) {
        updateData('nationality', list[0]);
      }
    }
  }, [selectedContinent]);


  const renderStep = () => {
    switch (step) {
      case 0: // WELCOME
        return (
          <div className="flex flex-col items-center justify-center h-full relative z-10 animate-fade-in">
            {/* Additional Volumetric Highlight for Welcome Screen */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-accent-primary/5 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" />
            
            <div className="relative z-10 text-center space-y-10 max-w-xs">
              <div className="mx-auto transform transition-transform hover:scale-105 duration-700">
                 <TechLogo className="w-28 h-28 mx-auto" withGlow />
              </div>

              <div className="space-y-6">
                <h1 className="text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  Cos_u
                </h1>
                <p className="text-neutral-dim text-lg leading-relaxed font-light animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  Clone your voice.<br/>
                  <span className="text-white/80">Create your AI Sample.</span>
                </p>
              </div>
            </div>

            <div className="absolute bottom-16 w-full max-w-[280px] animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Button fullWidth onClick={nextStep} className="group shadow-2xl shadow-accent-primary/10">
                <span className="flex items-center justify-center gap-2">
                  Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>
          </div>
        );

      case 1: // REGION SELECTION (Merged Continent + Country)
        return (
          <div className="space-y-10 animate-slide-up max-w-sm mx-auto pt-10 h-full flex flex-col">
            <div className="space-y-3 text-center flex-shrink-0">
              <h2 className="text-3xl font-bold text-white tracking-tight">Where are you from?</h2>
              <p className="text-sm text-neutral-dim max-w-[260px] mx-auto leading-relaxed">
                We will adjust pronunciation and intonation based on your region.
              </p>
            </div>
            
            {/* Dual Wheel Picker Container */}
            <div className="flex-1 flex items-center justify-center gap-2">
               {/* Left: Continent */}
               <PickerColumn 
                 label="Region"
                 items={continentItems}
                 selectedValue={selectedContinent}
                 onSelect={setSelectedContinent}
               />
               
               {/* Divider */}
               <div className="h-32 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />

               {/* Right: Country */}
               <PickerColumn 
                 label="Country"
                 items={countryItems}
                 selectedValue={formData.nationality || null}
                 onSelect={(val) => updateData('nationality', val)}
               />
            </div>

            <div className="pt-4 pb-4">
              <Button fullWidth onClick={nextStep}>Continue</Button>
            </div>
          </div>
        );

      case 2: // AGE
        return (
          <div className="space-y-8 animate-slide-up max-w-xs mx-auto pt-10">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl font-bold text-white tracking-tight">How old are you?</h2>
              <p className="text-sm text-neutral-dim">Helping us match the right tone for you.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {AGE_GROUPS.map((age, idx) => (
                <button
                  key={age}
                  onClick={() => { updateData('ageGroup', age); nextStep(); }}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-accent-primary/40 hover:bg-white/10 transition-all active:scale-[0.98] animate-slide-up opacity-0 group"
                >
                  <span className="text-base font-medium group-hover:text-white transition-colors">{age}</span>
                  {formData.ageGroup === age && <Check className="w-4 h-4 text-accent-primary drop-shadow-[0_0_5px_rgba(177,250,99,0.5)]" />}
                </button>
              ))}
            </div>
          </div>
        );

      case 3: // EXAM
        return (
          <div className="space-y-8 animate-slide-up max-w-xs mx-auto pt-10">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl font-bold text-white tracking-tight">Choose your goal</h2>
              <p className="text-sm text-neutral-dim">Which exam are you prepping for?</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {EXAM_OPTIONS.map((exam, idx) => (
                <button
                  key={exam.value}
                  onClick={() => { updateData('examType', exam.value); nextStep(); }}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-accent-primary/40 hover:bg-white/10 transition-all active:scale-[0.98] animate-slide-up opacity-0 group"
                >
                  <span className="text-base font-medium group-hover:text-white transition-colors">{exam.label}</span>
                  {formData.examType === exam.value && <Check className="w-4 h-4 text-accent-primary drop-shadow-[0_0_5px_rgba(177,250,99,0.5)]" />}
                </button>
              ))}
            </div>
          </div>
        );

      case 4: // TARGET SCORE
        const currentExam = EXAM_OPTIONS.find(e => e.value === formData.examType) || EXAM_OPTIONS[4];
        return (
          <div className="space-y-12 animate-slide-up max-w-xs mx-auto pt-10">
             <div className="space-y-3 text-center">
               <h2 className="text-3xl font-bold text-white tracking-tight">Target Score</h2>
               <p className="text-sm text-neutral-dim">Set a goal to measure your daily progress.</p>
             </div>

             <div className="bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] text-center space-y-8 border border-white/5 relative shadow-2xl">
                {/* Glow effect behind score */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-accent-primary/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative">
                  <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-accent-primary to-[#8EE042] tracking-tighter drop-shadow-[0_0_15px_rgba(177,250,99,0.2)]">
                    {formData.targetScore}
                  </div>
                  <div className="text-xs font-bold text-neutral-dim uppercase tracking-[0.2em] mt-2 opacity-70">{currentExam.label}</div>
                </div>
                
                <div className="space-y-3">
                  <input 
                    type="range" 
                    min="0" 
                    max={currentExam.max} 
                    value={formData.targetScore}
                    onChange={(e) => updateData('targetScore', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-bg-deep rounded-full appearance-none cursor-pointer accent-accent-primary"
                    style={{ background: `linear-gradient(to right, #B1FA63 0%, #B1FA63 ${(formData.targetScore! / currentExam.max) * 100}%, #111418 ${(formData.targetScore! / currentExam.max) * 100}%, #111418 100%)` }}
                  />
                  <div className="flex justify-between text-[10px] text-neutral-dim uppercase font-bold tracking-wider">
                    <span>Start</span>
                    <span>Max {currentExam.max}</span>
                  </div>
                </div>
             </div>
             
             <Button fullWidth onClick={nextStep}>Continue</Button>
          </div>
        );

      case 5: // NAME
        return (
          <div className="space-y-10 animate-slide-up max-w-xs mx-auto pt-10">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl font-bold text-white tracking-tight">One last thing</h2>
              <p className="text-sm text-neutral-dim">What should we call you?</p>
            </div>
            
            <div className="space-y-4">
              <div className="relative group">
                 <div className="absolute -inset-1 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                 <input 
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name || ''}
                  onChange={(e) => updateData('name', e.target.value)}
                  className="relative w-full bg-bg-surface/50 border-b border-white/10 py-5 text-center text-3xl font-light text-white focus:outline-none focus:border-accent-primary placeholder-white/10 transition-colors"
                  autoFocus
                />
              </div>
              
              <p className="text-xs text-center text-neutral-dim/40">
                This will be displayed on your public profile.
              </p>
            </div>

            <div className="pt-8">
              <Button 
                fullWidth 
                onClick={() => onComplete(formData)}
                disabled={!formData.name}
              >
                Start Journey
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full relative flex flex-col overflow-hidden">
      {/* Progress Bar (Hidden on Welcome Screen) */}
      {step > 0 && (
        <div className="relative z-20 px-6 pt-6 flex items-center justify-between">
          <button onClick={prevStep} className="p-2 -ml-2 text-neutral-dim hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10 backdrop-blur-md">
             <ChevronLeft size={20} />
          </button>
          
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-700 ease-out ${i <= step ? 'w-6 bg-accent-primary shadow-[0_0_10px_rgba(177,250,99,0.5)]' : 'w-2 bg-white/10'}`} 
              />
            ))}
          </div>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 px-6 pb-8 flex flex-col justify-center relative z-10 overflow-hidden">
        {renderStep()}
      </div>
    </div>
  );
};
