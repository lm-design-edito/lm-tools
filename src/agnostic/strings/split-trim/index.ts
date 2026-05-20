/**
 * Splits a string into segments, trims whitespace from each part, and optionally removes empty segments.
 *
 * Each segment is trimmed with `String.prototype.trim`. When `removeEmpty` is `true`, segments that
 * become empty after trimming are filtered out.
 *
 * When `splitter` is an array, each separator is applied in order: every current segment is split
 * with the next separator before moving on to the following one.
 *
 * @param toSplit - The string to split.
 * @param splitter - A single separator, or an ordered list of separators passed to `String.prototype.split`.
 * @param removeEmpty - When `true`, drops segments that are empty after trimming. Defaults to `false`.
 * @returns An array of trimmed string segments.
 *
 * @example
 * splitTrim(' foo , bar , baz ', ',')
 * // => ['foo', 'bar', 'baz']
 *
 * @example
 * splitTrim('foo,,bar', ',', true)
 * // => ['foo', 'bar']
 *
 * @example
 * splitTrim('foo bar,baz', [' ', ','])
 * // => ['foo', 'bar', 'baz']
 */
export const splitTrim = (
  toSplit: string,
  splitter: string | RegExp | Array<string | RegExp>,
  removeEmpty: boolean = false
): string[] => {
  const splitters = Array.isArray(splitter) ? splitter : [splitter]
  let returned: string[] = [toSplit]
  for (const s of splitters) {
    returned = returned.flatMap(e => e.split(s))
  }
  return returned
    .map(e => e.trim())
    .filter(e => !removeEmpty || e !== '')
}
