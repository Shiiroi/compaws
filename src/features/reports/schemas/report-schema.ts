import { z } from 'zod';

/**
 * Zod validation schema representing policy review claims.
 */
export const reportSchema = z.object({
  claim: z.enum(['allowed', 'not_allowed', 'outdoor_only']),
  pet_menu: z.enum(['yes', 'no']).nullable().optional(),
  price_range: z.enum(['budget', 'mid', 'splurge']),
  notes: z
    .string()
    .max(100, 'Notes must be less than 100 characters')
    .nullable()
    .optional(),
});

export type ReportFormData = z.infer<typeof reportSchema>;
