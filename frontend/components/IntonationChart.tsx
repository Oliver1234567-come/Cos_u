import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

interface IntonationChartProps {
  aiData: number[];
  userData: number[];
  height?: number;
}

export const IntonationChart: React.FC<IntonationChartProps> = ({ 
  aiData, 
  userData,
  height = 192 // h-48 equivalent
}) => {
  // Merge data for Recharts
  // We assume aiData defines the total length of the chart x-axis
  const chartData = aiData.map((aiVal, index) => ({
    index,
    ai: aiVal,
    user: userData[index] !== undefined ? userData[index] : null
  }));

  return (
    <div className="w-full relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          {/* Hidden Axes for clean look */}
          <XAxis dataKey="index" hide />
          <YAxis domain={['auto', 'auto']} hide />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#3A3F47', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px'
            }}
            itemStyle={{ padding: 0 }}
            labelStyle={{ display: 'none' }}
            formatter={(value: number, name: string) => [
              `${value.toFixed(0)} Hz`, 
              name === 'ai' ? 'AI Target' : 'Your Voice'
            ]}
          />

          {/* AI Target Line - Neon Green */}
          <Line
            type="monotone"
            dataKey="ai"
            stroke="#B1FA63"
            strokeWidth={3}
            dot={false}
            strokeOpacity={0.6}
            strokeDasharray="5 5"
            animationDuration={0}
          />

          {/* User Voice Line - Orange */}
          <Line
            type="monotone"
            dataKey="user"
            stroke="#FE7733"
            strokeWidth={3}
            dot={{ r: 3, fill: '#FE7733', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#fff', stroke: '#FE7733', strokeWidth: 2 }}
            animationDuration={300}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend / Labels overlay */}
      <div className="absolute top-2 left-4 flex gap-4 pointer-events-none">
        <div className="flex items-center gap-1.5">
           <div className="w-3 h-1 bg-accent-primary/60 rounded-full dashed border-b border-accent-primary"></div>
           <span className="text-[10px] font-medium text-accent-primary uppercase tracking-wider">Target Pitch</span>
        </div>
        <div className="flex items-center gap-1.5">
           <div className="w-3 h-1 bg-accent-secondary rounded-full"></div>
           <span className="text-[10px] font-medium text-accent-secondary uppercase tracking-wider">You</span>
        </div>
      </div>
    </div>
  );
};