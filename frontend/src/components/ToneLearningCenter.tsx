import React from 'react';
import { Sparkles, Brain, RefreshCw, Layers, Play } from 'lucide-react';
import { Creator } from '../types';

interface ToneLearningCenterProps {
  creator: Creator | null;
  trainingInput: string;
  setTrainingInput: (val: string) => void;
  trainingStatus: 'idle' | 'loading' | 'success' | 'error';
  runToneTraining: (e: React.FormEvent) => void;
  testComment: string;
  setTestComment: (val: string) => void;
  testingTone: boolean;
  runToneTest: (e: React.FormEvent) => void;
  testResults: any;
}

export const ToneLearningCenter: React.FC<ToneLearningCenterProps> = ({
  creator,
  trainingInput,
  setTrainingInput,
  trainingStatus,
  runToneTraining,
  testComment,
  setTestComment,
  testingTone,
  runToneTest,
  testResults,
}) => {
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'sponsor_inquiry':
        return <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">Sponsor</span>;
      case 'vip_supporter':
        return <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300">VIP</span>;
      case 'potential_subscriber':
        return <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">Potential Sub</span>;
      case 'loyal_fan':
        return <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-350">Loyal Fan</span>;
      case 'spam_troll':
        return <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300">Spam / Troll</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">Casual</span>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-6xl w-full mx-auto flex flex-col gap-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Tone Learning Center</h2>
          <p className="text-xs text-zinc-500 mt-1">Train your AI twin to write replies using your vocabulary, emojis, slang usage, and content priorities.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-950/20 border border-purple-500/20 text-purple-400 text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Memory Profile Configured</span>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-5 gap-8">
        
        {/* Left Column: Style Parameters Panel */}
        <div className="col-span-2 flex flex-col gap-6">
          
          {/* Metric sliders */}
          {creator && creator.toneProfile && (
            <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-5 flex flex-col gap-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Tone Metrics Breakdown</h3>
              
              <div className="flex flex-col gap-4">
                {/* Professionalism */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-400">Formal Professionalism</span>
                    <span className="font-bold text-purple-400">{Math.round(creator.toneProfile.professionalism * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${creator.toneProfile.professionalism * 100}%` }}></div>
                  </div>
                </div>

                {/* Humor */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-400">Witty Humor</span>
                    <span className="font-bold text-purple-400">{Math.round(creator.toneProfile.humor * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${creator.toneProfile.humor * 100}%` }}></div>
                  </div>
                </div>

                {/* Slang Usage */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-400">Slang & Casualness</span>
                    <span className="font-bold text-purple-400">{Math.round(creator.toneProfile.slangUsage * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${creator.toneProfile.slangUsage * 100}%` }}></div>
                  </div>
                </div>

                {/* Emojis */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-400">Emoji Frequency</span>
                    <span className="font-bold text-purple-400">{Math.round(creator.toneProfile.emojiFrequency * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${creator.toneProfile.emojiFrequency * 100}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-900 pt-4 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Top Emojis Cache</span>
                <div className="flex gap-2">
                  {creator.toneProfile.topEmojis.split(',').map((emoji, index) => (
                    <span key={index} className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm">
                      {emoji}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Analyzed Description Card */}
          {creator && creator.toneProfile && (
            <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-5 flex flex-col gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Learned Style Profile</span>
              <p className="text-xs leading-relaxed text-zinc-400">
                {creator.toneProfile.styleDescription}
              </p>
              <div className="border-t border-zinc-900 pt-3 mt-1.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Response Rule Constraints</span>
                <p className="text-[11px] leading-relaxed text-zinc-500 italic">
                  "{creator.toneProfile.rules}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Ingest writing samples & Tone Testing Lab */}
        <div className="col-span-3 flex flex-col gap-8">
          
          {/* Tone training upload */}
          <div className="border border-zinc-900 rounded-xl p-6 bg-zinc-950/20 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <Brain className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Ingest Style Samples</h3>
            </div>

            <form onSubmit={runToneTraining} className="flex flex-col gap-3">
              <p className="text-xs text-zinc-500">
                Paste samples of your previous tweets, replies, captions, or transcripts. Separate distinct writing samples with a <strong>double new line (double enter)</strong>.
              </p>
              
              <textarea
                value={trainingInput}
                onChange={(e) => setTrainingInput(e.target.value)}
                rows={5}
                className="w-full text-xs bg-zinc-950 border border-zinc-900 rounded-xl p-4 focus:outline-none focus:border-zinc-850 text-zinc-300 placeholder-zinc-700 leading-relaxed resize-none"
                placeholder="Sample Tweet 1: Building startups in public has been the wildest journey...&#10;&#10;Sample Reply 2: Hit me up in the DMs! Let's arrange a quick sponsored video review..."
              />

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500">
                  {trainingInput.split('\n\n').filter(Boolean).length} distinct samples ready.
                </span>

                <button
                  type="submit"
                  disabled={trainingStatus === 'loading'}
                  className="px-4.5 py-2.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {trainingStatus === 'loading' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing Style...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Analyze Writing Style</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Tone test lab playground */}
          <div className="border border-zinc-900 rounded-xl p-6 bg-zinc-950/20 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Tone Testing Playground</h3>
            </div>

            <form onSubmit={runToneTest} className="flex flex-col gap-3">
              <p className="text-xs text-zinc-500">
                Submit a mock follower comment to test how the trained AI Twin analyzes intent and drafts reply responses under your profile.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={testComment}
                  onChange={(e) => setTestComment(e.target.value)}
                  placeholder="e.g. I want to buy your merch and sponsor your upcoming tech stream!"
                  className="flex-1 text-xs bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 focus:outline-none focus:border-zinc-850 text-zinc-300 placeholder-zinc-700"
                />
                
                <button
                  type="submit"
                  disabled={testingTone || !testComment.trim()}
                  className="px-4 py-3 rounded-xl text-xs font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-850 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {testingTone ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>Test Reply</span>
                </button>
              </div>
            </form>

            {/* Test output display */}
            {testResults && (
              <div className="border border-zinc-900 rounded-xl p-4 bg-zinc-950/50 mt-2 flex flex-col gap-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Tone Output Results</span>
                  <div className="flex gap-2">
                    {getCategoryBadge(testResults.analysis.category)}
                    <span className="text-[10px] font-bold text-purple-400">P-{testResults.analysis.priorityScore} Priority</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-600 font-semibold uppercase">Engaging Reply Draft:</span>
                    <p className="text-xs leading-relaxed text-zinc-300 italic">
                      "{testResults.drafts.engaging}"
                    </p>
                  </div>

                  {testResults.analysis.hasMonetization && testResults.analysis.monetization && (
                    <div className="mt-1 bg-amber-500/5 border border-amber-500/10 rounded-lg p-2.5 text-xs text-amber-200">
                      <span className="font-bold text-amber-400">Opportunity Detected:</span> {testResults.analysis.monetization.type} (${testResults.analysis.monetization.estimatedValue} value)
                      <div className="text-[10px] text-amber-300/80 mt-1">Plan: {testResults.analysis.monetization.actionPlan}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
