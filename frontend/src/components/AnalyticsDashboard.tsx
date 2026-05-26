import React from 'react';
import { RefreshCw, MessageSquare, DollarSign, TrendingUp, Users } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { AnalyticsData } from '../types';

interface AnalyticsDashboardProps {
  analytics: AnalyticsData | null;
  loadingAnalytics: boolean;
  fetchAnalytics: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  analytics,
  loadingAnalytics,
  fetchAnalytics,
}) => {
  const formatSegmentsData = () => {
    if (!analytics) return [];
    return [
      { name: 'Sponsors', value: analytics.segments.sponsorInquiry, color: '#a855f7' },
      { name: 'VIPs', value: analytics.segments.vipSupporter, color: '#pink-500' },
      { name: 'Potential Subs', value: analytics.segments.potentialSubscriber, color: '#06b6d4' },
      { name: 'Loyal Fans', value: analytics.segments.loyalFan, color: '#10b981' },
      { name: 'Casual', value: analytics.segments.casualFollower, color: '#6366f1' },
      { name: 'Spam/Troll', value: analytics.segments.spamTroll, color: '#ef4444' },
    ].filter(item => item.value > 0);
  };

  const formatSentimentData = () => {
    if (!analytics) return [];
    return [
      { name: 'Positive', value: analytics.sentiment.positive, color: '#10b981' },
      { name: 'Neutral', value: analytics.sentiment.neutral, color: '#6b7280' },
      { name: 'Negative', value: analytics.sentiment.negative, color: '#ef4444' },
    ];
  };

  if (loadingAnalytics || !analytics) {
    return (
      <div className="flex-1 overflow-y-auto p-8 max-w-6xl w-full mx-auto flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col items-center justify-center h-96 gap-3">
          <RefreshCw className="w-6 h-6 text-purple-500 animate-spin" />
          <span className="text-xs text-zinc-500">Aggregating analytics records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-6xl w-full mx-auto flex flex-col gap-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">AI Insights Dashboard</h2>
          <p className="text-xs text-zinc-500 mt-1">Analytics snapshots compiled dynamically from database messages classifications and monetization actions.</p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 transition-all flex items-center justify-center"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* 4 Cards Grid */}
        <div className="grid grid-cols-4 gap-5">
          {/* Total Inbox */}
          <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Inbound</span>
              <span className="text-2xl font-bold tracking-tight">{analytics.summary.totalMessages}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800">
              <MessageSquare className="w-4 h-4 text-purple-400" />
            </div>
          </div>

          {/* Active Opportunities */}
          <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Monetization Deals</span>
              <span className="text-2xl font-bold tracking-tight text-amber-400">{analytics.monetization.totalOpportunities}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          {/* Estimated Potential Value */}
          <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Revenue Potential</span>
              <span className="text-2xl font-bold tracking-tight text-emerald-400">
                ${analytics.monetization.totalPotentialValue.toLocaleString()}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Reply Conversion Rate */}
          <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Reply Action Rate</span>
              <span className="text-2xl font-bold tracking-tight text-purple-400">{analytics.summary.replyRatePct}%</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Interactive Chart Row */}
        <div className="grid grid-cols-3 gap-6">
          
          {/* Area Chart: message trends */}
          <div className="col-span-2 border border-zinc-900 bg-zinc-950/20 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Inbound Engagement Trends</span>
              <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-semibold">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Messages</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Replies</span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.trends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReplies" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px', color: '#f4f4f5' }}
                  />
                  <Area type="monotone" dataKey="messages" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorMessages)" />
                  <Area type="monotone" dataKey="replies" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReplies)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Fan Segments */}
          <div className="col-span-1 border border-zinc-900 bg-zinc-950/20 rounded-xl p-5 flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Fan Category Segments</span>
            
            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formatSegmentsData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {formatSegmentsData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px', color: '#f4f4f5' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Inner counter */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-bold tracking-tight">{analytics.summary.totalMessages}</span>
                <span className="text-[8px] text-zinc-500 font-bold uppercase">Contacts</span>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1.5 border-t border-zinc-900/60">
              {formatSegmentsData().map((entry, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[9px] text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                  <span className="truncate">{entry.name}: <strong>{entry.value}</strong></span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Row grid */}
        <div className="grid grid-cols-5 gap-6">
          
          {/* Sentiment distribution bar chart */}
          <div className="col-span-2 border border-zinc-900 bg-zinc-950/20 rounded-xl p-5 flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Sentiment Distribution</span>
            
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatSentimentData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px', color: '#f4f4f5' }}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {formatSentimentData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monetization conversion statuses funnel */}
          <div className="col-span-3 border border-zinc-900 bg-zinc-950/20 rounded-xl p-5 flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Monetization Funnel Audit</span>
            
            <div className="flex flex-col gap-4 justify-center h-full">
              
              {/* sponsorship */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-400">Brand Sponsorships</span>
                  <span className="font-bold text-amber-400">${analytics.monetization.valueByType.sponsorship?.toLocaleString() || 0} USD</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ 
                      width: `${analytics.monetization.totalPotentialValue > 0 
                        ? (analytics.monetization.valueByType.sponsorship / analytics.monetization.totalPotentialValue) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* premium subscriptions */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-400">Premium Communities (Discord / Mastermind)</span>
                  <span className="font-bold text-cyan-400">${analytics.monetization.valueByType.subscription?.toLocaleString() || 0} USD</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 rounded-full" 
                    style={{ 
                      width: `${analytics.monetization.totalPotentialValue > 0 
                        ? (analytics.monetization.valueByType.subscription / analytics.monetization.totalPotentialValue) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Merch sales */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-400">Merchandise Storefront</span>
                  <span className="font-bold text-pink-400">${analytics.monetization.valueByType.merch?.toLocaleString() || 0} USD</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-pink-500 rounded-full" 
                    style={{ 
                      width: `${analytics.monetization.totalPotentialValue > 0 
                        ? (analytics.monetization.valueByType.merch / analytics.monetization.totalPotentialValue) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
