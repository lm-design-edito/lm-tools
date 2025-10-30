import sharp from 'sharp'
import z from 'zod'
import { Outcome } from '../../../../../agnostic/misc/outcome/index.js'
import { isSharpColor } from '../../utils/index.js'

export type CompositeOperationParams = {
  composite: sharp.OverlayOptions[]
}

const isSharpCreate = z.object({
  create: z.object({
    width: z.number(),
    height: z.number(),
    channels: z.literal(3).or(z.literal(4)),
    background: z.custom<sharp.Color>((val) => isSharpColor(val))
  })
})
const isSharpText = z.object({
  text: z.object({
    text: z.string(),
    font: z.string().optional(),
    fontfile: z.string().optional(),
    width: z.number(),
    height: z.number(),
    align: z.enum(['left', 'center', 'right']).optional(),
    justify: z.boolean().optional(),
    dpi: z.number().optional(),
    rgba: z.boolean().optional(),
    spacing: z.number().optional(),
  })
})
const isSharpCreateRaw = z.object({
  raw: z.object({
    width: z.number(),
    height: z.number(),
    channels: z.literal(3).or(z.literal(4)),
    data: z.instanceof(Buffer),
    animated : z.boolean().optional(),
  })
})

export function isCompositeOperationParams (obj: unknown): Outcome.Either<CompositeOperationParams, string> {
  const schema = z.object({ 
    composite: z.array(z.object({
      input: z.union([
        z.string(), 
        z.instanceof(Buffer),
        isSharpCreate,
        isSharpText,
        isSharpCreateRaw,
      ]),
      top: z.number().optional(),
      left: z.number().optional(),
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
      tile: z.boolean().optional(),
      gravity: z.enum([
        'north', 'northeast', 'east', 'southeast', 'south', 'southwest',
        'west', 'northwest', 'center', 'centre'
      ]).optional(),
      premultiplied: z.boolean().optional(),
      density: z.number().optional()
    }))   
  })
  const result = schema.safeParse(obj)
  if (!result.success) return Outcome.makeFailure(result.error.message)
    
  return Outcome.makeSuccess(result.data);
}

export async function composite (
  sharpInstance: sharp.Sharp,
  params: CompositeOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.composite(params.composite)
}
