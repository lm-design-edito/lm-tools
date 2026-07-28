/**
 * Regular expression pattern for validating CSS class names.
 * Matches class names that start with an optional hyphen, followed by a letter or underscore,
 * then any combination of letters, numbers, underscores, or hyphens.
 */
export const classNameRegex = /^-?[_a-zA-Z]+[_a-zA-Z0-9\-]*$/v

/**
 * Checks if a string is a valid CSS class name.
 *
 * @param string - The string to validate.
 * @returns True if the string is a valid CSS class name, false otherwise.
 */
export function isValidClassName (string: string): boolean {
  return classNameRegex.test(string)
}
