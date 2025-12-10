import React, { useMemo } from 'react';

interface AmplitudeVisualizerProps {
  data: number[];
  progress: number; // 0 to 100
  color?: string; // Expecting tailwind class like "bg-accent-primary"
  isLive?: boolean;
}

// Helper to determine active color hex based on props
const getStrokeColor = (className: string) => {
  if (className.includes('accent-primary')) return '#B1FA63'; // Neon Green
  if (className.includes('accent-secondary')) return '#FF7A3D'; // Orange (updated to requested hex)
  return '#B1FA63';
};

export const AmplitudeVisualizer: React.FC<AmplitudeVisualizerProps> = ({ 
  data, 
  progress, 
  color = 'bg-accent-primary',
  isLive = false 
}) => {
  const strokeColor = getStrokeColor(color);
  
  // 1. Smooth Data Pre-processing
  // We apply a simple moving average to ensure the curve is extra buttery
  // even if the input data is slightly noisy.
  const smoothedData = useMemo(() => {
    if (data.length < 2) return data;
    return data.map((val, i, arr) => {
      const prev = arr[i - 1] ?? val;
      const next = arr[i + 1] ?? val;
      return (prev + val + next) / 3;
    });
  }, [data]);

  // 2. Generate SVG Path (Catmull-Rom Spline)
  const pathD = useMemo(() => {
    if (smoothedData.length === 0) return '';

    // Map points to SVG coordinates (ViewBox 0 0 200 100)
    // X: 0 -> 200
    // Y: 100 -> 0 (Inverted, 0 is bottom in typical charts, but SVG 0 is top)
    // We want the wave to be centered around Y=50, with max amplitude stretching to 10 and 90.
    const points = smoothedData.map((val, i) => {
      const x = (i / (smoothedData.length - 1)) * 200;
      // Map 0..1 to 90..10 (SVG coordinates)
      const y = 90 - (val * 80); 
      return [x, y];
    });

    if (points.length < 2) return "";

    let d = `M ${points[0][0]},${points[0][1]}`;

    // Catmull-Rom to Cubic Bezier conversion for SVG
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;

      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
    }

    return d;
  }, [smoothedData]);

  // Calculate cursor position for the "live" playhead
  const cursorPoint = useMemo(() => {
    if (smoothedData.length === 0) return { x: 0, y: 50 };
    const indexFloat = (progress / 100) * (smoothedData.length - 1);
    const i = Math.floor(indexFloat);
    const val = smoothedData[i] || 0;
    
    // Interpolate Y for smoother cursor movement
    // (Optional simple interpolation between i and i+1 could be added here)
    
    const x = (progress / 100) * 200;
    const y = 90 - (val * 80);
    return { x, y };
  }, [progress, smoothedData]);

  return (
    <div className="w-full h-full relative">
      <svg 
        viewBox="0 0 200 100" 
        preserveAspectRatio="none" 
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* Neon Glow Filter */}
          <filter id={`glow-${strokeColor}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Mask to reveal line based on progress */}
          <clipPath id={`progress-mask-${strokeColor}`}>
             <rect x="0" y="-50" width={(progress / 100) * 200} height="200" />
          </clipPath>
          
          {/* Fade Gradient for the "Tail" feel (optional visual enhancement) */}
          <linearGradient id={`fade-${strokeColor}`} x1="0" y1="0" x2="1" y2="0">
             <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
             <stop offset="100%" stopColor={strokeColor} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* 1. Inactive/Future Path (Dimmed, dashed, or low opacity) */}
        {/* Only show if not live recording (for AI sample) or just faint background guide */}
        <path 
          d={pathD} 
          stroke={strokeColor} 
          strokeWidth="2" 
          fill="none" 
          opacity="0.1" 
          strokeDasharray={isLive ? "0" : "4 4"}
        />

        {/* 2. Active Path (Revealed by progress) */}
        <path 
          d={pathD} 
          stroke={strokeColor} 
          strokeWidth="3" 
          fill="none" 
          strokeLinecap="round"
          filter={`url(#glow-${strokeColor})`}
          clipPath={`url(#progress-mask-${strokeColor})`}
          style={{
             transition: 'd 0.1s linear' // Smooth out shape updates if data changes
          }}
        />

        {/* 3. Playhead Cursor (Glowing Dot) */}
        <circle 
           cx={cursorPoint.x} 
           cy={cursorPoint.y} 
           r="4" 
           fill="#FFFFFF" 
           filter={`url(#glow-${strokeColor})`}
           style={{ opacity: progress > 0 ? 1 : 0 }}
        />
        
        {/* 4. Playhead Vertical Line (Subtle guide) */}
        <line 
           x1={cursorPoint.x} y1="0" 
           x2={cursorPoint.x} y2="100" 
           stroke={strokeColor} 
           strokeWidth="1" 
           strokeOpacity="0.2"
           strokeDasharray="2 2"
           style={{ opacity: progress > 0 && progress < 100 ? 1 : 0 }}
        />

      </svg>
    </div>
  );
};
