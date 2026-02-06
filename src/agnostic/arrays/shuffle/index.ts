/**
 * Shuffles an array using the Fisher-Yates algorithm.
 *
 * Creates a new array with the same elements in random order. The original array is not modified.
 *
 * @param array - The array to shuffle.
 * @returns A new array with shuffled elements.
 */
export function shuffle <T extends readonly unknown[] | unknown[]> (array: T): Array<T[number]> {
  const shuffled = [...array] as unknown[]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled as Array<T[number]>
}
