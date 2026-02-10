/**
 * Returns a new object with the keys sorted according to the provided sorter.
 *
 * @template T - The type of the input object.
 * @param {T} obj - The object whose keys should be sorted.
 * @param {(a: keyof T, b: keyof T) => number} [sorter] - Optional function used to compare keys for sorting. Defaults to alphabetical order.
 * @returns {{ [K in keyof T]: T[K] }} A new object with the same keys and values as the input, but sorted by key.
 */
export function sortKeys<T extends Record<string, unknown>> (
  obj: T,
  sorter: (a: keyof T, b: keyof T) => number = (a, b) => String(a).localeCompare(String(b))
): { [K in keyof T]: T[K] } {
  const out: Partial<{ [K in keyof T]: T[K] }> = {}
  const keys = Object.keys(obj) as Array<keyof T>
  for (const key of keys.sort(sorter)) { out[key] = obj[key] }
  return out as { [K in keyof T]: T[K] }
}
