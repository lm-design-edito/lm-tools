/**
 * Returns a copy of the input array, with stripped duplicates
 *
 * @param arr - The array to search for duplicates.
 * @returns The deduped array
 */
export function dedupe<T> (arr: T[]): T[] {
  const deduped = Array.from(new Set<T>(arr))
  return deduped
}
