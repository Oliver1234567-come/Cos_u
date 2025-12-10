import React from 'react';
import { Sparkles } from 'lucide-react';

interface TechLogoProps {
  className?: string;
  withGlow?: boolean;
}

export const TechLogo: React.FC<TechLogoProps> = ({ className = "w-10 h-10", withGlow = false }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
        {/* Volumetric ambient back-glow */}
        <div className={`absolute inset-0 bg-accent-primary/20 blur-xl rounded-full transition-opacity duration-1000 ${withGlow ? 'opacity-100 scale-150' : 'opacity-40 scale-100'}`} />
        
        {/* Core Container */}
        <div className={`relative z-10 w-full h-full rounded-full border border-white/10 bg-bg-surface/40 backdrop-blur-md flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ${withGlow ? 'shadow-[0_0_20px_rgba(177,250,99,0.2)]' : ''}`}>
            {/* Spinning Ring */}
            <div className="absolute inset-0 rounded-full border border-t-accent-primary/60 border-r-transparent border-b-accent-primary/10 border-l-transparent animate-[spin_8s_linear_infinite]" />
            
            {/* Inner Ring Reverse */}
            <div className="absolute inset-1 rounded-full border border-b-accent-primary/30 border-t-transparent border-l-transparent border-r-transparent animate-[spin_12s_linear_infinite_reverse]" />

            <Sparkles className="w-[45%] h-[45%] text-accent-primary drop-shadow-[0_0_5px_rgba(177,250,99,0.5)]" strokeWidth={2} />
        </div>
    </div>
  );
};