import React from 'react';
import { motion } from 'framer-motion';
import { FanMessage } from '../types';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Meh, 
  Twitter, 
  Instagram, 
  Youtube, 
  MessageSquare, 
  DollarSign, 
  Sparkles, 
  Check, 
  Copy, 
  Send, 
  RefreshCw 
} from 'lucide-react';

interface DraftEditorProps {
  selectedMessage: FanMessage | null;
  handleArchiveMessage: (id: string) => void;
  activeReplyType: 'short' | 'engaging' | 'premium_conversion';
  setActiveReplyType: (val: 'short' | 'engaging' | 'premium_conversion') => void;
  draftReplyText: string;
  setDraftReplyText: (val: string) => void;
  handleCopy: () => void;
  copySuccess: boolean;
  handleUpdateReplyText: () => void;
  handleSendReply: () => void;
  sendingReply: boolean;
}

export const DraftEditor: React.FC<DraftEditorProps> = ({
  selectedMessage,
  handleArchiveMessage,
  activeReplyType,
  setActiveReplyType,
  draftReplyText,
  setDraftReplyText,
  handleCopy,
  copySuccess,
  handleUpdateReplyText,
  handleSendReply,
  sendingReply,
}) => {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />;
      case 'negative': return <ThumbsDown className="w-3.5 h-3.5 text-rose-500" />;
      default: return <Meh className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="w-3.5 h-3.5 text-sky-400" />;
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

  if (!selectedMessage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <MessageSquare className="w-12 h-12 text-zinc-700 mb-3" />
        <h3 className="text-sm font-semibold text-zinc-400">No Message Selected</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm">Select an active message from the queue column on the left to review classification details and draft response replies.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#060608] overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        key={selectedMessage.id}
        className="p-6 flex flex-col gap-6 max-w-4xl w-full mx-auto"
      >
        
        {/* Detailed message header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-3">
            <img 
              src={selectedMessage.senderAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
              alt={selectedMessage.senderUsername} 
              className="w-11 h-11 rounded-full object-cover border border-zinc-800"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">{selectedMessage.senderName || selectedMessage.senderUsername}</h3>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">
                  {getPlatformIcon(selectedMessage.platform)}
                  <span className="capitalize">{selectedMessage.platform}</span>
                </div>
              </div>
              <span className="text-xs text-zinc-500">{selectedMessage.senderUsername}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">
              {new Date(selectedMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(selectedMessage.timestamp).toLocaleDateString()}
            </span>
            <button 
              onClick={() => handleArchiveMessage(selectedMessage.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
            >
              Archive Thread
            </button>
          </div>
        </div>

        {/* Original Follower Message Card */}
        <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/20 relative">
          <span className="absolute top-3 left-4 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Follower Message</span>
          <p className="text-sm leading-relaxed text-zinc-200 pt-4">
            "{selectedMessage.text}"
          </p>
        </div>

        {/* AI Analysis Diagnostic Panel */}
        {selectedMessage.analysis && (
          <div className="grid grid-cols-3 gap-4">
            
            {/* Priority and Sentiment Widget */}
            <div className="col-span-1 border border-zinc-900 rounded-xl p-4 bg-zinc-950/10 flex flex-col justify-between">
              <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">AI Diagnostics</span>
              <div className="flex items-center gap-4 my-2">
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 border-purple-500/20 bg-purple-950/10 shadow-inner">
                  <span className="text-md font-bold text-purple-300">{selectedMessage.analysis.priorityScore}</span>
                  <span className="text-[8px] text-purple-400 font-bold uppercase">Priority</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold capitalize text-zinc-300 flex items-center gap-1.5">
                    {getSentimentIcon(selectedMessage.analysis.sentiment)}
                    {selectedMessage.analysis.sentiment} Sentiment
                  </span>
                  <span className="text-[10px] text-zinc-500 capitalize">
                    {selectedMessage.analysis.category.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <span className="text-[9px] text-zinc-600">Confidence score: 96%</span>
            </div>

            {/* Reasoning Summary Card */}
            <div className="col-span-2 border border-zinc-900 rounded-xl p-4 bg-zinc-950/10 flex flex-col gap-2">
              <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">AI Classification Reasoning</span>
              <p className="text-xs leading-relaxed text-zinc-400">
                {selectedMessage.analysis.reasoning}
              </p>
            </div>

          </div>
        )}

        {/* MONETIZATION DETECTION PANEL */}
        {selectedMessage.monetization && (
          <div className="border border-amber-500/25 bg-amber-500/5 rounded-xl p-5 flex flex-col gap-3 shadow-md shadow-amber-500/[0.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Monetization Opportunity Detected</h4>
              </div>
              <span className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
                Estimated Value: ${selectedMessage.monetization.estimatedValue.toFixed(2)} USD
              </span>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">Category: <span className="text-amber-400 capitalize">{selectedMessage.monetization.type}</span></span>
              <p className="text-xs leading-relaxed text-amber-200/80 bg-amber-950/20 border border-amber-500/10 rounded-lg p-3">
                <span className="font-semibold text-amber-400">Suggested Action Plan:</span> {selectedMessage.monetization.actionPlan}
              </p>
            </div>
          </div>
        )}

        {/* DRAFT REPLY PANEL */}
        {selectedMessage.replies && selectedMessage.replies.length > 0 && (
          <div className="flex flex-col gap-4 border border-zinc-900 rounded-xl bg-zinc-950/20 p-5">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Trained Tone Reply Drafts</span>
              </div>
              
              {/* Selector tabs for different drafts */}
              <div className="flex bg-zinc-950 rounded-lg p-1 border border-zinc-900">
                <button
                  onClick={() => setActiveReplyType('short')}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all ${
                    activeReplyType === 'short' 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Short
                </button>
                <button
                  onClick={() => setActiveReplyType('engaging')}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all ${
                    activeReplyType === 'engaging' 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Engaging
                </button>
                <button
                  onClick={() => setActiveReplyType('premium_conversion')}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all ${
                    activeReplyType === 'premium_conversion' 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Conversion
                </button>
              </div>
            </div>

            {/* Reply Editor */}
            <div className="flex flex-col gap-3">
              <div className="relative">
                <textarea
                  value={draftReplyText}
                  onChange={(e) => setDraftReplyText(e.target.value)}
                  rows={4}
                  className="w-full text-xs bg-zinc-950 border border-zinc-900 rounded-xl p-4 focus:outline-none focus:border-zinc-800 text-zinc-300 leading-relaxed font-sans placeholder-zinc-700 resize-none"
                  placeholder="Loading AI Reply Draft..."
                />
                <span className="absolute bottom-3 right-3 text-[9px] text-zinc-600">
                  {draftReplyText.length} characters • {draftReplyText.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500">
                  * Changes are automatically saved on click send.
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-850 flex items-center gap-1.5 transition-all"
                  >
                    {copySuccess ? <Check className="w-3.5 h-3.5 text-accent-success" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copySuccess ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleUpdateReplyText}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-850 transition-all"
                  >
                    Save Draft
                  </button>

                  <button
                    onClick={handleSendReply}
                    disabled={sendingReply}
                    className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-tr from-purple-600 to-indigo-600 hover:opacity-95 shadow-md shadow-purple-500/10 flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {sendingReply ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Send Response</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </motion.div>
    </div>
  );
};
