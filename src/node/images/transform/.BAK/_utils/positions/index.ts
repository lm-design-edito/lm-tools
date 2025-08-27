import zod from 'zod'

export type Position = string | number

export type Positions = {
    top?: Position
    left?: Position
    right?:  Position
    bottom?:  Position
    translateX?: Position
    translateY?: Position
}

export const positionSchema = zod.union([
    zod.number().min(0),
    zod.string()
]).optional();

export const positionsSchema =  zod.object({
    top: positionSchema,
    left: positionSchema,
    bottom: positionSchema,
    right: positionSchema,
    translateX: positionSchema,
    translateY: positionSchema,
})
