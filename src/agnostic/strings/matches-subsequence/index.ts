/**
 * Whether every character of `query` is found in `candidate`, in order, with anything
 * allowed in between — the fuzzy-finder match behind `sfu` finding `Six Feet Under`.
 *
 * @param candidate - The string being searched.
 * @param query - The characters to find, in order. An empty query always matches.
 * @returns `true` if `candidate` contains `query` as a subsequence.
 *
 * @example
 * matchesSubsequence('Six Feet Under', 'sfu')
 * // => false — case differs, this does not fold it
 *
 * @example
 * matchesSubsequence('six feet under', 'sfu')
 * // => true
 *
 * @example
 * matchesSubsequence('six feet under', 'ufs')
 * // => false — same characters, wrong order
 */
export function matchesSubsequence (candidate: string, query: string): boolean {
  let position = 0
  for (const character of candidate) {
    if (position >= query.length) break
    if (character === query[position]) position += 1
  }
  return position === query.length
}
