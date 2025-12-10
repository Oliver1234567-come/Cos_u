import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  const baseStyles = "relative py-3.5 px-6 rounded-2xl font-medium transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 overflow-hidden group";
  
  const variants = {
    // Gradient from brand color to slightly lighter for depth, plus inset highlight
    primary: "bg-gradient-to-br from-accent-primary to-[#9EF85A] text-bg-surface shadow-[0_4px_20px_rgba(177,250,99,0.25),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[0_4px_25px_rgba(177,250,99,0.35)] hover:brightness-105",
    
    // Subtle surface with glass feel
    secondary: "bg-bg-surface border border-white/5 text-neutral-text hover:bg-bg-surface/80 hover:border-white/10 shadow-sm",
    
    // Neon outline with glow
    outline: "bg-transparent border border-accent-primary/50 text-accent-primary hover:bg-accent-primary/5 hover:border-accent-primary shadow-[0_0_10px_rgba(177,250,99,0.05)]",
    
    ghost: "bg-transparent text-neutral-dim hover:text-neutral-text hover:bg-white/5"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {/* Shine effect on hover for primary */}
      {variant === 'primary' && (
        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out" />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
};