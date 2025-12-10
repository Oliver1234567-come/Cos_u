
import React from 'react';
import { UserProfile, ViewState } from '../types';
import { Settings, Award, Mic, CreditCard, ChevronRight } from 'lucide-react';

interface ProfileProps {
  user: UserProfile;
  changeView: (view: ViewState) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, changeView }) => {
  return (
    <div className="p-6 pb-24 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
         <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-accent-primary to-blue-500 p-[2px]">
            <div className="w-full h-full rounded-full bg-bg-surface flex items-center justify-center text-2xl font-bold text-white">
               {user.name.charAt(0)}
            </div>
         </div>
         <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-neutral-dim text-sm">{user.nationality} • {user.ageGroup}</p>
         </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
         <div className="bg-bg-surface p-4 rounded-2xl border border-neutral-dim/5">
            <div className="text-xs text-neutral-dim mb-1">Current Goal</div>
            <div className="font-bold text-white">{user.examType} {user.targetScore}</div>
         </div>
         <div className="bg-bg-surface p-4 rounded-2xl border border-neutral-dim/5">
            <div className="text-xs text-neutral-dim mb-1">Total Points</div>
            <div className="font-bold text-accent-primary">{user.points}</div>
         </div>
      </div>

      {/* Menu */}
      <div className="space-y-2">
         <button 
            onClick={() => changeView(ViewState.VOICE_LAB)}
            className="w-full bg-bg-surface p-4 rounded-xl flex items-center justify-between hover:bg-bg-surface/80 transition-colors border border-accent-primary/10 hover:border-accent-primary/30 group"
         >
             <div className="flex items-center gap-4">
                <div className="w-5 h-5 flex items-center justify-center">
                    <Mic className="text-accent-primary group-hover:scale-110 transition-transform" size={20} />
                </div>
                <span className="text-white group-hover:text-accent-primary transition-colors">My AI Voice</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-xs bg-accent-primary/10 text-accent-primary px-2 py-1 rounded">Beta</span>
                <ChevronRight size={16} className="text-neutral-dim" />
             </div>
         </button>

         {[
            { icon: Award, label: 'Achievements' },
            { icon: Settings, label: 'Settings' },
         ].map(item => (
            <button key={item.label} className="w-full bg-bg-surface p-4 rounded-xl flex items-center justify-between hover:bg-bg-surface/80 transition-colors">
               <div className="flex items-center gap-4">
                  <item.icon className="text-neutral-dim" size={20} />
                  <span>{item.label}</span>
               </div>
               <div className="flex items-center gap-2">
                  <ChevronRight size={16} className="text-neutral-dim" />
               </div>
            </button>
         ))}
      </div>

      {/* Pro Banner */}
      {!user.isPro && (
         <button onClick={() => changeView(ViewState.PAYWALL)} className="w-full bg-gradient-to-r from-[#FE7733] to-[#F59E0B] p-6 rounded-3xl text-left relative overflow-hidden shadow-lg group">
            <div className="relative z-10">
               <h3 className="font-bold text-lg text-white mb-1">Upgrade to Pro</h3>
               <p className="text-white/80 text-xs mb-4">Unlock unlimited AI samples & shadowing.</p>
               <div className="bg-white/20 backdrop-blur-md inline-flex px-3 py-1.5 rounded-lg text-xs font-medium text-white group-hover:bg-white/30 transition-colors">
                  View Plans
               </div>
            </div>
            <Award className="absolute -bottom-4 -right-4 text-white/10 w-32 h-32 rotate-12" />
         </button>
      )}
    </div>
  );
};
