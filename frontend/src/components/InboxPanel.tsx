import React from 'react';
import { Search, Filter, RefreshCw, Inbox } from 'lucide-react';
import { MessageCard } from './MessageCard';
import { FanMessage } from '../types';

interface InboxPanelProps {
  messages: FanMessage[];
  selectedMessage: FanMessage | null;
  setSelectedMessage: (msg: FanMessage) => void;
  loadingInbox: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterPlatform: string;
  setFilterPlatform: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  filterSentiment: string;
  setFilterSentiment: (val: string) => void;
}

export const InboxPanel: React.FC<InboxPanelProps> = ({
  messages,
  selectedMessage,
  setSelectedMessage,
  loadingInbox,
  searchQuery,
  setSearchQuery,
  filterPlatform,
  setFilterPlatform,
  filterCategory,
  setFilterCategory,
  filterSentiment,
  setFilterSentiment,
}) => {
  return (
    <div className="w-[420px] flex-shrink-0 flex flex-col border-r border-[#1a1a24] bg-[#08080b]">
      
      {/* Header with Search */}
      <div className="p-4 border-b border-zinc-900 flex flex-col gap-3 bg-[#0a0a0f]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-wide uppercase text-zinc-400">Fan Queue Feed</h2>
          <span className="text-[11px] text-zinc-500 font-medium">Sorted by AI priority</span>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search username or content..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-zinc-700 text-zinc-300 placeholder-zinc-500"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <div className="flex items-center gap-1 text-[10px] text-zinc-500 mr-1">
            <Filter className="w-2.5 h-2.5" />
            <span>Filter:</span>
          </div>

          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="text-[10px] bg-zinc-950 border border-zinc-850 rounded px-1.5 py-0.5 text-zinc-400 focus:outline-none"
          >
            <option value="">Platform (All)</option>
            <option value="twitter">X / Twitter</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-[10px] bg-zinc-950 border border-zinc-850 rounded px-1.5 py-0.5 text-zinc-400 focus:outline-none"
          >
            <option value="">Category (All)</option>
            <option value="sponsor_inquiry">Sponsors</option>
            <option value="vip_supporter">VIPs</option>
            <option value="potential_subscriber">Potential Subs</option>
            <option value="loyal_fan">Loyals</option>
            <option value="spam_troll">Spam/Trolls</option>
          </select>

          <select
            value={filterSentiment}
            onChange={(e) => setFilterSentiment(e.target.value)}
            className="text-[10px] bg-zinc-950 border border-zinc-855 rounded px-1.5 py-0.5 text-zinc-400 focus:outline-none"
          >
            <option value="">Sentiment (All)</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>

          {(filterPlatform || filterCategory || filterSentiment || searchQuery) && (
            <button 
              onClick={() => {
                setFilterPlatform('');
                setFilterCategory('');
                setFilterSentiment('');
                setSearchQuery('');
              }}
              className="text-[9px] text-purple-400 hover:text-purple-300 font-semibold uppercase tracking-wider pl-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/60">
        {loadingInbox ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <RefreshCw className="w-5 h-5 text-purple-500 animate-spin" />
            <span className="text-xs text-zinc-500">Processing fan queue...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-48">
            <Inbox className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="text-xs text-zinc-400 font-medium">No messages match selected filters.</p>
            <p className="text-[11px] text-zinc-500 mt-1">Activate the simulation stream or simulate random inbox items on the sidebar.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageCard
              key={msg.id}
              msg={msg}
              isSelected={!!selectedMessage && selectedMessage.id === msg.id}
              onClick={() => setSelectedMessage(msg)}
              index={idx}
            />
          ))
        )}
      </div>
    </div>
  );
};
