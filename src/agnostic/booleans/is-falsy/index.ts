import { nullishValues, Nullish } from '../../misc/is-nullish/index.js'

/** Union type representing all falsy values in JavaScript. */
export type Falsy = Nullish | false | '' | 0 | -0 | typeof NaN | 0n
/** Type that excludes falsy values from T (except numbers, which may be 0). */
export type NotFalsy<T> = Exclude<T, Exclude<Falsy, number>>

/** Array containing all falsy values for comparison. */
const falsyValues: Falsy[] = [...nullishValues, false, '', 0, -0, NaN]
if (typeof BigInt === 'function') falsyValues.push(BigInt(0) as 0n)
export { falsyValues }

/**
 * Type guard to check if a value is falsy.
 *
 * Checks if the value is one of: null, undefined, false, empty string, 0, -0, NaN, or 0n.
 *
 * @param val - The value to check.
 * @returns `true` if the value is falsy, `false` otherwise.
 */
export function isFalsy<T> (val: T | Falsy): val is Falsy {
  return falsyValues.includes(val as any)
} 

/**
 * Type guard to check if a value is not falsy.
 *
 * @param val - The value to check.
 * @returns `true` if the value is not falsy, `false` otherwise.
 */
export function isNotFalsy<T> (val: T): val is NotFalsy<T> {
  return !isFalsy(val)
}
