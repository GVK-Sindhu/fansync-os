import { Router, Request, Response } from 'express';
import { prisma } from '../config/db';
import { MemoryService } from '../services/memory.service';
import { AiService } from '../services/ai.service';

const router = Router();

// GET /api/memory/:creatorId - Fetch a creator's details and tone profile
router.get('/:creatorId', async (req: Request, res: Response) => {
  try {
    const creator = await prisma.creator.findUnique({
      where: { id: req.params.creatorId },
      include: {
        toneProfile: true,
        memories: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    res.json(creator);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/memory/train - Upload writing samples to analyze writing style
router.post('/train', async (req: Request, res: Response) => {
  try {
    const { creatorId, samples } = req.body;
    if (!creatorId || !samples || !Array.isArray(samples)) {
      return res.status(400).json({ error: 'creatorId and an array of samples are required' });
    }

    const updatedProfile = await MemoryService.analyzeWritingSamples(creatorId, samples);
    res.json({
      message: 'Writing style analyzed and tone profile updated successfully',
      profile: updatedProfile
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/memory/test - Generate a test reply based on current style profile
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { creatorId, messageText } = req.body;
    if (!creatorId || !messageText) {
      return res.status(400).json({ error: 'creatorId and messageText are required' });
    }

    const creator = await prisma.creator.findUnique({
      where: { id: creatorId },
      include: { toneProfile: true }
    });

    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    const profile = creator.toneProfile || {
      averageLength: 80,
      emojiFrequency: 0.1,
      slangUsage: 0.2,
      professionalism: 0.5,
      humor: 0.5,
      topEmojis: '🔥,✨,🚀',
      styleDescription: 'Engaging, friendly, tech-savvy, and helpful.',
      rules: 'Use emojis; keep replies energetic.'
    };

    const analysis = await AiService.analyzeMessage(messageText, creator.name, profile);
    res.json({
      analysis,
      drafts: analysis.drafts
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
