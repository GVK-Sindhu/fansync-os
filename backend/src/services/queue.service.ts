import { inboundMessageQueue } from '../queues/queue';
import { Logger } from '../utils/logger';

interface MockMessageTemplate {
  platform: 'instagram' | 'youtube' | 'twitter';
  senderUsername: string;
  senderName: string;
  senderAvatarUrl: string;
  text: string;
}

const MOCK_MESSAGES: MockMessageTemplate[] = [
  {
    platform: 'twitter',
    senderUsername: '@tech_sponsor_group',
    senderName: 'Marcus V.',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    text: 'Hey! We love your content on developer productivity and want to discuss a sponsorship deal for our new DevOps monitoring tool. We have a $3,500 budget for a 60-second integration. Can you share your rates?'
  },
  {
    platform: 'youtube',
    senderUsername: 'Sarah Code',
    senderName: 'Sarah Jenkins',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    text: 'Your explanations of PostgreSQL optimization made everything click! Fan since 2024. Can you share if you have a private community or mastermind? I want to join.'
  },
  {
    platform: 'instagram',
    senderUsername: 'hype_beast_88',
    senderName: 'Tyler Miller',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    text: 'Where did you get that black minimalist hoodie you wore in the latest vlog? Is it on your official store? I want to buy one ASAP!'
  },
  {
    platform: 'youtube',
    senderUsername: 'CryptoMoonGains',
    senderName: 'Bot #928',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
    text: 'EARN $5000 DAILY WORK FROM HOME! click my telegram link inside channel bio to invest in trending memecoin now! 100% legit'
  },
  {
    platform: 'twitter',
    senderUsername: '@alex_dev_9',
    senderName: 'Alex Mercer',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    text: 'Just watched the new video. The editing was clean but I felt like the code database layer could use a bit more depth. Good job though!'
  },
  {
    platform: 'instagram',
    senderUsername: 'laura_creative',
    senderName: 'Laura Chen',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    text: 'Hey creator! I run a weekly tech newsletter with 50,000 active subscribers. Would love to invite you for a short podcast interview next month. Are you open to collaborations?'
  },
  {
    platform: 'youtube',
    senderUsername: 'gordon_invests',
    senderName: 'Gordon Ramsey',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    text: 'Absolute goldmine of advice. Do you offer 1-on-1 consulting? I want to pay for a 1-hour session to audit my team\'s current tech roadmap.'
  },
  {
    platform: 'twitter',
    senderUsername: '@troll_master',
    senderName: 'Troll Face',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150',
    text: 'your videos are boring and way too long. unsubscribe.'
  }
];

export class QueueService {
  private static simulationInterval: NodeJS.Timeout | null = null;
  private static isSimulating = false;

  /**
   * Start the background simulation ticker (adds a message every N seconds)
   */
  public static startSimulation(creatorId: string, intervalMs = 20000) {
    if (this.isSimulating) return;

    this.isSimulating = true;
    Logger.info('QueueService', `Starting auto simulation ticker every ${intervalMs}ms...`);
    
    this.simulationInterval = setInterval(async () => {
      try {
        await this.ingestRandomMockMessage(creatorId);
      } catch (err) {
        Logger.error('QueueService', 'Error in automatic simulation ingestion:', err);
      }
    }, intervalMs);
  }

  /**
   * Stop the background simulation ticker
   */
  public static stopSimulation() {
    if (!this.isSimulating) return;
    
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.isSimulating = false;
    Logger.info('QueueService', 'Simulation ticker stopped.');
  }

  public static getSimulationStatus(): boolean {
    return this.isSimulating;
  }

  /**
   * Ingest a single random mock message from the template pool
   */
  public static async ingestRandomMockMessage(creatorId: string): Promise<any> {
    const template = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)];
    const suffix = Math.floor(Math.random() * 900) + 100;
    const randomizedTemplate = {
      ...template,
      senderUsername: template.senderUsername.includes('@')
        ? `${template.senderUsername}${suffix}`
        : `${template.senderUsername} ${suffix}`
    };

    return this.ingestMessage(creatorId, randomizedTemplate);
  }

  /**
   * Core message ingestion pipeline (delegates process execution asynchronously to BullMQ)
   */
  public static async ingestMessage(
    creatorId: string,
    messageInput: {
      platform: 'instagram' | 'youtube' | 'twitter';
      senderUsername: string;
      senderName?: string;
      senderAvatarUrl?: string;
      text: string;
    }
  ): Promise<any> {
    Logger.info('QueueService', `Enqueuing ingestion job for creator: ${creatorId}, sender: ${messageInput.senderUsername}`);
    
    const job = await inboundMessageQueue.add('process-message', {
      creatorId,
      messageInput,
    });

    return {
      jobId: job.id,
      status: 'queued',
      enqueuedAt: new Date().toISOString(),
    };
  }
}
