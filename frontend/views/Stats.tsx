import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const DATA = [
  { name: 'Mon', score: 18, practice: 20 },
  { name: 'Tue', score: 19, practice: 25 },
  { name: 'Wed', score: 18, practice: 15 },
  { name: 'Thu', score: 21, practice: 40 },
  { name: 'Fri', score: 22, practice: 35 },
  { name: 'Sat', score: 23, practice: 50 },
  { name: 'Sun', score: 24, practice: 45 },
];

export const Stats: React.FC = () => {
  return (
    <div className="p-6 space-y-8 pb-24">
      <h1 className="text-2xl font-bold">Your Progress</h1>

      {/* Progress Curve */}
      <div className="bg-bg-surface rounded-3xl p-6 space-y-4 border border-neutral-dim/5">
        <div className="flex justify-between items-center">
           <h3 className="text-neutral-dim text-sm font-medium">Score Trajectory</h3>
           <span className="text-accent-primary text-sm font-bold">+3.5 this week</span>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DATA}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B1FA63" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#B1FA63" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#3A3F47', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#B1FA63' }}
              />
              <Area type="monotone" dataKey="score" stroke="#B1FA63" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Practice Time */}
      <div className="bg-bg-surface rounded-3xl p-6 space-y-4 border border-neutral-dim/5">
        <div className="flex justify-between items-center">
           <h3 className="text-neutral-dim text-sm font-medium">Practice Minutes</h3>
           <span className="text-accent-secondary text-sm font-bold">Total 3h 20m</span>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DATA}>
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                 contentStyle={{ backgroundColor: '#3A3F47', border: 'none', borderRadius: '8px' }}
                 itemStyle={{ color: '#FE7733' }}
              />
              <Line type="monotone" dataKey="practice" stroke="#FE7733" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-4">
         <div className="bg-bg-surface p-4 rounded-2xl">
            <div className="text-2xl font-bold text-neutral-text">42%</div>
            <div className="text-xs text-neutral-dim mt-1">Pronunciation</div>
            <div className="w-full bg-bg-DEFAULT h-1 mt-3 rounded-full overflow-hidden">
               <div className="bg-accent-primary h-full w-[42%]"></div>
            </div>
         </div>
         <div className="bg-bg-surface p-4 rounded-2xl">
            <div className="text-2xl font-bold text-neutral-text">58%</div>
            <div className="text-xs text-neutral-dim mt-1">Fluency</div>
            <div className="w-full bg-bg-DEFAULT h-1 mt-3 rounded-full overflow-hidden">
               <div className="bg-accent-secondary h-full w-[58%]"></div>
            </div>
         </div>
      </div>
    </div>
  );
};