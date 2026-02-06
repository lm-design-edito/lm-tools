/**
 * Generates a random number within a range.
 *
 * @param {number} [bound1=1] - The lower bound if `bound2` is provided, otherwise the upper bound (min is 0).
 * @param {number} [bound2] - Optional upper bound. If omitted, the range is `[0, bound1)`.
 * @returns {number | undefined} A random floating-point number in `[min, max)`, or `undefined` if bounds are invalid.
 */
export function random (bound1?: number): number | undefined
export function random (bound1?: number, bound2?: number | undefined): number | undefined
export function random (bound1: number = 1, bound2?: number | undefined): number | undefined {
  const min = bound2 === undefined ? 0 : bound1
  const max = bound2 ?? bound1
  if (min === max || min > max) return undefined
  const range = max - min
  return (Math.random() * range) + min
}

/**
 * Generates a random integer within a range.
 *
 * @param {number} [bound1=1] - The lower bound if `bound2` is provided, otherwise the upper bound (min is 0).
 * @param {number} [bound2] - Optional upper bound. If omitted, the range is `[0, bound1)`.
 * @returns {number | undefined} A random integer in `[min, max)`, or `undefined` if bounds are invalid.
 */
export function randomInt (...args: Parameters<typeof random>): number | undefined {
  const rand = random(...args)
  return rand !== undefined ? Math.floor(rand) : undefined
}
