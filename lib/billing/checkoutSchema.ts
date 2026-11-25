import { z } from 'zod';

export const checkoutSchema = z.object({
  planId: z.string().min(1, 'planId is required'),
  planName: z.string().min(1, 'planName is required'),
  planTier: z.string().optional().default('cloud'),
  billingCycle: z.enum(['pay_as_you_go', 'payg', 'monthly', 'semi_annual', 'annual']).default('monthly'),
  domain: z.string()
    .regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/, 'Invalid domain name format')
    .optional()
    .or(z.literal('')),
  os: z.string().optional(),
  panel: z.string().optional(),
  location: z.string().optional(),
  hostname: z.string().max(120).optional().or(z.literal('')),
  ssh_public_key: z.string().max(4096).optional().or(z.literal('')),
  coupon_code: z.string().max(64).optional().nullable(),
  include_gst: z.boolean().optional().default(false),
  use_credits: z.boolean().optional().default(false),
  custom_vcpu: z.number().optional(),
  custom_ram: z.number().optional(),
  custom_storage: z.number().optional(),
  addons: z.array(z.string()).optional().default([]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
