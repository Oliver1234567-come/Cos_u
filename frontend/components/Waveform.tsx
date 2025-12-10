import React from 'react';

interface WaveformProps {
  isActive: boolean;
  color?: string; // Expecting hex or tailwind class, handling tailwind logic here for SVG
}

export const Waveform: React.FC<WaveformProps> = ({ isActive }) => {
  // Using inline SVG for smooth curve animation
  // The 'd' path simulates a sine wave. 
  // We'll animate the stroke-dashoffset or transform to make it look live.
  
  const strokeColor = isActive ? '#FE7733' : '#3A3F47'; // Active Orange vs Inactive Grey
  
  return (
    <div className="w-full h-24 flex items-center justify-center relative overflow-hidden opacity-90">
      {/* Container Glow */}
      {isActive && (
        <div className="absolute inset-0 bg-accent-secondary/5 blur-3xl rounded-full" />
      )}

      <svg
        viewBox="0 0 500 150"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0" />
            <stop offset="20%" stopColor={strokeColor} stopOpacity="0.5" />
            <stop offset="50%" stopColor={strokeColor} stopOpacity="1" />
            <stop offset="80%" stopColor={strokeColor} stopOpacity="0.5" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
          
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Line (Static) */}
        <path
          d="M0,75 Q125,75 250,75 T500,75"
          stroke={isActive ? strokeColor : '#3A3F47'}
          strokeWidth="1"
          fill="none"
          opacity="0.3"
        />

        {/* Active Waveform Group */}
        {isActive && (
          <g filter="url(#glow)">
             {/* Primary Wave */}
            <path
              d="M0,75 C100,25 150,125 250,75 C350,25 400,125 500,75"
              fill="none"
              stroke="url(#waveGradient)"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <animate 
                attributeName="d" 
                dur="1.5s" 
                repeatCount="indefinite"
                values="
                  M0,75 C100,25 150,125 250,75 C350,25 400,125 500,75;
                  M0,75 C100,125 150,25 250,75 C350,125 400,25 500,75;
                  M0,75 C100,25 150,125 250,75 C350,25 400,125 500,75
                "
              />
            </path>
            
            {/* Secondary Phase Shift Wave (Lower Opacity) */}
            <path
              d="M0,75 C80,100 180,50 250,75 C320,100 420,50 500,75"
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.5"
              opacity="0.4"
            >
               <animate 
                attributeName="d" 
                dur="2s" 
                repeatCount="indefinite"
                values="
                  M0,75 C80,100 180,50 250,75 C320,100 420,50 500,75;
                  M0,75 C80,50 180,100 250,75 C320,50 420,100 500,75;
                  M0,75 C80,100 180,50 250,75 C320,100 420,50 500,75
                "
              />
            </path>
          </g>
        )}
      </svg>
    </div>
  );
};