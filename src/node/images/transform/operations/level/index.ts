import sharp from 'sharp'
import z from 'zod'
import { Outcome } from '../../../../../agnostic/misc/outcome'

export type LevelOperationParams = {  
  multiplier?: number
  offset?: number
}

export function isLevelOperationParams (obj: unknown): Outcome.Either<LevelOperationParams, string> {
  const schema = z.object({
    multiplier: z.number().optional(),
    offset: z.number().optional()
  })
  const result = schema.safeParse(obj)
  if (!result.success) return Outcome.makeFailure(result.error.message)
  return Outcome.makeSuccess(result.data)
}

export async function level (
  sharpInstance: sharp.Sharp,
  params: LevelOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.linear(
    params.multiplier,
    params.offset
  )
}
