import React from 'react';
import { MOCK_COMMUNITY_POSTS } from '../constants';
import { Play, MessageSquare, Heart, Lock } from 'lucide-react';
import { Button } from '../components/Button';

export const Community: React.FC = () => {
  return (
    <div className="p-6 pb-24 space-y-6">
      <h1 className="text-2xl font-bold">Community</h1>

      {/* Level Tabs */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
         {['Band 6.0', 'Band 7.0', 'Band 8.0+'].map((level, i) => (
            <button 
              key={level}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium ${i === 0 ? 'bg-accent-primary text-bg-surface' : 'bg-bg-surface text-neutral-dim border border-neutral-dim/10'}`}
            >
              {level}
              {i === 2 && <Lock size={12} className="inline ml-2 opacity-50"/>}
            </button>
         ))}
      </div>

      <div className="space-y-4">
        {MOCK_COMMUNITY_POSTS.map(post => (
          <div key={post.id} className="bg-bg-surface p-4 rounded-2xl border border-neutral-dim/5 space-y-3">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <img src={post.avatar} alt={post.user} className="w-10 h-10 rounded-full bg-neutral-dim/10 object-cover" />
                   <div>
                      <div className="font-medium text-sm text-white">{post.user}</div>
                      <div className="text-xs text-neutral-dim">Score: <span className="text-accent-primary">{post.score}</span></div>
                   </div>
                </div>
                <button className="w-8 h-8 rounded-full bg-bg-DEFAULT flex items-center justify-center text-accent-primary">
                   <Play size={14} fill="currentColor" />
                </button>
             </div>
             
             <div className="bg-bg-DEFAULT/50 p-3 rounded-xl text-xs text-neutral-dim line-clamp-2">
                Topic: {post.topic}
             </div>

             <div className="flex items-center gap-6 text-neutral-dim text-sm pt-1">
                <button className="flex items-center gap-2 hover:text-accent-secondary transition-colors">
                   <Heart size={18} /> {post.likes}
                </button>
                <button className="flex items-center gap-2 hover:text-white transition-colors">
                   <MessageSquare size={18} /> {post.comments}
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};