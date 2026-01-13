/**
 * Checks if a value is of type "object", including `null`.
 *
 * @param {unknown} unk - The value to check.
 * @returns {unk is object | null} `true` if the value is an object or `null`, otherwise `false`.
 */
export function isObject (unk: unknown): unk is object | null {
  return typeof unk === 'object'
}

/**
 * Checks if a value is a non-null object.
 *
 * @param {unknown} unk - The value to check.
 * @returns {unk is object} `true` if the value is a non-null object, otherwise `false`.
 */
export function isNonNullObject (unk: unknown): unk is object {
  return unk !== null && isObject(unk)
}
