
import React from 'react';
import { ViewState } from '../types';
import { Home, BarChart2, Users, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView }) => {
  // Hide bottom nav on onboarding, evaluation flow, paywall OR voice lab
  const shouldHideNav = [
    ViewState.ONBOARDING, 
    ViewState.EVALUATION, 
    ViewState.PAYWALL,
    ViewState.VOICE_LAB 
  ].includes(currentView);

  return (
    <div className="min-h-screen bg-radial-premium text-neutral-text font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden bg-noise">
      
      {/* Global Ambient Lighting */}
      {/* Top Green Glow */}
      <div className="fixed top-[-150px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent-primary/15 rounded-full blur-[160px] pointer-events-none animate-breathe-light z-0" />
      
      {/* Bottom Orange Glow */}
      <div className="fixed bottom-[-150px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent-secondary/10 rounded-full blur-[160px] pointer-events-none animate-breathe-light z-0" style={{ animationDelay: '2s' }} />

      {/* Main Content Area */}
      <main className="h-screen overflow-y-auto no-scrollbar relative z-10">
        {children}
      </main>

      {/* Bottom Navigation */}
      {!shouldHideNav && (
        <div className="absolute bottom-0 left-0 right-0 z-50">
           {/* Gradient fade from content to nav */}
           <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-bg-deep to-transparent pointer-events-none" />
           
           <div className="relative bg-bg-deep/60 backdrop-blur-xl border-t border-white/5 px-6 py-4 pb-8 flex justify-between items-center">
            <NavButton 
              active={currentView === ViewState.HOME} 
              onClick={() => onChangeView(ViewState.HOME)} 
              icon={Home} 
              label="Home" 
            />
            <NavButton 
              active={currentView === ViewState.STATS} 
              onClick={() => onChangeView(ViewState.STATS)} 
              icon={BarChart2} 
              label="Stats" 
            />
            <NavButton 
              active={currentView === ViewState.COMMUNITY} 
              onClick={() => onChangeView(ViewState.COMMUNITY)} 
              icon={Users} 
              label="Community" 
            />
            <NavButton 
              active={currentView === ViewState.PROFILE} 
              onClick={() => onChangeView(ViewState.PROFILE)} 
              icon={User} 
              label="Profile" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ElementType; label: string }> = ({ active, onClick, icon: Icon, label }) => (
  <button 
    onClick={onClick}
    className={`relative flex flex-col items-center gap-1.5 transition-all duration-300 group ${active ? 'text-accent-primary' : 'text-neutral-dim hover:text-white'}`}
  >
    {/* Active Glow Indicator behind icon */}
    {active && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-accent-primary/20 blur-xl rounded-full pointer-events-none" />
    )}
    
    <Icon size={24} strokeWidth={active ? 2.5 : 2} className={`transition-transform duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(177,250,99,0.4)]' : 'group-hover:scale-105'}`} />
    <span className="text-[10px] font-medium tracking-wide">{label}</span>
  </button>
);
