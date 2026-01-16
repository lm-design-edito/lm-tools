import { isFalsy } from '../../booleans/is-falsy/index.js'

/**
 * Converts a value to a boolean.
 *
 * - Booleans are returned as-is.
 * - Strings equal to `"true"` (case-insensitive, trimmed) are `true`, others `false`.
 * - Other values are coerced using `!isFalsy`.
 *
 * @param {unknown} value - The value to convert.
 * @returns {boolean} The boolean representation of the input.
 */
export function toBoolean (value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    if (value.toLowerCase().trim() === 'true') return true
    return false
  }
  return !isFalsy(value)
}

/**
 * Converts a value to a number.
 *
 * - Numbers are returned as-is.
 * - Strings are parsed as floats.
 * - Other values return 0.
 *
 * @param {unknown} value - The value to convert.
 * @returns {number} The numeric representation of the input.
 */
export function toNumber (value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value)
  return 0
}

/**
 * Converts a value to a string.
 *
 * - Strings are returned as-is.
 * - Other values are converted using `String()`.
 *
 * @param {unknown} value - The value to convert.
 * @returns {string} The string representation of the input.
 */
export function toString (value: unknown): string {
  if (typeof value === 'string') return value
  return String(value)
}

/**
 * Converts any value to `null`.
 *
 * @param {unknown} _value - The input value (ignored).
 * @returns {null} Always returns `null`.
 */
export function toNull (_value: unknown): null {
  return null
}

/**
 * Converts a value to an array.
 *
 * - Arrays are returned as-is.
 * - Objects are converted to an array of `[key, value]` pairs.
 * - Other values are wrapped in a single-element array.
 *
 * @param {unknown} value - The value to convert.
 * @returns {Array<unknown>} The array representation of the input.
 */
export function toArray(value: unknown): Array<unknown> {
  if (Array.isArray(value)) return value
  if (typeof value === 'object' && value !== null) return Object.entries(value)
  return [value]
}

// [WIP] not so sure about this one
/**
 * Converts a value to an array of numbers.
 *
 * - Uses `toArray` to ensure an array.
 * - Each element is converted to a number using `toNumber`.
 *
 * @param {unknown} value - The value to convert.
 * @returns {number[]} Array of numeric values.
 */
export function toNumberArr (value: unknown): number[] {
  const arrValue = toArray(value)
  return arrValue.map(val => toNumber(val))
}

/**
 * Converts a value to a plain object (record).
 *
 * - Keys and values of objects are copied.
 * - Non-object values return an empty object.
 *
 * @param {unknown} value - The value to convert.
 * @returns {Record<string, unknown>} The object representation of the input.
 */
export function toRecord (value: unknown): Record<string, unknown> {
  const record: Record<string, unknown> = {}
  try {
    Object
      .keys(value as any)
      .forEach(key => { record[key] = (value as any)[key] })
  } catch (err) {
    return record
  }
  return record
}

/**
 * Converts a value to an `Error` object.
 *
 * - Returns the value if it is already an `Error`.
 * - Strings are used as the error message.
 * - Other values are converted to string and used as the error message.
 *
 * @param {unknown} value - The value to convert.
 * @returns {Error} An `Error` instance representing the input.
 */
export function toError (value: unknown): Error {
  if (value instanceof Error) return value
  if (typeof value === 'string') return new Error(value)
  return new Error(toString(value))
}
