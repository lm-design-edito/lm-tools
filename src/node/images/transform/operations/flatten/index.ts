import sharp from 'sharp'
import z from 'zod'
import { isSharpColor } from '../../utils'

export type FlattenOperationParams = {
  background?: sharp.Color
}

export function isFlattenOperationParams (obj: unknown): obj is FlattenOperationParams {
  return z.object({
    background: z.custom<sharp.Color>((val) => isSharpColor(val)).optional()
  }).safeParse(obj).success
}

export async function flatten (
  sharpInstance: sharp.Sharp,
  params: FlattenOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.flatten(params)
}
