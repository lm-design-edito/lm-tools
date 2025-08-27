import sharp from 'sharp'
import z from 'zod'
import { isSharpColor } from '../../utils'

export type ExtendOperationParams = {
  left?: number
  right?: number
  top?: number
  bottom?: number
  extendWith?: sharp.ExtendWith
  background?: sharp.Color
}

export function isExtendOperationParams (obj: unknown): obj is ExtendOperationParams {
  return z.object({
    left: z.number().optional(),
    right: z.number().optional(),
    top: z.number().optional(),
    bottom: z.number().optional(),
    extendWith: z.optional(z.enum(['background', 'copy', 'repeat', 'mirror'])),
    background: z.custom<sharp.Color>((val) => isSharpColor(val)).optional()
  }).safeParse(obj).success
}

export async function extend (
  sharpInstance: sharp.Sharp,
  params: ExtendOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.extend(params)
}
