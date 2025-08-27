import { Color } from 'sharp';
import zod from 'zod';

export const colorSchema: zod.ZodType<Color> = zod.object({
    r: zod.number().min(0).max(255),
    g: zod.number().min(0).max(255),
    b: zod.number().min(0).max(255),
    alpha: zod.number().min(0).max(1),
  }).or(zod.string().length(7))
