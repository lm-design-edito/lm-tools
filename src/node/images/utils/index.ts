import { readFile } from 'node:fs/promises'
import sharp from 'sharp'
import type { Color } from '../../../agnostic/colors/types.js'
import { toRgb, tidy } from '../../../agnostic/colors/index.js'
import { isNonNullObject } from '../../../agnostic/objects/is-object/index.js'
import type { CreateOptions, ImageLike } from '../types.js'

export function toSharpColor (color: Color): sharp.RGBA {
  const rgb = tidy(toRgb(color))
  return {
    r: rgb.r,
    g: rgb.g,
    b: rgb.b,
    alpha: rgb.a
  }
}

export function isDuckTypedSharpInstance (obj: unknown): obj is sharp.Sharp {
  if (!isNonNullObject(obj)) return false
  return 'avif' in obj
  && 'clone' in obj
    && 'gif' in obj
    && 'heif' in obj
    && 'jpeg' in obj
    && 'heif' in obj
    && 'metadata' in obj
    && 'png' in obj
    && 'resize' in obj
    && 'tiff' in obj
    && 'webp' in obj
    && typeof obj.avif === 'function'
    && typeof obj.clone === 'function'
    && typeof obj.gif === 'function'
    && typeof obj.heif === 'function'
    && typeof obj.jpeg === 'function'
    && typeof obj.heif === 'function'
    && typeof obj.metadata === 'function'
    && typeof obj.png === 'function'
    && typeof obj.resize === 'function'
    && typeof obj.tiff === 'function'
    && typeof obj.webp === 'function'
}

export function toCreateOptions (options: CreateOptions): sharp.SharpOptions['create'] {
  return {
    width: options.width ?? 100,
    height: options.height ?? 100,
    channels: options.channels ?? 4,
    background: options.background !== undefined
      ? toSharpColor(options.background)
      : toSharpColor('white'),
    noise: options.noise !== undefined
     ? { ...options.noise, type: 'gaussian' }
     : undefined,
    pageHeight: options.pageHeight
  }
}

export async function toSharpInstance (imageLike: ImageLike, clone: boolean = false): Promise<sharp.Sharp> {
  if (typeof imageLike === 'string') return sharp(await readFile(imageLike))
  if (Buffer.isBuffer(imageLike)) return sharp(imageLike)
  if (isDuckTypedSharpInstance(imageLike)) return clone
    ? imageLike.clone()
    : imageLike
  return sharp({ create: toCreateOptions(imageLike) })
}
