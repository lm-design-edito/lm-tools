import { round } from '../../numbers/round/index.js'

// [WIP] rename, responsive harmonics is not quite right

/**
 * Computes the harmonic value at a specific level between a minimum and maximum over a number of steps.
 *
 * @param {number} min - The minimum value (must be non-zero).
 * @param {number} max - The maximum value.
 * @param {number} level - The current level (1-based).
 * @param {number} steps - Total number of steps (must be ≥ 1).
 * @returns {number} The computed harmonic value, or `NaN` if input is invalid.
 */
export function getHarmonic (
  min: number,
  max: number,
  level: number,
  steps: number
): number {
  if (min === 0) {
    console.warn('Cannot generate harmonics if min value is zero')
    return NaN
  }
  if (steps < 1) {
    console.warn('Cannot generate harmonics if steps is lower than one')
    return NaN
  }
  const maxOverMin = max / min
  const oneOverSteps = 1 / parseInt(`${steps}`)
  const factor = Math.pow(maxOverMin, oneOverSteps)
  return min * Math.pow(factor, level)
}

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

function getCssValueFromAffine (affine: AffineFunction) {
  const { slope, yIntercept } = affine
  const roundedSlope = round(100 * slope, 3)
  const roundedIntercept = round(yIntercept, 2)
  return `calc(${roundedSlope}vw + ${roundedIntercept}px)`
}

type ScaleDescriptor = {
  screenBounds: [number, number]
  lowLevel: [number, number]
  highLevel: [number, number]
  steps: number
  clamp?: boolean
}

// [WIP] this should live in css helpers, not number

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
    const loBoundVal = getHarmonic(loLevelMin, hiLevelMin, level - 1, steps - 1)
    const hiBoundVal = getHarmonic(loLevelMax, hiLevelMax, level - 1, steps - 1)
    if (loBoundVal === undefined) return
    if (hiBoundVal === undefined) return
    const affine = getAffineFunction(loBound, loBoundVal, hiBound, hiBoundVal)
    const cssFormula = getCssValueFromAffine(affine)
    return clamp === true
      ? `clamp(${round(loBoundVal, 2)}px, ${cssFormula}, ${round(hiBoundVal, 2)}px)`
      : cssFormula
  }
}
