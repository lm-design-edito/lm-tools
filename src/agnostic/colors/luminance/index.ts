import { linearizeToSRgb, toLab, toRgb, toXyz } from '../convert/index.js'
import type { Color, Rgba, LuminanceMethod } from '../types.js'

function luminanceRgb (rgb: Rgba): number {
  const { linearR, linearG, linearB } = linearizeToSRgb(rgb)
  return (0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB)
}

/**
 * Calculates the relative luminance of a color using the specified method.
 *
 * @param color - The color to analyze.
 * @param [method='lab'] - The calculation method to use.
 * @returns The relative luminance value (0-1).
 */
export function luminance (color: Color, method: LuminanceMethod = 'lab'): number {
  switch (method) {
    case 'rgb': return luminanceRgb(toRgb(color))
    case 'xyz': return toXyz(color).y / 100
    case 'lab': return toLab(color).l / 100
  }
}
