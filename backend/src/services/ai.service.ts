import { OpenAI } from 'openai';
import { z } from 'zod';
import { config } from '../config';
import { Logger } from '../utils/logger';
import { ClassificationSchema } from './ai/classification.service';
import { MonetizationSchema } from './ai/monetization.service';
import { DraftSchema } from './ai/draft.service';

export const PipelineResultSchema = ClassificationSchema.merge(MonetizationSchema).extend({
  drafts: DraftSchema,
});

export type PipelineResult = z.infer<typeof PipelineResultSchema>;

interface SimilarMemory {
  content: string;
  type: string;
  similarity?: number;
}

export class AiService {
  private static openai: OpenAI | null = config.openaiApiKey 
    ? new OpenAI({ apiKey: config.openaiApiKey }) 
    : null;

  /**
   * Run the message through the full classification & reply generation pipeline
   */
  public static async analyzeMessage(
    messageText: string,
    creatorName: string,
    toneProfile: any,
    similarMemories: SimilarMemory[] = []
  ): Promise<PipelineResult> {
    if (config.mockAiPipeline || !this.openai) {
      return this.runMockPipeline(messageText, creatorName, toneProfile);
    }

    try {
      const prompt = this.compilePipelinePrompt(messageText, creatorName, toneProfile, similarMemories);
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert autonomous AI Agent acting as the digital twin of a top creator named ${creatorName}. 
Analyze the incoming fan message and reply to it in ${creatorName}'s exact tone. 
You must output a single, valid JSON object with the structure defined in the user's instructions.
No formatting other than pure JSON.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('OpenAI returned an empty response.');
      }

      // Parse JSON
      const rawResult = JSON.parse(content);
      
      // Validate schema using Zod
      const parsedResult = PipelineResultSchema.safeParse(rawResult);
      if (!parsedResult.success) {
        Logger.error('AiService', 'OpenAI response failed schema validation', parsedResult.error);
        throw new Error(`OpenAI response validation failed: ${parsedResult.error.message}`);
      }

      return parsedResult.data;
    } catch (error) {
      Logger.error('AiService', 'Error in OpenAI pipeline. Falling back to mock heuristics...', error);
      return this.runMockPipeline(messageText, creatorName, toneProfile);
    }
  }

  /**
   * Construct structured prompt combining context, message text, and writing style guidelines
   */
  private static compilePipelinePrompt(
    messageText: string,
    creatorName: string,
    toneProfile: any,
    similarMemories: SimilarMemory[]
  ): string {
    let memoriesContext = '';
    if (similarMemories.length > 0) {
      memoriesContext = `\nHere are historical writing samples from ${creatorName} matching this context for tone reference:\n` +
        similarMemories.map((m, idx) => `Sample ${idx + 1} (${m.type}): "${m.content}"`).join('\n') + `\n`;
    }

    return `Analyze this message from a follower:
"${messageText}"

Creator Name: ${creatorName}
Creator Style Profile:
- Description: ${toneProfile.styleDescription}
- Specific Rules: ${toneProfile.rules}
- Style Parameters (0 to 1 scales): Professionalism: ${toneProfile.professionalism}, Humor: ${toneProfile.humor}, Slang Usage: ${toneProfile.slangUsage}, Emoji Frequency: ${toneProfile.emojiFrequency} (Prefer: ${toneProfile.topEmojis})
${memoriesContext}
You must return a JSON object with this EXACT keys structure:
{
  "sentiment": "positive" | "neutral" | "negative",
  "category": "loyal_fan" | "casual_follower" | "potential_subscriber" | "sponsor_inquiry" | "spam_troll" | "vip_supporter",
  "priorityScore": 0-100 integer score,
  "reasoning": "brief explanation of why this category, sentiment, and priority score was assigned",
  "hasMonetization": true | false,
  "monetization": {
    "type": "sponsorship" | "merch" | "subscription" | "collaboration" | "custom",
    "estimatedValue": estimation of deal/purchase size in USD (0 if none),
    "actionPlan": "next step action suggestions"
  } or null,
  "drafts": {
    "short": "a quick, concise reply (max 15 words) matching tone rules",
    "engaging": "a conversational, engaging reply (40-60 words) that asks a follow up question",
    "premium_conversion": "a reply (30-50 words) that guides the fan towards a monetization channel like buying merch, joining a paid Discord, booking a consulting call, or signing up for subscriptions, depending on their message context"
  }
}

Ensure the replies sound natural, conversational, human, and match the style profile. Do not say "Hey there" or make generic statements if the rules suggest otherwise.`;
  }

  /**
   * Mock fallback pipeline using keyword heuristics and template generation
   */
  private static runMockPipeline(messageText: string, creatorName: string, toneProfile: any): PipelineResult {
    const textLower = messageText.toLowerCase();
    
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    let category: 'loyal_fan' | 'casual_follower' | 'potential_subscriber' | 'sponsor_inquiry' | 'spam_troll' | 'vip_supporter' = 'casual_follower';
    let priorityScore = 30;
    let hasMonetization = false;
    let monetizationType: 'sponsorship' | 'merch' | 'subscription' | 'collaboration' | 'custom' | null = null;
    let estimatedValue = 0;
    let actionPlan = '';

    const isSponsor = textLower.includes('sponsor') || textLower.includes('advertise') || textLower.includes('brand deal') || textLower.includes('paid partnership') || textLower.includes('marketing');
    const isMerch = textLower.includes('merch') || textLower.includes('tshirt') || textLower.includes('t-shirt') || textLower.includes('hoodie') || textLower.includes('store') || textLower.includes('shop') || textLower.includes('buy');
    const isPremiumSub = textLower.includes('community') || textLower.includes('discord') || textLower.includes('patreon') || textLower.includes('exclusive') || textLower.includes('member') || textLower.includes('premium');
    const isCollab = textLower.includes('collab') || textLower.includes('podcast') || textLower.includes('interview') || textLower.includes('co-create');
    const isVip = textLower.includes('donor') || textLower.includes('subscribed') || textLower.includes('fan since') || textLower.includes('love your work') || textLower.includes('saved my life');
    const isSpam = textLower.includes('crypto') || textLower.includes('invest') || textLower.includes('whatsapp') || textLower.includes('click link') || textLower.includes('dumb') || textLower.includes('sucks') || textLower.includes('hate you') || textLower.includes('fake');

    if (isSpam) {
      sentiment = textLower.includes('hate') || textLower.includes('sucks') ? 'negative' : 'neutral';
      category = 'spam_troll';
      priorityScore = 5;
    } else if (isSponsor) {
      sentiment = 'positive';
      category = 'sponsor_inquiry';
      priorityScore = 95;
      hasMonetization = true;
      monetizationType = 'sponsorship';
      estimatedValue = textLower.includes('budget') ? 1500 : 500;
      actionPlan = 'Provide media kit, rate sheet, and suggest booking a discovery call.';
    } else if (isMerch) {
      sentiment = 'positive';
      category = 'potential_subscriber';
      priorityScore = 80;
      hasMonetization = true;
      monetizationType = 'merch';
      estimatedValue = 45;
      actionPlan = 'Send link to merchandise store and highlight active discount codes.';
    } else if (isPremiumSub) {
      sentiment = 'positive';
      category = 'potential_subscriber';
      priorityScore = 85;
      hasMonetization = true;
      monetizationType = 'subscription';
      estimatedValue = 120;
      actionPlan = 'Pitch VIP Discord Server membership and provide conversion checkout link.';
    } else if (isVip) {
      sentiment = 'positive';
      category = 'vip_supporter';
      priorityScore = 90;
      hasMonetization = true;
      monetizationType = 'custom';
      estimatedValue = 100;
      actionPlan = 'Thank them deeply, highlight exclusive fan benefits, or invite to a private Q&A.';
    } else if (isCollab) {
      sentiment = 'neutral';
      category = 'casual_follower';
      priorityScore = 70;
      hasMonetization = true;
      monetizationType = 'collaboration';
      estimatedValue = 0;
      actionPlan = 'Evaluate their platform reach and suggest booking a quick alignment chat.';
    } else {
      if (textLower.includes('love') || textLower.includes('great') || textLower.includes('amazing') || textLower.includes('🔥') || textLower.includes('best')) {
        sentiment = 'positive';
        category = 'loyal_fan';
        priorityScore = 60;
      } else {
        sentiment = 'neutral';
        category = 'casual_follower';
        priorityScore = 40;
      }
    }

    const emojis = toneProfile.topEmojis.split(',');
    const e1 = emojis[0] || '✨';
    const e2 = emojis[1] || '🚀';
    const e3 = emojis[2] || '🔥';

    let reasoning = `Detected fan message matching ${category} keywords. Sentiment is ${sentiment}.`;
    if (hasMonetization) {
      reasoning += ` High monetization value detected for ${monetizationType} (estimated $${estimatedValue}).`;
    }

    let short = '';
    let engaging = '';
    let premium_conversion = '';

    if (category === 'spam_troll') {
      short = 'Thanks for your feedback.';
      engaging = 'We appreciate all types of feedback, positive or negative. Hope your day gets better!';
      premium_conversion = 'If you would like direct support or want to offer productive feedback, check out our support center.';
    } else if (category === 'sponsor_inquiry') {
      short = `Let's connect! Email us. ${e2}`;
      engaging = `I'd love to learn more about your brand and discuss how we can collaborate. Could you send over a brief proposal or campaign goals? ${e1}`;
      premium_conversion = `Thanks for reaching out! You can book a direct corporate sponsorship slot or download my media kit at creatorsite.com/sponsor. ${e2}`;
    } else if (category === 'potential_subscriber' && monetizationType === 'merch') {
      short = `Shop is open! Link in bio ${e3}`;
      engaging = `Yes, the new merch collection is live and we are shipping globally! Which design or size are you looking at? ${e1}`;
      premium_conversion = `Check out the full store at shop.fantwin.ai! Use code FANTWIN10 for 10% off your first purchase! ${e3}`;
    } else if (category === 'potential_subscriber' && monetizationType === 'subscription') {
      short = `Join the community! ${e2}`;
      engaging = `I'm super active in our private Discord! We host weekly AMA video sessions and share early-access videos. I'd love to see you in there. ${e1}`;
      premium_conversion = `You can join our premium club for just $9/mo at club.fantwin.ai and get direct messaging rights! ${e2}`;
    } else if (category === 'vip_supporter') {
      short = `You are the best! Thank you! ${e3}`;
      engaging = `Honestly, support like yours is the reason I started creating content. It means the world to me. How long have you been following the channel? ${e1}`;
      premium_conversion = `To show my appreciation, I'd love to invite you to our exclusive VIP group at club.fantwin.ai. Hope to chat soon! ${e2}`;
    } else {
      short = `Thanks for the support! ${e1}`;
      engaging = `Appreciate you taking the time to write this! I always love hearing what parts of my content resonate most with you. What did you think of the latest video? ${e2}`;
      premium_conversion = `If you want to support the channel and join our inner circle, check out our membership club at club.fantwin.ai. ${e3}`;
    }

    return {
      sentiment,
      category,
      priorityScore,
      reasoning,
      hasMonetization,
      monetization: hasMonetization ? {
        type: monetizationType || 'custom',
        estimatedValue,
        actionPlan
      } : null,
      drafts: {
        short,
        engaging,
        premium_conversion
      }
    };
  }
}
