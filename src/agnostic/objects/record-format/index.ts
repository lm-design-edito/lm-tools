import type { UnwrapPromise } from '../../typescript/types.js'

/**
 * A function that transforms a value of a specific type into another type, can return a Promise.
 *
 * @template InputType - The type of the input value the formatter receives.
 * @template OutputType - The type of the value the formatter returns (or resolves to if Promise).
 * @param {InputType} val - The input value to transform.
 * @returns {OutputType | Promise<OutputType>} The transformed value or a Promise resolving to it.
 */
export type FormatterFunc<InputType, OutputType> = (val: InputType) => OutputType | Promise<OutputType>

/**
 * An object mapping keys of an input object to formatter functions.
 * Each formatter receives the value corresponding to its key from the input object.
 *
 * @template InputObject - The type of the input object being formatted.
 */
export type Format<InputObject extends Record<PropertyKey, any>> = {
  [Key in keyof InputObject]?: FormatterFunc<InputObject[Key], any>
}

/**
 * The resulting object after applying all formatters and unwrapping any returned Promises.
 *
 * @template FormatObject - The type of the format object mapping keys to formatter functions.
 */
export type Formatted<FormatObject> = {
  [Key in keyof FormatObject]: FormatObject[Key] extends FormatterFunc<any, any>
    ? UnwrapPromise<ReturnType<FormatObject[Key]>>
    : never
}

/**
 * Applies a set of formatter functions to the corresponding properties of an input object.
 *
 * @template InputObject - The type of the input object.
 * @template FormatObject - The type of the format object mapping keys to formatter functions.
 * @param {InputObject} input - The object whose properties are to be formatted.
 * @param {FormatObject} format - An object containing formatter functions for each key.
 * @returns {Promise<Formatted<FormatObject>>} A Promise resolving to the formatted object with all promises unwrapped.
 */
export async function recordFormat<
  InputObject extends Record<PropertyKey, any>,
  FormatObject extends Format<InputObject>
> (
  input: InputObject,
  format: FormatObject
): Promise<Formatted<FormatObject>> {
  const result: Partial<Formatted<FormatObject>> = {}
  for (const key in format) {
    const formatter = format[key]
    if (formatter === undefined) continue
    result[key] = await formatter(input[key])
  }
  return result as Formatted<FormatObject>
}
