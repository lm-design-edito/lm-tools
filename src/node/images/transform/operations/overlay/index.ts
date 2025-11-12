import sharp from 'sharp'
import z from 'zod'
import { Outcome } from '../../../../../agnostic/misc/outcome/index.js'
import type { Color } from '../../../../../agnostic/colors/types.js'
import { isColor } from '../../../../../agnostic/colors/index.js'
import { isDuckTypedSharpInstance, toSharpInstance } from '../../../utils/index.js'
import type { OverlayOperationParams } from '../../../types.js'

export function isOverlayOperationParams (obj: unknown): Outcome.Either<OverlayOperationParams, string> {
  const schema = z.object({ 
    input: z.union([
      z.custom<sharp.Sharp>(isDuckTypedSharpInstance),
      z.custom<Buffer>(Buffer.isBuffer),
      z.string(),
      z.object({
        width: z.number().optional(),
        height: z.number().optional(),
        channels: z.union([z.literal(3), z.literal(4)]).optional(),
        background: z.custom<Color>(isColor).optional(),
        noise: z.object({
          mean: z.number().optional(),
          sigma: z.number().optional()
        }).optional(),
        pageHeight: z.number().optional()
      })
    ]),
    top: z.number().optional(),
    left: z.number().optional(),
    tile: z.boolean().optional(),
    premultiplied: z.boolean().optional(),
    density: z.number().optional(),
    animated: z.boolean().optional(),
    autoOrient: z.boolean().optional(),
    ignoreIcc: z.boolean().optional(),
    pages: z.number().optional(),
    page: z.number().optional(),
    blend: z.enum([
      'clear',
      'source',
      'over',
      'in',
      'out',
      'atop',
      'dest',
      'dest-over',
      'dest-in',
      'dest-out',
      'dest-atop',
      'xor',
      'add',
      'saturate',
      'multiply',
      'screen',
      'overlay',
      'darken',
      'lighten',
      'color-dodge',
      'colour-dodge',
      'color-burn',
      'colour-burn',
      'hard-light',
      'soft-light',
      'difference',
      'exclusion'
    ]).optional(),
    gravity: z.enum([
      'north',
      'northeast',
      'southeast',
      'south',
      'southwest',
      'west',
      'northwest',
      'east',
      'center',
      'centre'
    ]).optional()
  })
  const result = schema.safeParse(obj)
  if (!result.success) return Outcome.makeFailure(result.error.message)
  return Outcome.makeSuccess(result.data)
}

export async function overlay (
  sharpInstance: sharp.Sharp,
  params: OverlayOperationParams
): Promise<sharp.Sharp> {
  const inputBuffer = params.input instanceof Buffer
    ? params.input
    : await (await toSharpInstance(params.input)).toBuffer()
  return sharpInstance.composite([{
    ...params,
    input: inputBuffer
  }])
}
