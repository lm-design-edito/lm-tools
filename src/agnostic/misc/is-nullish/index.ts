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
 * @param {T | Nullish} val - The value to check.
 * @returns {val is Nullish} `true` if the value is nullish, otherwise `false`.
 */
export function isNullish<T> (val: T | Nullish): val is Nullish {
  return nullishValues.includes(val as Nullish)
}

/**
 * Checks whether a value is not nullish (`null` or `undefined`).
 *
 * @template T
 * @param {T} val - The value to check.
 * @returns {val is Exclude<T, Nullish>} `true` if the value is not nullish, otherwise `false`.
 */
export function isNotNullish<T> (val: T): val is Exclude<T, Nullish> {
  return !isNullish(val)
}
