import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '../components/Button';
import { ViewState } from '../types';

interface PaywallProps {
  onClose: () => void;
}

export const Paywall: React.FC<PaywallProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-bg-DEFAULT overflow-y-auto">
      <div className="p-6 flex flex-col min-h-screen">
         <div className="flex justify-end">
            <button onClick={onClose} className="p-2 bg-bg-surface rounded-full text-neutral-dim hover:text-white">
               <X size={24} />
            </button>
         </div>

         <div className="text-center space-y-4 mt-4 mb-8">
            <h1 className="text-3xl font-bold">Unlock Your Full Potential</h1>
            <p className="text-neutral-dim">Get the score you deserve with Cos_u Pro.</p>
         </div>

         {/* Plans */}
         <div className="space-y-4 flex-1">
            {/* Popular Plan */}
            <div className="bg-bg-surface border-2 border-accent-primary rounded-3xl p-6 relative shadow-[0_0_20px_rgba(177,250,99,0.1)]">
               <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-primary text-bg-surface text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
               </div>
               <div className="flex justify-between items-end mb-4">
                  <div>
                     <div className="font-bold text-lg">Quarterly</div>
                     <div className="text-xs text-neutral-dim">Best for exam prep</div>
                  </div>
                  <div className="text-right">
                     <div className="text-2xl font-bold text-accent-primary">$49.99</div>
                     <div className="text-xs text-neutral-dim">every 3 months</div>
                  </div>
               </div>
               <ul className="space-y-3 text-sm text-neutral-dim mb-6">
                  <li className="flex items-center gap-2"><Check size={16} className="text-accent-primary"/> Unlimited AI Samples</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-accent-primary"/> Advanced Score Breakdown</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-accent-primary"/> Access to Band 8+ Community</li>
               </ul>
               <Button fullWidth>Start 7-Day Free Trial</Button>
            </div>

            {/* Monthly Plan */}
            <div className="bg-bg-surface border border-neutral-dim/10 rounded-3xl p-6">
               <div className="flex justify-between items-end mb-4">
                  <div className="font-bold text-lg">Monthly</div>
                  <div className="text-xl font-bold">$19.99<span className="text-xs font-normal text-neutral-dim">/mo</span></div>
               </div>
               <Button fullWidth variant="secondary">Select Monthly</Button>
            </div>
            
             {/* Lifetime */}
            <div className="bg-bg-surface border border-neutral-dim/10 rounded-3xl p-6 opacity-80">
               <div className="flex justify-between items-end mb-4">
                  <div className="font-bold text-lg">Lifetime</div>
                  <div className="text-xl font-bold">$149.99</div>
               </div>
               <Button fullWidth variant="ghost" className="border border-neutral-dim/20">One-time payment</Button>
            </div>
         </div>

         <p className="text-center text-xs text-neutral-dim/50 mt-8">
            Recurring billing. Cancel anytime. <br/>
            <span className="underline">Terms of Service</span> & <span className="underline">Privacy Policy</span>
         </p>
      </div>
    </div>
  );
};