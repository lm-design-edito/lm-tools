import sharp from 'sharp'
import z from 'zod'
import { Outcome } from '../../../../../agnostic/misc/outcome/index.js'
import type { Color } from '../../../../../agnostic/colors/types.js'
import { isColor } from '../../../../../agnostic/colors/index.js'
import { toSharpColor } from '../../../utils/index.js'
import type { ResizeOperationParams } from '../../../types.js'

export function isResizeOperationParams (obj: unknown): Outcome.Either<ResizeOperationParams, string> {
  const schema = z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    fit: z.enum([
      'contain',
      'cover',
      'fill',
      'inside',
      'outside'
    ]).optional(),
    position: z.union([
      z.number(),
      z.string()
    ]).optional(),
    background: z.custom<Color>(isColor).optional(),
    kernel: z.enum([
      'nearest',
      'cubic',
      'linear',
      'mitchell',
      'lanczos2',
      'lanczos3',
      'mks2013',
      'mks2021'
    ]).optional(),
    withoutEnlargement: z.boolean().optional(),
    withoutReduction: z.boolean().optional(),
    fastShrinkOnLoad: z.boolean().optional()
  })
  const result = schema.safeParse(obj)
  if (!result.success) return Outcome.makeFailure(result.error.message)
  return Outcome.makeSuccess(result.data)
}

export async function resize (
  sharpInstance: sharp.Sharp,
  params: ResizeOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.resize({
    ...params,
    background: params.background !== undefined
      ? toSharpColor(params.background)
      : undefined
  })
}
