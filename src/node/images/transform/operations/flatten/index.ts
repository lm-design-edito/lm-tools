import sharp from 'sharp'
import z from 'zod'
import { Outcome } from '../../../../../agnostic/misc/outcome/index.js'
import { isSharpColor } from '../../utils/index.js'

export type FlattenOperationParams = {
  background?: sharp.Color // [WIP] use own types, not those from sharp
}

export function isFlattenOperationParams (obj: unknown): Outcome.Either<FlattenOperationParams, string> {
  const schema = z.object({
    background: z.custom<sharp.Color>((val) => isSharpColor(val)).optional()
  })
  const result = schema.safeParse(obj)
  if (!result.success) return Outcome.makeFailure(result.error.message)
  return Outcome.makeSuccess(result.data)
}

export async function flatten (
  sharpInstance: sharp.Sharp,
  params: FlattenOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.flatten(params)
}
