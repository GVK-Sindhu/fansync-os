import { Router, Request, Response } from 'express';
import { QueueService } from '../services/queue.service';

const router = Router();

// GET /api/simulation/status - Get simulation status
router.get('/status', (req: Request, res: Response) => {
  const isSimulating = QueueService.getSimulationStatus();
  res.json({ isSimulating });
});

// POST /api/simulation/start - Start auto message generator
router.post('/start', (req: Request, res: Response) => {
  try {
    const { creatorId, intervalMs } = req.body;
    if (!creatorId) {
      return res.status(400).json({ error: 'creatorId is required to start simulation' });
    }

    QueueService.startSimulation(creatorId, intervalMs ? parseInt(intervalMs, 10) : undefined);
    res.json({ message: 'Simulation started successfully', isSimulating: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/simulation/stop - Stop auto message generator
router.post('/stop', (req: Request, res: Response) => {
  try {
    QueueService.stopSimulation();
    res.json({ message: 'Simulation stopped successfully', isSimulating: false });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/simulation/message - Ingest a mock message (random or custom text)
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { creatorId, text, platform, senderUsername, senderName } = req.body;
    if (!creatorId) {
      return res.status(400).json({ error: 'creatorId is required' });
    }

    let result;
    if (text) {
      // Ingest a custom user-defined text message
      result = await QueueService.ingestMessage(creatorId, {
        text,
        platform: platform || 'twitter',
        senderUsername: senderUsername || '@testuser',
        senderName: senderName || 'Test User',
      });
    } else {
      // Ingest a random template message
      result = await QueueService.ingestRandomMockMessage(creatorId);
    }

    res.json({
      message: 'Message ingested and analyzed successfully',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
