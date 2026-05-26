import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CREATOR_ID = 'e2b2f518-7fba-4a57-b087-9bc401b3d0e2';

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing database records
  await prisma.aiReplyDraft.deleteMany({});
  await prisma.monetizationOpportunity.deleteMany({});
  await prisma.aiAnalysis.deleteMany({});
  await prisma.fanMessage.deleteMany({});
  await prisma.creatorMemory.deleteMany({});
  await prisma.toneProfile.deleteMany({});
  await prisma.creator.deleteMany({});
  
  console.log('🧹 Cleaned existing database records.');

  // 2. Create Default Creator
  const creator = await prisma.creator.create({
    data: {
      id: CREATOR_ID,
      name: 'Alex Vance',
      email: 'alex@fansvine.com',
      handle: 'alexvance_ai',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      niche: 'AI & Full-stack Engineering',
      createdAt: new Date().toISOString()
    }
  });

  console.log(`👤 Created Creator: ${creator.name} (${creator.id})`);

  // 3. Create Creator Tone Profile
  const toneProfile = await prisma.toneProfile.create({
    data: {
      creatorId: creator.id,
      averageLength: 90,
      emojiFrequency: 0.12,
      slangUsage: 0.3,
      professionalism: 0.6,
      humor: 0.5,
      topEmojis: '🔥,🚀,💻',
      styleDescription: 'Tech-savvy, highly authentic, encouraging, and clear. Enjoys using coding jargon, sharing quick optimization tips, and regularly guides loyal followers to join their premium mastermind Discord community.',
      rules: 'Use developer emojis like 💻 or 🚀; sound like a technical partner rather than a customer service representative; highlight the Premium Discord link if the fan is asking deep-dive questions.',
      updatedAt: new Date().toISOString()
    }
  });

  console.log(`🎨 Created Tone Profile for Creator`);

  // 4. Create Creator Memory Samples (tweets & replies)
  await prisma.creatorMemory.createMany({
    data: [
      {
        creatorId: creator.id,
        type: 'tweet',
        content: 'Building an AI startup is 90% prompt engineering, 9% setting up database indexes, and 1% buying domains you will never use. 💻🔥',
        createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
      },
      {
        creatorId: creator.id,
        type: 'tweet',
        content: 'Next.js Server Actions + Prisma + Neon DB is honestly the fastest way to ship an MVP in 2026. Zero devops bloat, just code. 🚀',
        createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
      },
      {
        creatorId: creator.id,
        type: 'reply',
        content: 'That index issue happens when you do sequential scans. Run ANALYZE and check your query planner. Let me know if that works! 💻',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ]
  });

  console.log(`🧠 Created 3 Creator Memory style samples`);

  // 5. Create Mock Inbox Fan Messages and associated AI pipelines outputs
  const mockMessagesData = [
    {
      platform: 'twitter',
      senderUsername: '@datacorp_hq',
      senderName: 'David Chen',
      senderAvatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      text: 'Hey Alex, I run marketing at DataCorp. We are launching an AI-indexing API and would love to sponsor your next YouTube video. We have a budget of $2,500. Are you open to sponsorships? Can you send your media kit?',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), // 4h ago
      analysis: {
        sentiment: 'positive',
        category: 'sponsor_inquiry',
        priorityScore: 98,
        reasoning: 'Explicit business inquiry with a specified budget ($2,500). High monetization and collaboration potential.',
        hasMonetization: true
      },
      monetization: {
        type: 'sponsorship',
        estimatedValue: 2500.00,
        actionPlan: 'Send corporate sponsorship rate sheet and invite to schedule a Zoom briefing call.'
      },
      replies: [
        { type: 'short', text: 'Hey David! I\'d love to collaborate. Email me at partner@alexvance.ai. 🚀' },
        { type: 'engaging', text: 'Hey David, thanks for reaching out! DataCorp\'s new API sounds like a perfect fit for my audience. I\'d love to explore this. Drop me a line at partner@alexvance.ai with your timeline and we can schedule a quick call to align! 💻' },
        { type: 'premium_conversion', text: 'Hi David! Yes, I have open video slots for Q3. You can download my full media kit and book a sponsored slot directly at alexvance.ai/sponsor. Looking forward to it!' }
      ]
    },
    {
      platform: 'youtube',
      senderUsername: 'CodeNewbieTom',
      senderName: 'Tom Anderson',
      senderAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      text: 'Hey Alex! I have been struggling with database design for my SaaS for weeks. Your PostgreSQL video was a lifesaver. Do you offer 1-on-1 coaching? I would gladly pay for an hour of your time to review my schema.',
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), // 6h ago
      analysis: {
        sentiment: 'positive',
        category: 'vip_supporter',
        priorityScore: 92,
        reasoning: 'Extremely loyal fan requesting paid 1-on-1 consulting/coaching. High conversion probability.',
        hasMonetization: true
      },
      monetization: {
        type: 'custom',
        estimatedValue: 150.00,
        actionPlan: 'Pitch 1-on-1 consulting package and send Calendly link.'
      },
      replies: [
        { type: 'short', text: 'Thanks Tom! Yes, I do. Let\'s schedule a call! 💻' },
        { type: 'engaging', text: 'Hey Tom! Super glad the PostgreSQL video helped clear the fog. Database design can be a real headache. I do offer consulting calls. Send me your current schema design over DM, and we can set up a session to audit it together!' },
        { type: 'premium_conversion', text: 'Hey Tom! Glad it helped! I open a few consulting slots each week for deep dives. You can book an hour-long schema audit directly at calendly.com/alexvance/audit. Grab a slot and we\'ll sort it out! 🚀' }
      ]
    },
    {
      platform: 'instagram',
      senderUsername: 'julia_codes',
      senderName: 'Julia Ramos',
      senderAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      text: 'Hey! Do you have a list of all your recommended VS Code extensions and developer settings? I see them in your reels and they look so clean!',
      timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), // 18h ago
      analysis: {
        sentiment: 'positive',
        category: 'loyal_fan',
        priorityScore: 75,
        reasoning: 'Positive query regarding workspace setup. Good opportunity to pitch a low-ticket guide or lead magnet.',
        hasMonetization: true
      },
      monetization: {
        type: 'merch',
        estimatedValue: 15.00,
        actionPlan: 'Send developer guide link or link to the merch store containing theme presets.'
      },
      replies: [
        { type: 'short', text: 'Hey Julia! Check out my developer theme pack in my bio. 💻' },
        { type: 'engaging', text: 'Hey Julia! I get asked this a lot. My theme is Tokyo Night and I use the Fira Code font with ligatures. I have a full settings.json gist on GitHub. What theme are you currently using?' },
        { type: 'premium_conversion', text: 'Hey Julia! I compiled my complete VS Code settings, snippets, and shortcuts guide. You can grab the Developer Config Kit on my store for $15 at shop.alexvance.ai! 🔥' }
      ]
    },
    {
      platform: 'twitter',
      senderUsername: '@rich_crypto_lead',
      senderName: 'CryptoBot',
      senderAvatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      text: 'MAKE $10000 PER WEEK IN PASSIVE INCOME. Click link to buy the new $SOL meme coin launch. Guaranteed 100x gains before tonight. Click now!',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 24h ago
      analysis: {
        sentiment: 'neutral',
        category: 'spam_troll',
        priorityScore: 2,
        reasoning: 'Automated crypto scam spam message. Should be ignored or archived.',
        hasMonetization: false
      },
      monetization: null,
      replies: [
        { type: 'short', text: 'Not interested.' },
        { type: 'engaging', text: 'Thanks for writing. We do not participate in cryptocurrency coin launches.' },
        { type: 'premium_conversion', text: 'To learn how to code actual applications instead of buying spam, join our developer Discord.' }
      ]
    },
    {
      platform: 'youtube',
      senderUsername: 'DaveR',
      senderName: 'David Richardson',
      senderAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      text: 'This explanation of AI embeddings was awesome. Do you have a Github repo where we can access this code?',
      timestamp: new Date(Date.now() - 3600000 * 28).toISOString(), // 28h ago
      analysis: {
        sentiment: 'positive',
        category: 'casual_follower',
        priorityScore: 55,
        reasoning: 'Polite inquiry asking for repository assets. Friendly response suggested.',
        hasMonetization: false
      },
      monetization: null,
      replies: [
        { type: 'short', text: 'Yes! Repo links are in the description. 💻' },
        { type: 'engaging', text: 'Glad you enjoyed the video, Dave! The complete source code is open source and hosted on my GitHub. You can find the exact link in the YouTube video description box. Let me know if you run into any build issues! 🔥' },
        { type: 'premium_conversion', text: 'Thanks Dave! Code is public on GitHub. We also do weekly code-reviews and share early projects inside our VIP Discord community. You can join at alexvance.ai/discord.' }
      ]
    }
  ];

  for (const msg of mockMessagesData) {
    const dbMessage = await prisma.fanMessage.create({
      data: {
        creatorId: CREATOR_ID,
        platform: msg.platform,
        senderUsername: msg.senderUsername,
        senderName: msg.senderName,
        senderAvatarUrl: msg.senderAvatarUrl,
        text: msg.text,
        timestamp: msg.timestamp,
        status: 'unread'
      }
    });

    await prisma.aiAnalysis.create({
      data: {
        messageId: dbMessage.id,
        sentiment: msg.analysis.sentiment,
        category: msg.analysis.category,
        priorityScore: msg.analysis.priorityScore,
        reasoning: msg.analysis.reasoning,
        hasMonetization: msg.analysis.hasMonetization,
        analyzedAt: new Date().toISOString()
      }
    });

    if (msg.analysis.hasMonetization && msg.monetization) {
      await prisma.monetizationOpportunity.create({
        data: {
          messageId: dbMessage.id,
          type: msg.monetization.type,
          estimatedValue: msg.monetization.estimatedValue,
          status: 'identified',
          actionPlan: msg.monetization.actionPlan,
          detectedAt: new Date().toISOString()
        }
      });
    }

    await prisma.aiReplyDraft.createMany({
      data: msg.replies.map(reply => ({
        messageId: dbMessage.id,
        type: reply.type,
        text: reply.text,
        status: 'draft',
        createdAt: new Date().toISOString()
      }))
    });
  }

  console.log('✅ Seeded 5 initial message threads successfully.');
  console.log('🌱 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
