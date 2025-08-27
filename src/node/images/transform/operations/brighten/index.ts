import sharp from 'sharp'
import z from 'zod'

export type BrightenOperationParams = { factor: number }

export function isBrightenOperationParams (obj: unknown): obj is BrightenOperationParams {
  return z
    .object({ factor: z.number() })
    .safeParse(obj).success
}

export async function brighten (
  sharpInstance: sharp.Sharp,
  params: BrightenOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.modulate({ brightness: params.factor })
}
