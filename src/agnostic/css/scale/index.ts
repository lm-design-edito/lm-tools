import { round } from '../../numbers/round/index.js'
import { getGeometricStep } from '../../numbers/geometric-progressions/index.js'

/** Describes a scale configuration for generating CSS values across levels and screen widths. */
export type ScaleDescriptor = {
  /** The lower and upper bounds for screen width in pixels, e.g., `[minWidth, maxWidth]`. */ screenBounds: [number, number]
  /** The minimum and maximum values for the low-level range, used at the lower end of the scale. */ lowLevel: [number, number]
  /** The minimum and maximum values for the high-level range, used at the higher end of the scale. */ highLevel: [number, number]
  /** The total number of discrete steps in the scale (must be ≥ 2 for interpolation). */ steps: number
  /** Optional. Whether to wrap the resulting CSS value in a `clamp()` function to enforce bounds. */ clamp?: boolean
}

/**
 * Creates a scale function that maps a level to a CSS size value using harmonic interpolation.
 *
 * @param {ScaleDescriptor} descriptor - The scale configuration.
 * @param {[number, number]} descriptor.screenBounds - The lower and upper bounds for screen width in pixels.
 * @param {[number, number]} descriptor.lowLevel - Minimum and maximum values for the low level range.
 * @param {[number, number]} descriptor.highLevel - Minimum and maximum values for the high level range.
 * @param {number} descriptor.steps - Number of discrete steps in the scale.
 * @param {boolean} [descriptor.clamp] - Whether to wrap the resulting CSS value in a `clamp()` function.
 * @returns {(level: number) => string | undefined} A function mapping a level to a CSS value string.
 */
export function createScale (descriptor: ScaleDescriptor): (level: number) => string | undefined {
  const {
    screenBounds: [loBound, hiBound],
    lowLevel: [loLevelMin, loLevelMax],
    highLevel: [hiLevelMin, hiLevelMax],
    steps,
    clamp
  } = descriptor
  return function scale (level: number) {
    if (steps < 2) return
    const loBoundVal = getGeometricStep(loLevelMin, hiLevelMin, level - 1, steps - 1)
    const hiBoundVal = getGeometricStep(loLevelMax, hiLevelMax, level - 1, steps - 1)
    if (loBoundVal === undefined) return
    if (hiBoundVal === undefined) return
    const affine = getAffineFunction(loBound, loBoundVal, hiBound, hiBoundVal)
    const cssFormula = getCssValueFromAffine(affine)
    return clamp === true
      ? `clamp(${round(loBoundVal, 2)}px, ${cssFormula}, ${round(hiBoundVal, 2)}px)`
      : cssFormula
  }
}

/* * * * * * * * * * * * * * * * * *
 *
 * Utils
 *
 * * * * * * * * * * * * * * * * * */

type AffineFunction = {
  slope: number
  yIntercept: number
}

function getAffineFunction (
  x1: number,
  y1: number,
  x2: number,
  y2: number): AffineFunction {
  const slope = (y2 - y1) / (x2 - x1)
  const yIntercept = y1 - (x1 * slope)
  return { slope, yIntercept }
}

function getCssValueFromAffine (affine: AffineFunction): string {
  const { slope, yIntercept } = affine
  const roundedSlope = round(100 * slope, 3)
  const roundedIntercept = round(yIntercept, 2)
  return `calc(${roundedSlope}vw + ${roundedIntercept}px)`
}
