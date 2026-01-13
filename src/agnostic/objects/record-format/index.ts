/**
 * A key of the input object or a string.
 */
export type FormatKey<Input extends {} = any> = keyof Input | string
/**
 * The value type of a given key in the input object, or `undefined` if the key does not exist.
 */
export type InputValue<Input extends {}, Key extends FormatKey<Input>> = Input extends Record<Key, infer V> ? V : undefined
/**
 * A function that transforms a value of type I into type O, can return a Promise.
 */
export type FormatterFunc<I, O> = (val: I) => O | Promise<O>
/**
 * An object mapping keys to formatter functions.
 */
export type Format<Input extends {} = any> = { [Key in FormatKey<Input>]: FormatterFunc<InputValue<Input, Key>, any> }
/**
 * Utility type that extracts the resolved type of a Promise, or returns the type itself if not a Promise.
 */
export type UnwrapPromise<PromiseOrNot> = PromiseOrNot extends Promise<infer Resolved> ? Resolved : PromiseOrNot
/**
 * The object type resulting from applying all formatters and unwrapping any Promises.
 */
export type Formatted<F extends Format<{}>> = { [Key in keyof F]: UnwrapPromise<ReturnType<F[Key]>> }

/**
 * Applies a set of formatter functions to the corresponding properties of an input object.
 *
 * @template I - Input object type.
 * @template F - Format object type mapping keys to formatter functions.
 * @param {I} input - The object to format.
 * @param {F} format - An object of formatter functions for each key.
 * @returns {Promise<Formatted<F>>} A Promise resolving to the formatted object with all promises unwrapped.
 */
export async function recordFormat<
  I extends {},
  F extends Format<I>
> (
  input: I,
  format: F
): Promise<Formatted<F>> {
  const result: Partial<Formatted<F>> = {}
  for (const key in format) {
    const formatter = format[key]
    if (typeof formatter === 'function') { result[key] = await formatter((input as any)[key as any]) }
    else { result[key] = formatter }
  }
  return result as Formatted<F>
}
