import zod from 'zod'
import { OperationNames } from '../_utils/operation-names'
import { colorSchema } from '../_utils/color-schema'
import { Positions, positionsSchema } from '../_utils/positions';
import sharp from 'sharp'
import { CreateLineBackground, createLineBackgroundSchema } from './backgrounds/create-line-background';
import { CreateTileBackground, createTileBackgroundSchema } from './backgrounds/create-tile-background';


export type FrameOperation = {
  name: typeof OperationNames.Frame,
  params: FrameOperationParams
}

export type FrameOperationParams = {
    dimensions: {
      widthPx: number,
      heightPx: number
    },
    imageScale?: {
      xRatio?: number,
      yRatio?: number
    },
    background: sharp.Color | FrameCreateBackground,
    positions: Positions
};

export type FrameCreateBackground = (CreateLineBackground | CreateTileBackground) & FrameCreateBackgroundOptions;

type FrameCreateBackgroundOptions = {
    colorPalette?: {
      extract?: {
        nbColor: number,
      },
      use?: {
        RGBColors: [number, number, number][]
      },
      densify?: {
        types: ('default' | 'default-lighten' | 'default-saturate' | 'complementary' | 'complementary-lighten' | 'complementary-saturate')[],
        ligthenIntensity?: number,
        saturateIntensity?: number,
      },
      compose?: {
        nbColor?: number,
        mix?: boolean
      }
    },
}


const createBackgroundOptionsSchema = {
  colorPalette: zod.optional(zod.object({
    extract: zod.optional(zod.object({
      nbColor: zod.number()
    })),
    use: zod.optional(zod.object({
      RGBColors: zod.array(zod.tuple([zod.number(), zod.number(), zod.number()]))
    })),
    densify: zod.optional(zod.object({
      types: zod.array(zod.enum([
          'default',
          'default-lighten',
          'default-saturate',
          'complementary',
          'complementary-lighten',
          'complementary-saturate'
      ])),
      ligthenIntensity: zod.optional(zod.number()),
      saturateIntensity: zod.optional(zod.number()),
    })),
    compose: zod.optional(zod.object({
      nbColor: zod.optional(zod.number()),
      mix: zod.optional(zod.boolean())
    }))
  }))
}

export const frameSchema: zod.ZodType<FrameOperation> = zod.object({
  name: zod.literal(OperationNames.Frame),
  params: zod.object({
    dimensions: zod.object({
        widthPx: zod.number().min(0),
        heightPx: zod.number().min(0),
    }),
    imageScale: zod.object({
        xRatio: zod.optional(zod.number().min(0).max(1)),
        yRatio: zod.optional(zod.number().min(0).max(1)),
    }).optional(),
    positions: positionsSchema,
    background: zod.union([
      colorSchema,
      createLineBackgroundSchema.extend(createBackgroundOptionsSchema),
      createTileBackgroundSchema.extend(createBackgroundOptionsSchema)
    ])
  })
})