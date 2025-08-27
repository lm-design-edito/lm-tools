import zod from 'zod'
import { colorSchema } from '../_utils/color-schema'
import { OperationNames } from '../_utils/operation-names'

export type FlipOperationParams = {
  flip?: boolean
} 

export type FlipOperation = {
  name: typeof OperationNames.Flip,
  params: FlipOperationParams
}

export const flipSchema: zod.ZodType<FlipOperation> = zod.object({
  name: zod.literal(OperationNames.Flip),
  params: zod.object({
    flip: zod.boolean().optional()
  })
})
