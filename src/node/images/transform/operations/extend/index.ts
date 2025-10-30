import sharp from 'sharp'
import z from 'zod'
import { Outcome } from '../../../../../agnostic/misc/outcome/index.js'
import { isSharpColor } from '../../utils/index.js'

export type ExtendOperationParams = {
  left?: number
  right?: number
  top?: number
  bottom?: number
  extendWith?: sharp.ExtendWith // [WIP] not sure it's safe to use directly the types from sharp
  background?: sharp.Color // [WIP] same
}

export function isExtendOperationParams (obj: unknown): Outcome.Either<ExtendOperationParams, string> {
  const schema = z.object({
    left: z.number().optional(),
    right: z.number().optional(),
    top: z.number().optional(),
    bottom: z.number().optional(),
    extendWith: z.optional(z.enum(['background', 'copy', 'repeat', 'mirror'])),
    background: z.custom<sharp.Color>((val) => isSharpColor(val)).optional()
  })
  const result = schema.safeParse(obj)
  if (!result.success) return Outcome.makeFailure(result.error.message)
  return Outcome.makeSuccess(result.data)
}

export async function extend (
  sharpInstance: sharp.Sharp,
  params: ExtendOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.extend(params)
}
