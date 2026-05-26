"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { InboxPanel } from '../components/InboxPanel';
import { DraftEditor } from '../components/DraftEditor';
import { ToneLearningCenter } from '../components/ToneLearningCenter';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { FanMessage, Creator, AnalyticsData } from '../types';

const API_BASE = 'http://localhost:5000/api';
const CREATOR_ID = 'e2b2f518-7fba-4a57-b087-9bc401b3d0e2';
const WS_BASE = 'ws://localhost:5000';

export default function Home() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'inbox' | 'tone' | 'analytics'>('inbox');

  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [customMsgText, setCustomMsgText] = useState('');
  const [customMsgPlatform, setCustomMsgPlatform] = useState<'instagram' | 'twitter' | 'youtube'>('twitter');
  const [customMsgUser, setCustomMsgUser] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  // App data state
  const [messages, setMessages] = useState<FanMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<FanMessage | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState({ inbox: true, creator: true, analytics: true });

  // Filters state
  const [filterPlatform, setFilterPlatform] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterSentiment, setFilterSentiment] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy] = useState<string>('priority');

  // Tone testing state
  const [testComment, setTestComment] = useState('');
  const [testResults, setTestResults] = useState<any>(null);
  const [testingTone, setTestingTone] = useState(false);

  // Memory training state
  const [trainingInput, setTrainingInput] = useState('');
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Active reply draft state
  const [activeReplyType, setActiveReplyType] = useState<'short' | 'engaging' | 'premium_conversion'>('engaging');
  const [draftReplyText, setDraftReplyText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<{ id: string; text: string; type: 'info' | 'success' }[]>([]);

  // WebSocket reference
  const wsRef = useRef<WebSocket | null>(null);

  // Toast notifier
  const triggerNotification = (text: string, type: 'info' | 'success' = 'info') => {
    const id = Math.random().toString(36).substring(2, 11);
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  // Fetch data on load
  useEffect(() => {
    fetchCreatorData();
    fetchInbox();
    fetchAnalytics();
    checkSimulationStatus();

    // Setup event-driven WebSockets connection (replaces 5s polling)
    const connectWS = () => {
      console.log('Connecting to WebSocket server...');
      const ws = new WebSocket(WS_BASE);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connection established.');
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          
          if (payload.event === 'message:new') {
            const newMessage = payload.data as FanMessage;
            
            if (newMessage.creatorId === CREATOR_ID) {
              setMessages(prev => {
                if (prev.some(m => m.id === newMessage.id)) return prev;
                const updated = [newMessage, ...prev];
                
                // If no message is currently selected, select the new one automatically
                if (!selectedMessage && updated.length > 0) {
                  setSelectedMessage(updated[0]);
                }
                return updated;
              });

              triggerNotification(`New message processed from ${newMessage.senderUsername}!`, 'success');
              fetchAnalyticsSilent(); // dynamic updates
            }
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed. Reconnecting in 5s...');
        setTimeout(connectWS, 5000);
      };

      ws.onerror = (err) => {
        console.error('WebSocket encountered an error:', err);
      };
    };

    connectWS();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Sync draft reply editor
  useEffect(() => {
    if (selectedMessage && selectedMessage.replies) {
      const activeDraft = selectedMessage.replies.find(r => r.type === activeReplyType);
      setDraftReplyText(activeDraft ? activeDraft.text : '');
    } else {
      setDraftReplyText('');
    }
  }, [selectedMessage, activeReplyType]);

  // Refetch inbox when filters change
  useEffect(() => {
    fetchInbox();
  }, [filterPlatform, filterCategory, filterSentiment, searchQuery]);

  // API Fetch Actions
  const fetchCreatorData = async () => {
    try {
      const res = await fetch(`${API_BASE}/memory/${CREATOR_ID}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch creator');
      setCreator(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, creator: false }));
    }
  };

  const fetchInbox = async () => {
    setLoading(prev => ({ ...prev, inbox: true }));
    try {
      let url = `${API_BASE}/inbox?creatorId=${CREATOR_ID}&sort=${sortBy}`;
      if (filterPlatform) url += `&platform=${filterPlatform}`;
      if (filterCategory) url += `&category=${filterCategory}`;
      if (filterSentiment) url += `&sentiment=${filterSentiment}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch inbox');
      
      setMessages(data);
      if (data.length > 0 && !selectedMessage) {
        setSelectedMessage(data[0]);
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to fetch inbox feed', 'info');
    } finally {
      setLoading(prev => ({ ...prev, inbox: false }));
    }
  };

  const fetchAnalytics = async () => {
    setLoading(prev => ({ ...prev, analytics: true }));
    try {
      const res = await fetch(`${API_BASE}/analytics/${CREATOR_ID}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch analytics');
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, analytics: false }));
    }
  };

  const fetchAnalyticsSilent = async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/${CREATOR_ID}`);
      const data = await res.json();
      if (res.ok) setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const checkSimulationStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/simulation/status`);
      const data = await res.json();
      setIsSimulating(data.isSimulating);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSimulation = async () => {
    try {
      const endpoint = isSimulating ? 'stop' : 'start';
      const res = await fetch(`${API_BASE}/simulation/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId: CREATOR_ID, intervalMs: 15000 })
      });
      const data = await res.json();
      if (res.ok) {
        setIsSimulating(data.isSimulating);
        triggerNotification(
          data.isSimulating 
            ? 'Live queue stream simulation activated (15s intervals)' 
            : 'Simulation stream stopped.',
          'success'
        );
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to toggle simulation status', 'info');
    }
  };

  const triggerManualMessage = async () => {
    try {
      const res = await fetch(`${API_BASE}/simulation/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId: CREATOR_ID })
      });
      if (res.ok) {
        triggerNotification('Job queued in Redis for simulated message!', 'success');
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to queue simulated message', 'info');
    }
  };

  const triggerCustomMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsgText.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/simulation/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: CREATOR_ID,
          text: customMsgText,
          platform: customMsgPlatform,
          senderUsername: customMsgUser.trim() ? (customMsgUser.startsWith('@') ? customMsgUser : `@${customMsgUser}`) : undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        triggerNotification('Custom message queued successfully in BullMQ!', 'success');
        setCustomMsgText('');
        setCustomMsgUser('');
        setShowCustomForm(false);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      triggerNotification(err.message || 'Error enqueuing custom message', 'info');
    }
  };

  const handleUpdateReplyText = async () => {
    if (!selectedMessage || !selectedMessage.replies) return;
    const activeDraft = selectedMessage.replies.find(r => r.type === activeReplyType);
    if (!activeDraft) return;

    try {
      const res = await fetch(`${API_BASE}/inbox/reply/${activeDraft.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: draftReplyText })
      });
      if (res.ok) {
        triggerNotification('Reply draft updated locally', 'success');
        
        // Update local state
        setMessages(prev => prev.map(m => {
          if (m.id === selectedMessage.id && m.replies) {
            return {
              ...m,
              replies: m.replies.map(r => r.type === activeReplyType ? { ...r, text: draftReplyText, status: 'edited' } : r)
            };
          }
          return m;
        }));
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to update draft text', 'info');
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !selectedMessage.replies) return;
    const activeDraft = selectedMessage.replies.find(r => r.type === activeReplyType);
    if (!activeDraft) return;

    // Save changes first if text has changed
    if (activeDraft.text !== draftReplyText) {
      await handleUpdateReplyText();
    }

    setSendingReply(true);
    try {
      const res = await fetch(`${API_BASE}/inbox/reply/${activeDraft.id}/send`, {
        method: 'POST'
      });
      if (res.ok) {
        triggerNotification('Draft response dispatched to social platform API!', 'success');
        
        // Update local states
        setMessages(prev => prev.map(m => {
          if (m.id === selectedMessage.id) {
            return {
              ...m,
              status: 'replied' as const,
              replies: m.replies?.map(r => r.type === activeReplyType ? { ...r, status: 'sent' as const } : r)
            };
          }
          return m;
        }));
        
        fetchAnalyticsSilent();
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to send reply', 'info');
    } finally {
      setSendingReply(false);
    }
  };

  const handleArchiveMessage = async (msgId: string) => {
    try {
      const res = await fetch(`${API_BASE}/inbox/message/${msgId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' })
      });
      if (res.ok) {
        triggerNotification('Message thread archived', 'info');
        
        // Remove locally or update status
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'archived' as const } : m));
        fetchAnalyticsSilent();
        
        if (selectedMessage?.id === msgId) {
          setSelectedMessage(null);
        }
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to archive message', 'info');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftReplyText);
    setCopySuccess(true);
    triggerNotification('Draft copied to clipboard!', 'success');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const runToneTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testComment.trim()) return;

    setTestingTone(true);
    setTestResults(null);
    try {
      const res = await fetch(`${API_BASE}/memory/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: CREATOR_ID,
          messageText: testComment
        })
      });
      const data = await res.json();
      if (res.ok) {
        setTestResults(data);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      triggerNotification(err.message || 'Error executing style test', 'info');
    } finally {
      setTestingTone(false);
    }
  };

  const runToneTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainingInput.trim()) return;

    const samples = trainingInput
      .split('\n\n')
      .map(s => s.trim())
      .filter(s => s.length > 5);

    if (samples.length === 0) {
      triggerNotification('Please separate writing samples with double new lines', 'info');
      return;
    }

    setTrainingStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/memory/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: CREATOR_ID,
          samples
        })
      });
      const data = await res.json();
      if (res.ok) {
        setTrainingStatus('success');
        triggerNotification('Tone learning models updated with new samples!', 'success');
        setTrainingInput('');
        fetchCreatorData(); // refresh tone metrics
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      setTrainingStatus('error');
      triggerNotification(err.message || 'Error training memory module', 'info');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#060608] text-zinc-100 antialiased">
      
      {/* Toast notifications container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-md text-sm transition-all duration-300 animate-slide-in ${
              n.type === 'success' 
                ? 'bg-purple-950/40 border-purple-500/30 text-purple-200' 
                : 'bg-zinc-950/70 border-zinc-800 text-zinc-300'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${n.type === 'success' ? 'text-purple-400' : 'text-zinc-400'}`} />
            <span>{n.text}</span>
          </div>
        ))}
      </div>

      {/* SIDEBAR NAVIGATION */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSimulating={isSimulating}
        toggleSimulation={toggleSimulation}
        triggerManualMessage={triggerManualMessage}
        customMsgText={customMsgText}
        setCustomMsgText={setCustomMsgText}
        customMsgPlatform={customMsgPlatform}
        setCustomMsgPlatform={setCustomMsgPlatform}
        customMsgUser={customMsgUser}
        setCustomMsgUser={setCustomMsgUser}
        showCustomForm={showCustomForm}
        setShowCustomForm={setShowCustomForm}
        triggerCustomMessage={triggerCustomMessage}
        messages={messages}
        creator={creator}
      />

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col bg-[#060608] overflow-hidden">
        
        {/* VIEW 1: INBOX */}
        {activeTab === 'inbox' && (
          <div className="flex-1 flex h-full overflow-hidden">
            
            {/* INBOX LEFT COLUMN: MESSAGES LIST */}
            <InboxPanel
              messages={messages}
              selectedMessage={selectedMessage}
              setSelectedMessage={setSelectedMessage}
              loadingInbox={loading.inbox}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterPlatform={filterPlatform}
              setFilterPlatform={setFilterPlatform}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              filterSentiment={filterSentiment}
              setFilterSentiment={setFilterSentiment}
            />

            {/* INBOX RIGHT COLUMN: DETAILED VIEW */}
            <DraftEditor
              selectedMessage={selectedMessage}
              handleArchiveMessage={handleArchiveMessage}
              activeReplyType={activeReplyType}
              setActiveReplyType={setActiveReplyType}
              draftReplyText={draftReplyText}
              setDraftReplyText={setDraftReplyText}
              handleCopy={handleCopy}
              copySuccess={copySuccess}
              handleUpdateReplyText={handleUpdateReplyText}
              handleSendReply={handleSendReply}
              sendingReply={sendingReply}
            />

          </div>
        )}

        {/* VIEW 2: TONE LEARNING & WRITING SAMPLES */}
        {activeTab === 'tone' && (
          <ToneLearningCenter
            creator={creator}
            trainingInput={trainingInput}
            setTrainingInput={setTrainingInput}
            trainingStatus={trainingStatus}
            runToneTraining={runToneTraining}
            testComment={testComment}
            setTestComment={setTestComment}
            testingTone={testingTone}
            runToneTest={runToneTest}
            testResults={testResults}
          />
        )}

        {/* VIEW 3: ANALYTICS INSIGHTS DASHBOARD */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            analytics={analytics}
            loadingAnalytics={loading.analytics}
            fetchAnalytics={fetchAnalytics}
          />
        )}

      </main>

    </div>
  );
}
