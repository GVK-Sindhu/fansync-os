import { Worker, Job } from 'bullmq';
import { prisma } from '../config/db';
import { connection } from './queue';
import { AiService } from '../services/ai.service';
import { EmbeddingService } from '../services/embedding.service';
import { WebSocketService } from '../utils/ws';
import { Logger } from '../utils/logger';

interface WorkerJobData {
  creatorId: string;
  messageInput: {
    platform: 'instagram' | 'youtube' | 'twitter';
    senderUsername: string;
    senderName?: string;
    senderAvatarUrl?: string;
    text: string;
  };
}

export const inboundMessageWorker = new Worker(
  'inbound-message-processing',
  async (job: Job<WorkerJobData>) => {
    const { creatorId, messageInput } = job.data;
    Logger.info('QueueWorker', `Processing message ingestion job: ${job.id} for creator ${creatorId}`);

    try {
      // 1. Fetch Creator and Tone Profile
      const creator = await prisma.creator.findUnique({
        where: { id: creatorId },
        include: { toneProfile: true }
      });

      if (!creator) {
        throw new Error(`Creator with ID "${creatorId}" not found.`);
      }

      const toneProfile = creator.toneProfile || {
        averageLength: 80,
        emojiFrequency: 0.1,
        slangUsage: 0.2,
        professionalism: 0.5,
        humor: 0.5,
        topEmojis: '🔥,✨,🚀',
        styleDescription: 'Engaging, tech-savvy, and helpful.',
        rules: 'Use emojis, keep replies energetic.'
      };

      // 2. RAG: Vector search for similar creator memories
      // 2a. Generate embedding of the incoming message
      const messageEmbedding = await EmbeddingService.getEmbedding(messageInput.text);
      const vectorString = `[${messageEmbedding.join(',')}]`;

      // 2b. Query pgvector (falling back to simple latest query if pgvector fails)
      let similarMemories: any[] = [];
      try {
        similarMemories = await prisma.$queryRawUnsafe<any[]>(
          `SELECT m.id, m.content, m.type, (1 - (e.embedding <=> $1::vector)) as similarity
           FROM "CreatorMemory" m
           JOIN "CreatorMemoryEmbedding" e ON m.id = e."memoryId"
           WHERE m."creatorId" = $2
           ORDER BY e.embedding <=> $1::vector ASC
           LIMIT 3`,
          vectorString,
          creatorId
        );
        Logger.info('QueueWorker', `pgvector query successful. Retrieved ${similarMemories.length} similar memories for style context.`);
      } catch (err) {
        Logger.warn('QueueWorker', 'pgvector query failed (extension might not be enabled yet), falling back to latest memories', err);
        similarMemories = await prisma.creatorMemory.findMany({
          where: { creatorId },
          take: 3,
          orderBy: { createdAt: 'desc' }
        });
      }

      // 3. Execute AI Analysis and Reply Generation with RAG tone samples
      const pipelineResult = await AiService.analyzeMessage(
        messageInput.text,
        creator.name,
        toneProfile,
        similarMemories
      );

      // 4. Save inside database using atomic Prisma transaction
      const result = await prisma.$transaction(async (tx) => {
        const dbMessage = await tx.fanMessage.create({
          data: {
            creatorId,
            platform: messageInput.platform,
            senderUsername: messageInput.senderUsername,
            senderName: messageInput.senderName || messageInput.senderUsername,
            senderAvatarUrl: messageInput.senderAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            text: messageInput.text,
            timestamp: new Date().toISOString(),
            status: 'unread'
          }
        });

        // Write analysis result
        await tx.aiAnalysis.create({
          data: {
            messageId: dbMessage.id,
            sentiment: pipelineResult.sentiment,
            category: pipelineResult.category,
            priorityScore: pipelineResult.priorityScore,
            reasoning: pipelineResult.reasoning,
            hasMonetization: pipelineResult.hasMonetization,
            analyzedAt: new Date().toISOString()
          }
        });

        // Write monetization opportunity if detected
        if (pipelineResult.hasMonetization && pipelineResult.monetization) {
          await tx.monetizationOpportunity.create({
            data: {
              messageId: dbMessage.id,
              type: pipelineResult.monetization.type || 'custom',
              estimatedValue: pipelineResult.monetization.estimatedValue,
              status: 'identified',
              actionPlan: pipelineResult.monetization.actionPlan,
              detectedAt: new Date().toISOString()
            }
          });
        }

        // Write three AI Reply Drafts
        await tx.aiReplyDraft.createMany({
          data: [
            {
              messageId: dbMessage.id,
              type: 'short',
              text: pipelineResult.drafts.short,
              status: 'draft',
              createdAt: new Date().toISOString()
            },
            {
              messageId: dbMessage.id,
              type: 'engaging',
              text: pipelineResult.drafts.engaging,
              status: 'draft',
              createdAt: new Date().toISOString()
            },
            {
              messageId: dbMessage.id,
              type: 'premium_conversion',
              text: pipelineResult.drafts.premium_conversion,
              status: 'draft',
              createdAt: new Date().toISOString()
            }
          ]
        });

        // Retrieve full ingested record with relations
        return tx.fanMessage.findUnique({
          where: { id: dbMessage.id },
          include: {
            analysis: true,
            monetization: true,
            replies: true
          }
        });
      });

      Logger.info('QueueWorker', `Successfully processed message job for ${result?.id}. Broadcasting socket payload.`);

      // 5. Broadcast to connected WebSocket clients
      WebSocketService.broadcast('message:new', result);

      return result;
    } catch (error) {
      Logger.error('QueueWorker', `Failed to process job ${job.id}`, error);
      throw error;
    }
  },
  {
    connection: connection as any,
    concurrency: 2, // Concurrency setting
  }
);

inboundMessageWorker.on('completed', (job) => {
  Logger.info('QueueWorker', `Job ${job.id} completed successfully.`);
});

inboundMessageWorker.on('failed', (job, err) => {
  Logger.error('QueueWorker', `Job ${job?.id} failed with error: ${err.message}`);
});
