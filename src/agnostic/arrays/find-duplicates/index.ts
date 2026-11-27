// [WIP] could provide an equality check optional function for checking mor complex objects

/**
 * Finds duplicate elements in an array.
 *
 * @param arr - The array to search for duplicates.
 * @param [stopAtFirst=false] - If `true`, returns immediately after finding the first duplicate.
 * @returns An array of duplicate elements found in the input array.
 */
export function findDuplicates<T> (arr: T[], stopAtFirst = false): T[] {
  const seen = new Set<T>()
  const duplicates = new Set<T>()
  for (const item of arr) {
    if (seen.has(item) && stopAtFirst) return [item]
    if (seen.has(item)) duplicates.add(item)
    seen.add(item)
  }
  return Array.from(duplicates)
}

/**
 * Finds the positions of duplicate elements in an array.
 *
 * @param arr - The array to search for duplicates positions.
 * @returns An array of the positions of duplicate elements found in the input array.
 */
export function findDuplicatesPositions (arr: unknown[]): number[] {
  const seen = new Set()
  const duplicatesPos: number[] = []
  arr.forEach((item, pos) => {
    if (seen.has(item)) duplicatesPos.push(pos)
    else seen.add(item)
  })
  return duplicatesPos
}
