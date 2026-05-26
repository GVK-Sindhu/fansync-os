import { Router, Request, Response } from 'express';
import { prisma } from '../config/db';

const router = Router();

// GET /api/inbox - Fetch messages with filters and sorting
router.get('/', async (req: Request, res: Response) => {
  try {
    const creatorId = req.query.creatorId as string;
    if (!creatorId) {
      return res.status(400).json({ error: 'creatorId query parameter is required' });
    }

    const { status, category, sentiment, platform, search, sort } = req.query;

    const where: any = { creatorId };

    if (status) where.status = status as string;
    if (platform) where.platform = platform as string;
    if (category) {
      where.analysis = {
        category: category as string
      };
    }
    if (sentiment) {
      where.analysis = {
        ...where.analysis,
        sentiment: sentiment as string
      };
    }
    if (search) {
      where.OR = [
        { text: { contains: search as string, mode: 'insensitive' } },
        { senderUsername: { contains: search as string, mode: 'insensitive' } },
        { senderName: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Determine sorting
    let orderBy: any = { timestamp: 'desc' };
    if (sort === 'priority') {
      orderBy = {
        analysis: {
          priorityScore: 'desc'
        }
      };
    } else if (sort === 'oldest') {
      orderBy = { timestamp: 'asc' };
    }

    const messages = await prisma.fanMessage.findMany({
      where,
      include: {
        analysis: true,
        monetization: true,
        replies: true
      },
      orderBy
    });

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inbox/:id - Get a single message thread details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const message = await prisma.fanMessage.findUnique({
      where: { id: req.params.id },
      include: {
        analysis: true,
        monetization: true,
        replies: true
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(message);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/inbox/reply/:replyId - Edit an AI draft reply
router.patch('/reply/:replyId', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    const updatedReply = await prisma.aiReplyDraft.update({
      where: { id: req.params.replyId },
      data: {
        text,
        status: 'edited'
      }
    });

    res.json(updatedReply);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inbox/reply/:replyId/send - Mark reply draft as sent and parent message as replied
router.post('/reply/:replyId/send', async (req: Request, res: Response) => {
  try {
    const replyId = req.params.replyId;

    const reply = await prisma.aiReplyDraft.findUnique({
      where: { id: replyId },
      include: { message: true }
    });

    if (!reply) {
      return res.status(404).json({ error: 'Reply draft not found' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Mark reply as sent
      const updatedReply = await tx.aiReplyDraft.update({
        where: { id: replyId },
        data: { status: 'sent' }
      });

      // Update parent message status
      await tx.fanMessage.update({
        where: { id: reply.messageId },
        data: { status: 'replied' }
      });

      // If this message had a monetization opportunity, let's mark it as 'contacted' or 'engaged'
      const monet = await tx.monetizationOpportunity.findUnique({
        where: { messageId: reply.messageId }
      });
      if (monet && monet.status === 'identified') {
        await tx.monetizationOpportunity.update({
          where: { messageId: reply.messageId },
          data: { status: 'engaged' }
        });
      }

      return updatedReply;
    });

    res.json({ message: 'Reply sent successfully', reply: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/inbox/message/:id/status - Archive or mark as read
router.patch('/message/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status || !['unread', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Valid status (unread, replied, archived) is required' });
    }

    const updatedMessage = await prisma.fanMessage.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        analysis: true,
        monetization: true,
        replies: true
      }
    });

    res.json(updatedMessage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
