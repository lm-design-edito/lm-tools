import zod from 'zod'
import { OperationNames } from '../_utils/operation-names'

export type HueRotateOperationParams = number

export type HueRotateOperation = {
  name: typeof OperationNames.HueRotate,
  params: HueRotateOperationParams
}

export const hueRotateSchema: zod.ZodType<HueRotateOperation> = zod.object({
  name: zod.literal(OperationNames.HueRotate),
  params: zod.number().min(0).max(360)
})
