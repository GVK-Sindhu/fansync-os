import React from 'react';
import { motion } from 'framer-motion';
import { FanMessage } from '../types';
import { ThumbsUp, ThumbsDown, Meh, Twitter, Instagram, Youtube, MessageSquare } from 'lucide-react';

interface MessageCardProps {
  msg: FanMessage;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

export const MessageCard: React.FC<MessageCardProps> = ({ msg, isSelected, onClick, index }) => {
  const priority = msg.analysis?.priorityScore || 0;

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />;
      case 'negative': return <ThumbsDown className="w-3.5 h-3.5 text-rose-500" />;
      default: return <Meh className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="w-3.5 h-3.5 text-sky-450" />;
      case 'instagram': return <Instagram className="w-3.5 h-3.5 text-pink-500" />;
      case 'youtube': return <Youtube className="w-3.5 h-3.5 text-red-500" />;
      default: return <MessageSquare className="w-3.5 h-3.5" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'sponsor_inquiry':
        return <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">Sponsor</span>;
      case 'vip_supporter':
        return <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300">VIP</span>;
      case 'potential_subscriber':
        return <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">Potential Sub</span>;
      case 'loyal_fan':
        return <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">Loyal Fan</span>;
      case 'spam_troll':
        return <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300">Spam / Troll</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">Casual</span>;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: Math.min(index * 0.02, 0.15)
      }}
      onClick={onClick}
      className={`p-4 flex flex-col gap-2.5 cursor-pointer transition-all border-l-2 ${
        isSelected 
          ? 'bg-zinc-900/40 border-purple-500 bg-opacity-70' 
          : 'border-transparent hover:bg-zinc-900/10'
      } ${msg.status === 'unread' ? 'bg-[#0b0b0e]' : 'opacity-85'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <img 
              src={msg.senderAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
              alt={msg.senderUsername} 
              className="w-7 h-7 rounded-full object-cover border border-zinc-800"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#060608] rounded-full p-0.5 border border-zinc-800 flex items-center justify-center">
              {getPlatformIcon(msg.platform)}
            </div>
          </div>
          <div className="flex flex-col">
            <span className={`text-xs font-semibold ${msg.status === 'unread' ? 'text-zinc-200' : 'text-zinc-450'}`}>
              {msg.senderName || msg.senderUsername}
            </span>
            <span className="text-[10px] text-zinc-500">{msg.senderUsername}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            priority >= 80 
              ? 'bg-purple-950/60 border border-purple-500/40 text-purple-300' 
              : priority >= 50 
              ? 'bg-indigo-950/40 border border-indigo-500/20 text-indigo-300' 
              : 'bg-zinc-900 border border-zinc-800 text-zinc-500'
          }`}>
            P-{priority}
          </span>
          {msg.status === 'unread' && (
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 glow-indicator"></span>
          )}
        </div>
      </div>

      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
        {msg.text}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {msg.analysis && getCategoryBadge(msg.analysis.category)}
          {msg.monetization && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
              ${msg.monetization.estimatedValue} Opportunity
            </span>
          )}
        </div>
        
        {msg.analysis && (
          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
            {getSentimentIcon(msg.analysis.sentiment)}
            <span className="capitalize">{msg.analysis.sentiment}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
