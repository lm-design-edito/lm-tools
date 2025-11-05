import { linearizeToSRgb, toLab, toRgb, toXyz } from 'agnostic/colors/types.js'
import { Color, Rgba, LuminanceMethod } from '../types.js'

function luminanceRgb (rgb: Rgba): number {
  const { linearR, linearG, linearB } = linearizeToSRgb(rgb)
  return (0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB) / 255
}

export function luminance (color: Color, method: LuminanceMethod = 'lab'): number {
  switch (method) {
    case 'rgb': return luminanceRgb(toRgb(color))
    case 'xyz': return toXyz(color).y / 100
    case 'lab': return toLab(color).l / 100
  }
}
