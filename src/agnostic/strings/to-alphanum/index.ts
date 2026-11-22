/**
 * Converts a string to an alphanumeric-only string.
 *
 * Non-alphanumeric characters are replaced with the provided `replacer`.
 * Consecutive occurrences of the `replacer` are collapsed into a single instance.
 * Unicode-aware: a letter stays a letter whatever script or accent it carries — "yé-yé"
 * keeps its "é", only the hyphen goes.
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
 *
 * @example
 * toAlphanum("yé-yé")
 * // => "yéyé"
 */
export function toAlphanum (string: string, replacer = ''): string {
  const replaced = string.replace(/[^\p{L}\p{N}]/igmv, replacer)
  if (replacer.length === 0) return replaced
  return replaced.replace(new RegExp(`${replacer}+`, 'igmv'), replacer)
}
