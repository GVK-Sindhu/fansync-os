import { prisma } from '../config/db';
import { OpenAI } from 'openai';
import { config } from '../config';

interface TextAnalysisResult {
  averageLength: number;
  emojiFrequency: number;
  slangUsage: number;
  professionalism: number;
  humor: number;
  topEmojis: string;
  styleDescription: string;
  rules: string;
}

export class MemoryService {
  private static openai: OpenAI | null = config.openaiApiKey 
    ? new OpenAI({ apiKey: config.openaiApiKey }) 
    : null;

  /**
   * Core function to analyze a list of writing sample texts and update the Creator's ToneProfile
   */
  public static async analyzeWritingSamples(creatorId: string, samples: string[]): Promise<any> {
    if (samples.length === 0) {
      throw new Error('At least one writing sample is required.');
    }

    // 1. Store samples as CreatorMemory records
    const now = new Date().toISOString();
    await prisma.creatorMemory.createMany({
      data: samples.map(content => ({
        creatorId,
        type: 'sample',
        content,
        createdAt: now,
      })),
    });

    // 2. Perform style analysis (OpenAI or Local fallbacks)
    let analysisResult: TextAnalysisResult;
    if (config.mockAiPipeline || !this.openai) {
      analysisResult = this.runLocalAnalysis(samples);
    } else {
      analysisResult = await this.runOpenAiAnalysis(samples);
    }

    // 3. Upsert ToneProfile in DB
    const profile = await prisma.toneProfile.upsert({
      where: { creatorId },
      create: {
        creatorId,
        averageLength: analysisResult.averageLength,
        emojiFrequency: analysisResult.emojiFrequency,
        slangUsage: analysisResult.slangUsage,
        professionalism: analysisResult.professionalism,
        humor: analysisResult.humor,
        topEmojis: analysisResult.topEmojis,
        styleDescription: analysisResult.styleDescription,
        rules: analysisResult.rules,
        updatedAt: now,
      },
      update: {
        averageLength: analysisResult.averageLength,
        emojiFrequency: analysisResult.emojiFrequency,
        slangUsage: analysisResult.slangUsage,
        professionalism: analysisResult.professionalism,
        humor: analysisResult.humor,
        topEmojis: analysisResult.topEmojis,
        styleDescription: analysisResult.styleDescription,
        rules: analysisResult.rules,
        updatedAt: now,
      },
    });

    return profile;
  }

  /**
   * Local heuristic text metrics analyzer
   */
  private static runLocalAnalysis(samples: string[]): TextAnalysisResult {
    let totalChars = 0;
    let totalWords = 0;
    let emojiCount = 0;
    
    // Slang and professional vocabulary check
    const slangWords = ['bruh', 'bro', 'hype', 'lowkey', 'vibes', 'insane', 'wild', 'lit', 'fire', 'lmao', 'lol', 'yo', 'guy', 'dude', 'goat'];
    const profWords = ['opportunity', 'partnership', 'optimize', 'scalability', 'revenue', 'professional', 'sincerely', 'regards', 'platform', 'inquiry', 'campaign', 'marketing'];
    const humorWords = ['haha', 'lol', 'rofl', 'lmao', 'joke', 'funny', 'hilarious', '😂', '💀', '😭'];

    let slangHits = 0;
    let profHits = 0;
    let humorHits = 0;
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojiMap: Record<string, number> = {};

    samples.forEach(sample => {
      totalChars += sample.length;
      const words = sample.split(/\s+/).filter(w => w.length > 0);
      totalWords += words.length;

      // Extract emojis
      const emojis = sample.match(emojiRegex) || [];
      emojiCount += emojis.length;
      emojis.forEach(e => {
        emojiMap[e] = (emojiMap[e] || 0) + 1;
      });

      words.forEach(w => {
        const clean = w.toLowerCase().replace(/[^a-z]/g, '');
        if (slangWords.includes(clean)) slangHits++;
        if (profWords.includes(clean)) profHits++;
        if (humorWords.includes(clean)) humorHits++;
      });
    });

    const averageLength = Math.round(totalChars / samples.length);
    const emojiFrequency = totalWords > 0 ? parseFloat((emojiCount / totalWords).toFixed(3)) : 0;
    
    // Normalize percentages/ratios to 0-1 scale
    const slangUsage = Math.min(1.0, totalWords > 0 ? (slangHits / totalWords) * 15 : 0.2);
    const professionalism = Math.min(1.0, totalWords > 0 ? (profHits / totalWords) * 15 : 0.5);
    const humor = Math.min(1.0, totalWords > 0 ? (humorHits / totalWords) * 15 : 0.4);

    // Get top 3 emojis
    const sortedEmojis = Object.entries(emojiMap)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 3);
    const topEmojis = sortedEmojis.length > 0 ? sortedEmojis.join(',') : '🔥,✨,🚀';

    // Describe the profile based on scores
    let tone = 'conversational and authentic';
    if (professionalism > 0.6) tone = 'professional, authoritative, and direct';
    else if (slangUsage > 0.5) tone = 'highly casual, internet-native, and energetic';
    else if (humor > 0.6) tone = 'witty, light-hearted, and humorous';

    const styleDescription = `A creator who writes in a ${tone} tone, averaging ${averageLength} characters per post. They frequently use emojis like (${topEmojis}) and balance casual expression with engaging follower hooks.`;

    const rules = `Maintain a ${tone} presence; prioritize using ${topEmojis.split(',')[0] || '🔥'} when acknowledging compliments; keep response lengths around ${Math.round(averageLength / 6)} words.`;

    return {
      averageLength,
      emojiFrequency,
      slangUsage,
      professionalism,
      humor,
      topEmojis,
      styleDescription,
      rules,
    };
  }

  /**
   * OpenAI LLM writing style analyzer
   */
  private static async runOpenAiAnalysis(samples: string[]): Promise<TextAnalysisResult> {
    if (!this.openai) {
      throw new Error('OpenAI client is not initialized.');
    }

    const corpus = samples.map((s, idx) => `Sample ${idx + 1}: "${s}"`).join('\n\n');
    const prompt = `You are a professional linguistic researcher. Analyze the writing samples of a creator and compile a detailed style profile.
    
Writing Samples:
${corpus}

You must return a single, valid JSON object with these EXACT keys structure:
{
  "averageLength": integer average character length of the samples,
  "emojiFrequency": float representing emojis per word ratio (e.g. 0.05),
  "slangUsage": float between 0.0 (formal) and 1.0 (highly casual/slang-heavy),
  "professionalism": float between 0.0 (super casual) and 1.0 (very formal/business),
  "humor": float between 0.0 (dry/serious) and 1.0 (highly witty/funny),
  "topEmojis": "comma,separated,emojis" (exactly 3 emojis),
  "styleDescription": "detailed paragraph analyzing their tone, cadence, vocabulary, and brand personality",
  "rules": "bulleted guidelines for an AI agent simulating this creator's style (e.g. 'Use lowercase letters often', 'Do not say hello', 'Encourage readers to subscribe to YouTube')"
}

Ensure the output is pure JSON.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You analyze text styles and return structured JSON style parameters.'
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
      throw new Error('OpenAI returned empty response during style analysis.');
    }

    return JSON.parse(content) as TextAnalysisResult;
  }
}
