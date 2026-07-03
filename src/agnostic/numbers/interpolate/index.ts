/**
 * Performs linear interpolation between two bounds based on a ratio.
 *
 * @param ratio - The interpolation factor, typically between 0 and 1.
 * @param bound1 - The start value.
 * @param bound2 - The end value.
 * @returns The interpolated value between `bound1` and `bound2`.
 */
export function interpolate (
  ratio: number,
  bound1: number,
  bound2: number
): number {
  return bound1 + ratio * (bound2 - bound1)
}

/**
 * Performs inverse linear interpolation (also called "unlerp") of a value relative to one or two bounds.
 *
 * If only `bound1` is provided, returns the ratio of `value / bound1`.
 * If both bounds are provided, returns the normalized position of `value` between `bound1` and `bound2`.
 *
 * @param value - The value to normalize.
 * @param bound1 - The lower bound (or single reference value if `bound2` is omitted).
 * @param [bound2] - The upper bound (optional).
 * @returns A ratio representing the relative position of `value`.
 */
export function unlerp (
  value: number,
  bound1: number,
  bound2?: number
): number {
  if (bound2 === undefined) return value / bound1
  return (value - bound1) / (bound2 - bound1)
}
