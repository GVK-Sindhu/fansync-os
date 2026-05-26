import { z } from 'zod';

export const DraftSchema = z.object({
  short: z.string().min(2),
  engaging: z.string().min(5),
  premium_conversion: z.string().min(5),
});

export type DraftResult = z.infer<typeof DraftSchema>;
