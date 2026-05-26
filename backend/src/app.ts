import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import { config } from './config';
import inboxRoutes from './routes/inbox.routes';
import memoryRoutes from './routes/memory.routes';
import simulationRoutes from './routes/simulation.routes';
import analyticsRoutes from './routes/analytics.routes';
import { auth } from './middlewares/auth';
import { errorHandler } from './middlewares/errorHandler';
import { Logger } from './utils/logger';
import { WebSocketService } from './utils/ws';

// Import and boot the BullMQ worker
import './queues/worker';

const app = express();
const server = http.createServer(app);

// Initialize WebSockets
WebSocketService.init(server);

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for the MVP development environment
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger middleware using custom structured logger
app.use((req: Request, res: Response, next: NextFunction) => {
  Logger.info('HTTPServer', `${req.method} ${req.path}`);
  next();
});

// Mount Routes with Auth (which has dev fallback)
app.use('/api/inbox', auth, inboxRoutes);
app.use('/api/memory', auth, memoryRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/analytics', auth, analyticsRoutes);

// Base Health Check Route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'FanTwin AI Engine API',
    version: '1.1.0',
    mockMode: config.mockAiPipeline,
    redis: {
      host: config.redisHost,
      port: config.redisPort
    }
  });
});

app.get('/', (req: Request, res: Response) => {
  res.redirect('/api/health');
});

// 404 Error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Start Server using HTTP Wrapper
server.listen(config.port, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`   🚀 FanTwin AI Server listening on port ${config.port} 🚀`);
  console.log(`   OpenAI API Key: ${config.openaiApiKey ? 'Configured' : 'Missing (Using Mock Fallback)'}`);
  console.log(`   Mock AI Pipeline Active: ${config.mockAiPipeline}`);
  console.log(`   Redis Connection: ${config.redisHost}:${config.redisPort}`);
  console.log(`====================================================`);
});

