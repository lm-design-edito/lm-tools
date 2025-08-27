import zod from 'zod';

export type ColorTransformation = {
    type: 'saturate' | 'lighten' | 'complement',
    intensity: number,
    intensityMode: 'add' | 'set'
}


export type CreateLineBackground = {
    type: 'line',
    params: {
        nbLines: number,
        colors: {
            selectColorPaletteIndex: 'first' | 'last' | number,
            primaryTransformations: ColorTransformation[],
            secondaryTransformations: ColorTransformation[]
        }
    }
}

export const colorTransformationsSchema = zod.array(zod.object({
    type: zod.enum(['saturate', 'lighten', 'complement']),
    intensity: zod.number().min(0).max(100),
    intensityMode: zod.enum(['add', 'set'])
}));

export const createLineBackgroundSchema = zod.object({
    type: zod.literal('line'),
    params: zod.object({
        nbLines: zod.number().min(1),
        colors: zod.object({
            selectColorPaletteIndex: zod.union([
                zod.literal('first'),
                zod.literal('last'),
                zod.number().min(0)
            ]),
            primaryTransformations: colorTransformationsSchema,
            secondaryTransformations: colorTransformationsSchema
        })
    })
})  