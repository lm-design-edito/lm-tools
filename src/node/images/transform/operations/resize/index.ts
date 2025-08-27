import sharp from 'sharp'
import z from 'zod'
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

export function isResizeOperationParams (obj: unknown): obj is ResizeOperationParams {
  return z.object({
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
      'lanczos3',
      'mks2013',
      'mks2021',
    ]).optional(),
  }).safeParse(obj).success
}

export async function resize (
  sharpInstance: sharp.Sharp,
  params: ResizeOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.resize(params)
}
