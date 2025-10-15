import sharp from 'sharp'
import z from 'zod'
import { Outcome } from '../../../../../agnostic/misc/outcome'
import { isSharpColor } from '../../utils'

export type CompositeOperationParams = {
  composite: sharp.OverlayOptions[]
}

const isSharpCreate = z.object({
  width: z.number(),
  height: z.number(),
  channels: z.number().optional(),
  background: z.custom<sharp.Color>((val) => isSharpColor(val)).optional()
})
const isSharpCreateText = z.object({
  text: z.string(),
  width: z.number(),
  height: z.number(),
  background: z.custom<sharp.Color>((val) => isSharpColor(val)).optional()
})
const isSharpCreateRaw = z.object({
  width: z.number(),
  height: z.number(),
  channels: z.number(),
  data: z.instanceof(Buffer)
})

export function isCompositeOperationParams (obj: unknown): Outcome.Either<CompositeOperationParams, string> {
  const schema = z.object({ 
    composite: z.array(z.object({
      input: z.union([
        z.string(), 
        z.instanceof(Buffer),
        isSharpCreate,
        isSharpCreateText,
        isSharpCreateRaw,
      ]).optional(),
      top: z.number().optional(),
      left: z.number().optional(),
      blend: z.enum([
        'clear', 'dest', 'dest-atop', 'dest-in', 'dest-out', 'dest-over',
        'source-atop', 'source-in', 'source-out', 'source-over',
        'over', 'atop', 'in', 'out', 'xor', 'add', 'saturate', 'multiply',
        'screen', 'overlay', 'darken', 'lighten', 'colour-dodge', 'color-dodge',
        'colour-burn', 'color-burn', 'hard-light', 'soft-light', 'difference',
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

  // @todo: TS ma soulée j'avoue : Transform input fields to match OverlayOptions type
  const composite = result.data.composite.map((item) => {
    if (item.input && typeof item.input === 'object' && 'width' in item.input && 'height' in item.input) {
      if ('channels' in item.input || 'background' in item.input) {
        // { width, height, channels?, background? } => { create: ... }
        return { ...item, input: { create: item.input } }
      }
      if ('text' in item.input) {
        // { text, width, height, background? } => { text: ... }
        return { ...item, input: { text: item.input } }
      }
      if ('data' in item.input && 'channels' in item.input) {
        // { width, height, channels, data } => { raw: ... }
        return { ...item, input: { raw: item.input } }
      }
    }
    return item
  })
  return Outcome.makeSuccess({ composite } as CompositeOperationParams)
}

export async function composite (
  sharpInstance: sharp.Sharp,
  params: CompositeOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.composite(params.composite)
}
