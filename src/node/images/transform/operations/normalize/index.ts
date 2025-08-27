import sharp from 'sharp'
import z from 'zod'
import { Outcome } from '../../../../../agnostic/misc/outcome'

export type NormalizeOperationParams = {
  lower?: number
  upper?: number
}

export function isNormalizeOperationParams (obj: unknown): Outcome.Either<NormalizeOperationParams, string> {
  const schema = z.object({
    lower: z.number().optional(),
    upper: z.number().optional()
  })
  const result = schema.safeParse(obj)
  if (!result.success) return Outcome.makeFailure(result.error.message)
  return Outcome.makeSuccess(result.data)
}

export async function normalize (
  sharpInstance: sharp.Sharp,
  params: NormalizeOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.normalize(params)
}
