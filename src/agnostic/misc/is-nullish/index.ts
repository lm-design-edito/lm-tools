/**
 * Array of values considered "nullish".
 *
 * Contains `null` and `undefined`.
 */
export const nullishValues = [null, undefined]

/**
 * Represents a nullish value (`null` or `undefined`).
 */
export type Nullish = null | undefined

/**
 * Checks whether a value is nullish (`null` or `undefined`).
 *
 * @template T
 * @param val - The value to check.
 * @returns `true` if the value is nullish, otherwise `false`.
 */
export function isNullish (val: unknown): val is Nullish {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Array.includes() does a strict equality check regardless of this cast; safe for any T
  return nullishValues.includes(val as Nullish)
}

/**
 * Checks whether a value is not nullish (`null` or `undefined`).
 *
 * @template T
 * @param val - The value to check.
 * @returns `true` if the value is not nullish, otherwise `false`.
 */
export function isNotNullish<T> (val: T): val is Exclude<T, Nullish> {
  return !isNullish(val)
}
