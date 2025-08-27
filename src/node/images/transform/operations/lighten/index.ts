import sharp from 'sharp'
import z from 'zod'
import { Outcome } from '../../../../../agnostic/misc/outcome'

export type LightenOperationParams = {
  amount?: number
}

export function isLightenOperationParams (obj: unknown): Outcome.Either<LightenOperationParams, string> {
  const schema = z.object({
    amount: z.number().optional()
  })
  const result = schema.safeParse(obj)
  if (!result.success) return Outcome.makeFailure(result.error.message)
  return Outcome.makeSuccess(result.data)
}

export async function lighten (
  sharpInstance: sharp.Sharp,
  params: LightenOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.modulate({ lightness: params.amount })
}
