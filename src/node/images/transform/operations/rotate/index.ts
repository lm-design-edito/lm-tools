import sharp from 'sharp'
import z from 'zod'
import { Outcome } from '../../../../../agnostic/misc/outcome/index.js'
import { isSharpColor } from '../../utils/index.js'

export type RotateOperationParams = {
  angleDeg?: number
  background?: sharp.Color // [WIP] use own types, not those from sharp
}

export function isRotateOperationParams (obj: unknown): Outcome.Either<RotateOperationParams, string> {
  const schema = z.object({
    angleDeg: z.number().optional(),
    background: z.custom<sharp.Color>((val) => isSharpColor(val)).optional(),
  })
  const result = schema.safeParse(obj)
  if (!result.success) return Outcome.makeFailure(result.error.message)
  return Outcome.makeSuccess(result.data)
}

export async function rotate (
  sharpInstance: sharp.Sharp,
  params: RotateOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.rotate(params.angleDeg, {
    background: params.background
  })
}
