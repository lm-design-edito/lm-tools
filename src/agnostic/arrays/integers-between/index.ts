import { make } from '../make/index.js'

/**
 * Lists every integer from `from` to `to`, both included.
 *
 * @param from - Lower bound.
 * @param to - Upper bound. When lower than `from`, the list is empty.
 * @returns The integers in ascending order.
 */
export function integersBetween (from: number, to: number): number[] {
  return make(pos => from + pos, Math.max(0, to - from + 1))
}
