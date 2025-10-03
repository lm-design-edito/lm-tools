import sharp from 'sharp'
import z from 'zod'
import { Outcome } from '../../../../../agnostic/misc/outcome'
import { isSharpColor } from '../../utils'

export type ResizeOperationParams = {
  width?: number
  height?: number
  fit?: keyof sharp.FitEnum
  position?: number | string
  background?: sharp.Color
  kernel?: keyof sharp.KernelEnum
  withoutEnlargement?: boolean
  withoutReduction?: boolean
  fastShrinkOnLoad?: boolean
}

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
    background: z.custom<sharp.Color>((val) => isSharpColor(val)).optional(),
    kernel: z.enum([
      'nearest',
      'cubic',
      'mitchell',
      'lanczos2',
      'lanczos3'
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
  return sharpInstance.resize(params)
}
