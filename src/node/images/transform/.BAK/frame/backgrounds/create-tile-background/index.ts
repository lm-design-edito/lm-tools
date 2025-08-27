import zod from 'zod';

export type CreateTileBackground = {
    type: 'tile',
    params: {
        coverageRatio: number,
        densityA: { min: number, max: number },
        densityB: { min: number, max: number },
        format: 'random' | 'default' | 'portrait' | 'landscape',
        xEasing: typeof TransitionNames[number],
        yEasing: typeof TransitionNames[number],
    }
}


export const TransitionNames = [
    'linear',
    'ease-in-quad',
    'ease-out-quad',
    'ease-in-out-quad',
    'ease-in-cubic',
    'ease-out-cubic',
    'ease-in-out-cubic',
    'ease-in-quart',
    'ease-out-quart',
    'ease-in-out-quart',
    'ease-in-quint',
    'ease-out-quint',
    'ease-in-out-quint',
    'ease-in-sine',
    'ease-out-sine',
    'ease-in-out-sine',
    'ease-in-expo',
    'ease-out-expo',
    'ease-in-out-expo',
    'ease-in-circ',
    'ease-out-circ',
    'ease-in-out-circ',
    'ease-in-back',
    'ease-out-back',
    'ease-in-out-back',
    'ease-in-elastic',
    'ease-out-elastic',
    'ease-in-out-elastic',
    'ease-in-bounce',
    'ease-out-bounce',
    'ease-in-out-bounce'    
] as const;

export const createTileBackgroundSchema = zod.object({
    type: zod.literal('tile'),
    params: zod.object({
        coverageRatio: zod.number(),
        densityA: zod.object({
            min: zod.number(),
            max: zod.number(),
        }),
        densityB: zod.object({
            min: zod.number(),
            max: zod.number(),
        }),
        format: zod.enum([
            'random',
            'default',
            'portrait',
            'landscape'
        ]),
        xEasing: zod.enum(TransitionNames),
        yEasing: zod.enum(TransitionNames),
    })
})  