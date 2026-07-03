/**
 * Checks if a value is a plain object with string keys.
 *
 * @param input - The value to check.
 * @returns `true` if the value is an object with string keys, otherwise `false`.
 */
export function isRecord (input: unknown): input is Record<string, unknown> {
  if (typeof input !== 'object' || input === null) return false
  return Object
    .keys(input)
    .every(key => typeof key === 'string')
}
