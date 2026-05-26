import React from 'react';
import { 
  Inbox, 
  Brain, 
  BarChart3, 
  Square, 
  Play, 
  Plus, 
  ChevronRight, 
  Twitter, 
  Instagram, 
  Youtube, 
  Send 
} from 'lucide-react';
import { Creator, FanMessage } from '../types';

interface SidebarProps {
  activeTab: 'inbox' | 'tone' | 'analytics';
  setActiveTab: (tab: 'inbox' | 'tone' | 'analytics') => void;
  isSimulating: boolean;
  toggleSimulation: () => void;
  triggerManualMessage: () => void;
  customMsgText: string;
  setCustomMsgText: (val: string) => void;
  customMsgPlatform: 'instagram' | 'twitter' | 'youtube';
  setCustomMsgPlatform: (val: 'instagram' | 'twitter' | 'youtube') => void;
  customMsgUser: string;
  setCustomMsgUser: (val: string) => void;
  showCustomForm: boolean;
  setShowCustomForm: (val: boolean) => void;
  triggerCustomMessage: (e: React.FormEvent) => void;
  messages: FanMessage[];
  creator: Creator | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isSimulating,
  toggleSimulation,
  triggerManualMessage,
  customMsgText,
  setCustomMsgText,
  customMsgPlatform,
  setCustomMsgPlatform,
  customMsgUser,
  setCustomMsgUser,
  showCustomForm,
  setShowCustomForm,
  triggerCustomMessage,
  messages,
  creator,
}) => {
  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <aside className="w-72 flex-shrink-0 flex flex-col border-r border-[#1a1a24] bg-[#0b0b0f] p-5 justify-between">
      <div className="flex flex-col gap-8">
        
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-md shadow-purple-500/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-md">FanTwin <span className="text-purple-400">AI</span></h1>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Creator Twin Engine</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
              activeTab === 'inbox' 
                ? 'bg-purple-600/10 border border-purple-500/20 text-purple-300 font-medium' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Inbox className="w-4 h-4" />
              <span>AI Inbox Feed</span>
            </div>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tone')}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
              activeTab === 'tone' 
                ? 'bg-purple-600/10 border border-purple-500/20 text-purple-300 font-medium' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Tone Learning Center</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
              activeTab === 'analytics' 
                ? 'bg-purple-600/10 border border-purple-500/20 text-purple-300 font-medium' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Insights Analytics</span>
          </button>
        </nav>

        {/* SIMULATION CONTROL BOARD */}
        <div className="border border-zinc-800/60 rounded-xl bg-zinc-950/40 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Live Ingest Simulator</span>
            <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-purple-500 glow-indicator' : 'bg-zinc-700'}`}></span>
          </div>
          
          <button
            onClick={toggleSimulation}
            className={`w-full py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-2 transition-all ${
              isSimulating 
                ? 'bg-purple-950/20 border-purple-500/30 text-purple-300 hover:bg-purple-950/40' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {isSimulating ? (
              <>
                <Square className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
                <span>Pause Stream</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-zinc-400 text-zinc-400" />
                <span>Activate Live Stream</span>
              </>
            )}
          </button>

          <button
            onClick={triggerManualMessage}
            className="w-full py-2 px-3 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simulate Random Inbox</span>
          </button>

          {/* Custom Simulation Toggler */}
          <div className="mt-1 border-t border-zinc-900 pt-2">
            <button 
              onClick={() => setShowCustomForm(!showCustomForm)}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center justify-between w-full"
            >
              <span>Simulate custom comment</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showCustomForm ? 'rotate-90' : ''}`} />
            </button>

            {showCustomForm && (
              <form onSubmit={triggerCustomMessage} className="mt-2 flex flex-col gap-2 animate-fade-in">
                <div className="flex gap-1.5">
                  <button 
                    type="button" 
                    onClick={() => setCustomMsgPlatform('twitter')}
                    className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold transition-all ${customMsgPlatform === 'twitter' ? 'bg-sky-500/20 border border-sky-400/30 text-sky-400' : 'bg-zinc-900 text-zinc-500 border border-transparent'}`}
                  >
                    Twitter
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setCustomMsgPlatform('instagram')}
                    className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold transition-all ${customMsgPlatform === 'instagram' ? 'bg-pink-500/20 border border-pink-400/30 text-pink-400' : 'bg-zinc-900 text-zinc-500 border border-transparent'}`}
                  >
                    Insta
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setCustomMsgPlatform('youtube')}
                    className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold transition-all ${customMsgPlatform === 'youtube' ? 'bg-red-500/20 border border-red-400/30 text-red-400' : 'bg-zinc-900 text-zinc-500 border border-transparent'}`}
                  >
                    Youtube
                  </button>
                </div>
                <input 
                  type="text" 
                  placeholder="Username e.g. brand_deal" 
                  value={customMsgUser}
                  onChange={(e) => setCustomMsgUser(e.target.value)}
                  className="w-full text-[10px] bg-zinc-900 border border-zinc-800 rounded px-2 py-1 focus:outline-none focus:border-zinc-700 text-zinc-300"
                />
                <textarea 
                  placeholder="Enter follower message..."
                  value={customMsgText}
                  onChange={(e) => setCustomMsgText(e.target.value)}
                  rows={2}
                  className="w-full text-[10px] bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 focus:outline-none focus:border-zinc-700 text-zinc-300 resize-none"
                />
                <button 
                  type="submit"
                  className="w-full py-1.5 rounded text-[10px] font-semibold bg-purple-600 text-white hover:bg-purple-500 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-2.5 h-2.5" />
                  <span>Run AI Classification</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* Creator Info Profile Card Footer */}
      {creator && (
        <div className="flex items-center gap-3 border-t border-zinc-900 pt-4 mt-auto">
          <img 
            src={creator.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
            alt={creator.name} 
            className="w-9 h-9 rounded-full object-cover border border-zinc-800"
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-zinc-200">{creator.name}</span>
            <span className="text-[10px] text-zinc-500">@{creator.handle}</span>
          </div>
        </div>
      )}
    </aside>
  );
};
