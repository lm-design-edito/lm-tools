/**
 * Finds duplicate elements in an array.
 *
 * @param arr - The array to search for duplicates.
 * @param [stopAtFirst=false] - If `true`, returns immediately after finding the first duplicate.
 * @returns An array of duplicate elements found in the input array.
 */
export function findDuplicates<T> (arr: T[], stopAtFirst: boolean = false): T[] {
  const seen = new Set<T>()
  const duplicates = new Set<T>()
  for (const item of arr) {
    if (seen.has(item) && stopAtFirst) return [item]
    if (seen.has(item)) duplicates.add(item)
    seen.add(item)
  }
  return Array.from(duplicates)
}

// [WIP] dedupe ?
