/**
 * Picks a random element from an array, optionally excluding certain elements.
 *
 * @param arr - The array to pick from.
 * @param [exclude] - Array of elements to exclude from selection.
 * @returns A randomly selected element from the array.
 * @throws Throws an error if no elements are available after exclusions.
 */
export function randomPick<T> (arr: T[], exclude: T[] = []): T {
  const filteredArr = [...arr].filter(elt => !exclude.includes(elt))
  const length = filteredArr.length
  if (length === 0) throw new Error('Array length must be at least 1 after exclusion')
  const pos = Math.floor(Math.random() * length)
  const found = filteredArr[pos] as T
  return found
}

/**
 * Picks multiple random elements from an array without replacement.
 *
 * Each picked element is removed from the pool before the next selection, ensuring
 * no duplicates in the result.
 *
 * @param howMuch - Number of elements to pick.
 * @param arr - The array to pick from.
 * @param [exclude] - Array of elements to exclude from selection.
 * @returns An array of randomly selected elements.
 * @throws Throws an error if not enough elements are available after exclusions.
 */
export function randomPickMany<T> (
  howMuch: number,
  arr: T[],
  exclude: T[] = []
): T[] {
  const grindedArr = [...arr]
  const pickedSelection: T[] = []
  for (let i = 0; i < howMuch; i++) {
    const picked = randomPick(grindedArr, exclude)
    const indexOfPicked = grindedArr.indexOf(picked)
    grindedArr.splice(indexOfPicked, 1)
    pickedSelection.push(picked)
  }
  return pickedSelection
}
