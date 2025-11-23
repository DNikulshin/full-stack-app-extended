import * as z from 'zod'

export const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  AT_SECRET: z.string().min(1),
  RT_SECRET: z.string().min(1),
  AT_EXPIRES_IN: z.coerce.number(),
  RT_EXPIRES_IN: z.coerce.number(),
})
