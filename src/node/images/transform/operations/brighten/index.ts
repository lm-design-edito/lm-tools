import sharp from 'sharp'
import z from 'zod'
import { Outcome } from '../../../../../agnostic/misc/outcome/index.js'

export type BrightenOperationParams = { factor: number }

export function isBrightenOperationParams (obj: unknown): Outcome.Either<BrightenOperationParams, string> {
  const schema = z.object({ factor: z.number() })
  const result = schema.safeParse(obj)
  if (!result.success) return Outcome.makeFailure(result.error.message)
  return Outcome.makeSuccess(result.data)
}

export async function brighten (
  sharpInstance: sharp.Sharp,
  params: BrightenOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.modulate({ brightness: params.factor })
}
