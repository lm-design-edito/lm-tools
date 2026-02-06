/**
 * Computes the value at a specific level in a geometric progression
 * between a minimum and maximum over a given number of steps.
 *
 * This function divides the range [min, max] multiplicatively (logarithmically)
 * across `steps` and returns the value corresponding to `level` (1-based).
 *
 * @param {number} min - The minimum value (must be non-zero).
 * @param {number} max - The maximum value.
 * @param {number} level - The current level (1-based, typically 1 ≤ level ≤ steps).
 * @param {number} steps - Total number of steps (must be ≥ 1).
 * @returns {number} The computed value at the specified level, or `NaN` if input is invalid.
 */
export function getGeometricStep (
  min: number,
  max: number,
  level: number,
  steps: number
): number {
  if (min === 0) {
    console.warn('Cannot generate values if min value is zero')
    return NaN
  }
  if (steps < 1) {
    console.warn('Cannot generate values if steps is lower than one')
    return NaN
  }
  const maxOverMin = max / min
  const factor = Math.pow(maxOverMin, 1 / steps)
  return min * Math.pow(factor, level)
}
