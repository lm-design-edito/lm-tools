/**
 * Restricts a number to lie within a specified range.
 *
 * @param {number} num - The number to clamp.
 * @param {number} bound1 - One end of the range.
 * @param {number} bound2 - The other end of the range.
 * @returns {number} The number constrained between the minimum and maximum of the two bounds.
 */
export function clamp (num: number, bound1: number, bound2: number): number {
  const min = Math.min(bound1, bound2)
  const max = Math.max(bound1, bound2)
  return Math.min(Math.max(num, min), max)
}
