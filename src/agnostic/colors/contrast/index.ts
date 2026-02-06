import type { Color, Rgba, ContrastMethod } from '../types.js'
import { luminance } from '../luminance/index.js'
import { toRgb } from '../convert/index.js'

function contrastWcag (c1: Rgba, c2: Rgba): number {
  const L1 = luminance(c1, 'rgb')
  const L2 = luminance(c2, 'rgb')
  const lighter = Math.max(L1, L2)
  const darker = Math.min(L1, L2)
  const numerator = lighter + 0.05
  const denominator = darker + 0.05
  const ratio = numerator / denominator
  return ratio
}

// [WIP] maybe contrast weber, michelson, rms, etc...

/**
 * Calculates the contrast ratio between two colors using the specified method.
 *
 * @param {Color} c1 - The first color.
 * @param {Color} c2 - The second color.
 * @param {ContrastMethod} [method='wcag'] - The calculation method to use.
 * @returns {number} The contrast ratio. For WCAG, values range from 1 (no contrast) to 21 (maximum contrast).
 */
export function contrast (
  c1: Color,
  c2: Color,
  method: ContrastMethod = 'wcag'
): number {
  switch (method) {
    case 'wcag': return contrastWcag(toRgb(c1), toRgb(c2))
  }
}
