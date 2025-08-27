import sharp from 'sharp'
import z from 'zod'

export type ExtractOperationParams = {
  left: number
  top: number
  width: number
  height: number
}

export function isExtractOperationParams (obj: unknown): obj is ExtractOperationParams {
  return z.object({
    left: z.number(),
    top: z.number(),
    width: z.number(),
    height: z.number()
  }).safeParse(obj).success
}

export async function extract (
  sharpInstance: sharp.Sharp,
  params: ExtractOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.extract(params)
}
