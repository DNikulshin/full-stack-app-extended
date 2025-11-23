import { z } from 'zod'

export const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z.coerce
    .number()
    .default(3000)
    .refine((port) => port > 0 && port < 65536, 'Invalid port number'),

  DATABASE_URL: z.string().min(1, { message: 'DATABASE_URL is required' }),

  AT_SECRET: z.string().min(1, { message: 'AT_SECRET is required' }),

  RT_SECRET: z.string().min(1, { message: 'RT_SECRET is required' }),

  AT_EXPIRES_IN: z.coerce
    .number()
    .positive('AT_EXPIRES_IN must be a positive number'),

  RT_EXPIRES_IN: z.coerce
    .number()
    .positive('RT_EXPIRES_IN must be a positive number'),
})

export type EnvType = z.infer<typeof EnvSchema>
