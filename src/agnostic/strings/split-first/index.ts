/**
 * Splits a string at the first occurrence of a separator, keeping the rest intact.
 *
 * `String.prototype.split` cannot do this: without a limit it splits everywhere, and
 * with one it discards what follows instead of returning it.
 *
 * @param value - The string to split.
 * @param separator - The separator to split at, on its first occurrence.
 * @returns The part before the separator, and the part after it — `undefined` when the
 * separator is absent, which is how « no separator » differs from « nothing after it ».
 *
 * @example
 * splitFirst('jump-to:00:30', ':')
 * // => ['jump-to', '00:30']
 *
 * @example
 * splitFirst('play', ':')
 * // => ['play', undefined]
 *
 * @example
 * splitFirst('play:', ':')
 * // => ['play', '']
 */
export function splitFirst (value: string, separator: string): [string, string | undefined] {
  const index = value.indexOf(separator)
  if (index === -1) return [value, undefined]
  return [value.slice(0, index), value.slice(index + separator.length)]
}
