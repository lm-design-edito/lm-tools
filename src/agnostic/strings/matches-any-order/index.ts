/**
 * Whether every character `query` names is somewhere in `candidate`, order dropped
 * entirely — `drxf` finding anything holding a d, an r, an x and an f, in any order.
 *
 * @param candidate - The string being searched.
 * @param query - The characters to find, regardless of order. An empty query always
 * matches.
 * @returns `true` if `candidate` holds every character `query` names.
 *
 * @remarks
 * A repeated character in `query` needs the same repetition in `candidate`: `ss` does
 * not match a candidate holding one lone `s`. Each character in `query` consumes one
 * occurrence in `candidate`, so it can't be matched twice over.
 *
 * @example
 * matchesAnyOrder('draft fox', 'drxf')
 * // => true
 *
 * @example
 * matchesAnyOrder('class', 'ss')
 * // => true
 *
 * @example
 * matchesAnyOrder('class', 'sss')
 * // => false — only two `s` to give
 */
export function matchesAnyOrder (candidate: string, query: string): boolean {
  // Matched one code point at a time: a candidate built of complex grapheme clusters is
  // already outside what this function is for.
  // eslint-disable-next-line @typescript-eslint/no-misused-spread
  const pool = [...candidate]
  for (const character of query) {
    const found = pool.indexOf(character)
    if (found === -1) return false
    pool.splice(found, 1)
  }
  return true
}
