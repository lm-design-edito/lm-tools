/**
 * Lists every integer from `from` to `to`, both included.
 *
 * @param from - Lower bound.
 * @param to - Upper bound. When lower than `from`, the range is empty.
 * @returns The integers in ascending order.
 */
export function rangeBetween (from: number, to: number): number[] {
  return Array.from({ length: Math.max(0, to - from + 1) }, (_, pos) => from + pos)
}
