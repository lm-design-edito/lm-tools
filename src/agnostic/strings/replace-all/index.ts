// [WIP] 1/ this function seem not to work all the time
// [WIP] 2/ this function is obsolete now that String.replaceAll is widely supported

/**
 * Replaces all occurrences of a pattern in a string.
 *
 * **Deprecated:** This function is mostly obsolete now that `String.prototype.replaceAll` is widely supported.
 *
 * @param input - The string to operate on.
 * @param pattern - The string or RegExp pattern to replace.
 * @param replacer - The replacement string or a function that returns a replacement for each match.
 * @returns The resulting string with all matches replaced.
 *
 * @deprecated Use `String.prototype.replaceAll` instead.
 *
 * @example
 * replaceAll('foo bar foo', 'foo', 'baz')
 * // => 'baz bar baz'
 *
 * @example
 * replaceAll('abc 123 abc', /abc/g, match => match.toUpperCase())
 * // => 'ABC 123 ABC'
 */
export function replaceAll (
  input: string,
  pattern: string | RegExp,
  replacer: string | ((substring: string, ...args: any[]) => string)): string {
  console.warn('[DEPRECATED] Use String.replaceAll instead')
  const found = Array.from(input.match(pattern) ?? [])
  const foundReplaced = typeof replacer === 'string'
    ? found.map(() => replacer)
    : found.map(e => replacer(e))
  const splitted = input.split(pattern)
  const replaced = splitted.map((chunk, chunkPos) => {
    const isLast = chunkPos === splitted.length - 1
    if (isLast) return [chunk]
    return [chunk, foundReplaced[chunkPos] ?? '']
  }).flat().join('')
  return replaced
}
