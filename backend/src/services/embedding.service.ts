import { OpenAI } from 'openai';
import { config } from '../config';
import { Logger } from '../utils/logger';

export class EmbeddingService {
  private static openai: OpenAI | null = config.openaiApiKey 
    ? new OpenAI({ apiKey: config.openaiApiKey }) 
    : null;

  /**
   * Generates a 1536-dimension float array embedding vector for a string
   */
  public static async getEmbedding(text: string): Promise<number[]> {
    if (config.mockAiPipeline || !this.openai) {
      return this.runLocalEmbeddingHeuristic(text);
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      Logger.error('EmbeddingService', 'OpenAI Embedding generation failed, falling back to local heuristic', error);
      return this.runLocalEmbeddingHeuristic(text);
    }
  }

  /**
   * Deterministic local fallback generator creating a normalized unit vector based on characters hashes
   */
  private static runLocalEmbeddingHeuristic(text: string): number[] {
    const vector = new Array(1536).fill(0);
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    
    for (let i = 0; i < 1536; i++) {
      const val = Math.sin(hash + i) * 10000;
      vector[i] = val - Math.floor(val);
    }
    
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(v => (magnitude > 0 ? v / magnitude : 0));
  }
}
