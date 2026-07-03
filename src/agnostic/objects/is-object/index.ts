/**
 * Checks if a value is of type "object", including `null`.
 *
 * @param unk - The value to check.
 * @returns `true` if the value is an object or `null`, otherwise `false`.
 */
export function isObject (unk: unknown): unk is object | null {
  return typeof unk === 'object'
}

/**
 * Checks if a value is a non-null object.
 *
 * @param unk - The value to check.
 * @returns `true` if the value is a non-null object, otherwise `false`.
 */
export function isNonNullObject (unk: unknown): unk is object {
  return unk !== null && isObject(unk)
}
