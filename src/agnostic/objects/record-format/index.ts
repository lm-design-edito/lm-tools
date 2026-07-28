import type { UnwrapPromise } from '../../typescript/types.js'

/**
 * A function that transforms a value of a specific type into another type, can return a Promise.
 *
 * @template InputType - The type of the input value the formatter receives.
 * @template OutputType - The type of the value the formatter returns (or resolves to if Promise).
 * @param val - The input value to transform.
 * @returns The transformed value or a Promise resolving to it.
 */
export type FormatterFunc<InputType, OutputType> = (val: InputType) => OutputType | Promise<OutputType>

/**
 * An object mapping keys of an input object to formatter functions.
 * Each formatter receives the value corresponding to its key from the input object.
 *
 * @template InputObject - The type of the input object being formatted.
 */
export type Format<InputObject extends Record<PropertyKey, unknown>> = {
  [Key in keyof InputObject]?: FormatterFunc<InputObject[Key], unknown>
}

/**
 * The resulting object after applying all formatters and unwrapping any returned Promises.
 *
 * @template FormatObject - The type of the format object mapping keys to formatter functions.
 */
export type Formatted<FormatObject> = {
  [Key in keyof FormatObject]: FormatObject[Key] extends FormatterFunc<unknown, unknown>
    ? UnwrapPromise<ReturnType<FormatObject[Key]>>
    : never
}

/**
 * Applies a set of formatter functions to the corresponding properties of an input object.
 *
 * @template InputObject - The type of the input object.
 * @template FormatObject - The type of the format object mapping keys to formatter functions.
 * @param input - The object whose properties are to be formatted.
 * @param format - An object containing formatter functions for each key.
 * @returns A Promise resolving to the formatted object with all promises unwrapped.
 */
export async function recordFormat<
  InputObject extends Record<PropertyKey, unknown>,
  FormatObject extends Format<InputObject>
> (
  input: InputObject,
  format: FormatObject
): Promise<Formatted<FormatObject>> {
  const result: Partial<Formatted<FormatObject>> = {}
  for (const key in format) {
    // eslint-disable-next-line prefer-object-has-own
    if (!Object.prototype.hasOwnProperty.call(format, key)) continue;
    const formatter = format[key]
    if (formatter === undefined) continue
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any
    result[key] = await formatter(input[key]) as any
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- result was populated with a formatted value for every key of format in the loop above
  return result as Formatted<FormatObject>
}
