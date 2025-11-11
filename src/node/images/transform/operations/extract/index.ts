import sharp from 'sharp'
import z from 'zod'
import { Outcome } from '../../../../../agnostic/misc/outcome/index.js'
import type { ExtractOperationParams } from '../../../types.js'

export function isExtractOperationParams (obj: unknown): Outcome.Either<ExtractOperationParams, string> {
  const schema = z.object({
    left: z.number(),
    top: z.number(),
    width: z.number(),
    height: z.number()
  })
  const result = schema.safeParse(obj)
  if (!result.success) return Outcome.makeFailure(result.error.message)
  return Outcome.makeSuccess(result.data)
}

export async function extract (
  sharpInstance: sharp.Sharp,
  params: ExtractOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.extract(params)
}
