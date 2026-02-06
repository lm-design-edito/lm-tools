/**
 * Converts a string to an alphanumeric-only string.
 *
 * Non-alphanumeric characters are replaced with the provided `replacer`.
 * Consecutive occurrences of the `replacer` are collapsed into a single instance.
 *
 * @param string - The input string to sanitize.
 * @param replacer - The string to replace non-alphanumeric characters with. Defaults to empty string.
 * @returns The sanitized alphanumeric string.
 *
 * @example
 * toAlphanum("Hello, World!")
 * // => "HelloWorld"
 *
 * @example
 * toAlphanum("Hello, World!", "-")
 * // => "Hello-World"
 */
export function toAlphanum (string: string, replacer: string = ''): string {
  const replaced = string.replace(/[^a-z0-9]/igm, replacer)
  if (replacer.length === 0) return replaced
  return replaced.replace(new RegExp(`${replacer}+`, 'igm'), replacer)
}
