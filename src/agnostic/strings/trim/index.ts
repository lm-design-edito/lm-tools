/**
 * Removes all leading whitespace characters from a string.
 *
 * @param string - The string to trim.
 * @returns The input string without leading whitespace.
 *
 * @example
 * trimStart("   hello") // => "hello"
 */
export function trimStart (string: string) {
  return string.replace(/^\s*/, '')
}

/**
 * Removes all trailing whitespace characters from a string.
 *
 * @param string - The string to trim.
 * @returns The input string without trailing whitespace.
 *
 * @example
 * trimEnd("hello   ") // => "hello"
 */
export function trimEnd (string: string) {
  return string.replace(/\s*$/, '')
}
