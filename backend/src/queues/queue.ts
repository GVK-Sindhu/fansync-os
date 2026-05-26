import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';
import { Logger } from '../utils/logger';

const connection = new IORedis({
  host: config.redisHost,
  port: config.redisPort,
  maxRetriesPerRequest: null, // Required by BullMQ
});

connection.on('connect', () => {
  Logger.info('Redis', 'Successfully connected to Redis instance.');
});

connection.on('error', (err) => {
  Logger.error('Redis', 'Redis connection failure', err);
});

export { connection };

export const inboundMessageQueue = new Queue('inbound-message-processing', {
  connection: connection as any, // Cast to any to bypass npm versions mismatch in node_modules
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // Starts at 2s, then 4s, then 8s
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

Logger.info('Queue', 'Initialized inboundMessageQueue.');
