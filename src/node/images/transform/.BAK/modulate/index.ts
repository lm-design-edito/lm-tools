import zod from 'zod'
import { OperationNames } from '../_utils/operation-names'

export type ModulateOperationParams = {
  brightness?: number 
  lightness?: number 
  hue?: number 
  saturation?: number 
}

export type ModulateOperation = {
  name: typeof OperationNames.Modulate,
  params: ModulateOperationParams
}

export const modulateSchema: zod.ZodType<ModulateOperation> = zod.object({
  name: zod.literal(OperationNames.Modulate),
  params: zod.object({
    lightness: zod.optional(zod.number().min(0)),
    brightness: zod.optional(zod.number().min(0)),
    saturation: zod.optional(zod.number().min(0)),
    hue: zod.optional(zod.number().min(0))
  })
})
