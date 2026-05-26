import { z } from 'zod';

export const MonetizationSchema = z.object({
  hasMonetization: z.boolean(),
  monetization: z.object({
    type: z.enum(['sponsorship', 'merch', 'subscription', 'collaboration', 'custom']),
    estimatedValue: z.number().min(0),
    actionPlan: z.string().min(5),
  }).nullable(),
});

export type MonetizationResult = z.infer<typeof MonetizationSchema>;
