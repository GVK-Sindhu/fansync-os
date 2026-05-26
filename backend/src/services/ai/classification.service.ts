import { z } from 'zod';

export const ClassificationSchema = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  category: z.enum(['loyal_fan', 'casual_follower', 'potential_subscriber', 'sponsor_inquiry', 'spam_troll', 'vip_supporter']),
  priorityScore: z.number().int().min(0).max(100),
  reasoning: z.string().min(5),
});

export type ClassificationResult = z.infer<typeof ClassificationSchema>;
