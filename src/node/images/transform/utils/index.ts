import sharp from 'sharp'
import z from 'zod'

export function isSharpColor (obj: unknown): obj is sharp.Color {
  if (typeof obj === 'string') return true
  return z.object({
    r: z.number().optional(),
    g: z.number().optional(),
    b: z.number().optional(),
    alpha: z.number().optional()
  }).safeParse(obj).success
}
