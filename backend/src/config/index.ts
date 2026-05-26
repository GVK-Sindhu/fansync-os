import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/fantwin?schema=public',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  mockAiPipeline: process.env.MOCK_AI_PIPELINE === 'true' || !process.env.OPENAI_API_KEY,
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
};

