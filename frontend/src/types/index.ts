export interface Creator {
  id: string;
  name: string;
  email: string;
  handle: string;
  avatarUrl: string | null;
  niche: string;
  createdAt: string;
  toneProfile?: ToneProfile;
  memories?: CreatorMemory[];
}

export interface ToneProfile {
  id: string;
  creatorId: string;
  averageLength: number;
  emojiFrequency: number;
  slangUsage: number;
  professionalism: number;
  humor: number;
  topEmojis: string;
  styleDescription: string;
  rules: string;
  updatedAt: string;
}

export interface CreatorMemory {
  id: string;
  creatorId: string;
  type: string;
  content: string;
  createdAt: string;
}

export interface AiAnalysis {
  id: string;
  messageId: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  category: 'loyal_fan' | 'casual_follower' | 'potential_subscriber' | 'sponsor_inquiry' | 'spam_troll' | 'vip_supporter';
  priorityScore: number;
  reasoning: string;
  hasMonetization: boolean;
  analyzedAt: string;
}

export interface MonetizationOpportunity {
  id: string;
  messageId: string;
  type: 'sponsorship' | 'merch' | 'subscription' | 'collaboration' | 'custom';
  estimatedValue: number;
  status: 'identified' | 'contacted' | 'converted' | 'dismissed';
  actionPlan: string;
  detectedAt: string;
}

export interface AiReplyDraft {
  id: string;
  messageId: string;
  type: 'short' | 'engaging' | 'premium_conversion';
  text: string;
  status: 'draft' | 'edited' | 'sent';
  createdAt: string;
}

export interface FanMessage {
  id: string;
  creatorId: string;
  platform: 'instagram' | 'youtube' | 'twitter';
  senderUsername: string;
  senderName: string | null;
  senderAvatarUrl: string | null;
  text: string;
  timestamp: string;
  status: 'unread' | 'replied' | 'archived';
  analysis?: AiAnalysis | null;
  monetization?: MonetizationOpportunity | null;
  replies?: AiReplyDraft[];
}

export interface AnalyticsSummary {
  totalMessages: number;
  repliedCount: number;
  unreadCount: number;
  archivedCount: number;
  replyRatePct: number;
}

export interface AnalyticsSentiment {
  positive: number;
  neutral: number;
  negative: number;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
}

export interface AnalyticsSegments {
  loyalFan: number;
  casualFollower: number;
  potentialSubscriber: number;
  sponsorInquiry: number;
  spamTroll: number;
  vipSupporter: number;
}

export interface AnalyticsMonetization {
  totalOpportunities: number;
  totalPotentialValue: number;
  convertedValue: number;
  activeNegotiationValue: number;
  valueByType: Record<string, number>;
  countByType: Record<string, number>;
}

export interface AnalyticsTrendEntry {
  name: string;
  messages: number;
  replies: number;
  monetization: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  sentiment: AnalyticsSentiment;
  segments: AnalyticsSegments;
  monetization: AnalyticsMonetization;
  platforms: Record<string, number>;
  trends: AnalyticsTrendEntry[];
}
