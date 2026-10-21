/**
 * Flattens class name lists into the string an element's `class` attribute takes.
 *
 * @param names - Class names, nested one level deep, with `null`, `undefined` and
 * blank entries allowed.
 * @returns The names that were worth keeping, trimmed and space-separated.
 */
export function mergeClassNames (...names: Array<string | null | undefined | Array<string | null | undefined>>): string {
  return names.map(name => {
    if (typeof name !== 'string' && !Array.isArray(name)) return false
    // An array that yields nothing comes back as `''`, which would survive the filter
    // below and join as an empty segment — a trailing or doubled space in the result.
    if (Array.isArray(name)) {
      const merged = mergeClassNames(...name)
      return merged === '' ? false : merged
    }
    if (name.trim() === '') return false
    return name.trim()
  }).filter((name): name is string => typeof name === 'string')
    .join(' ')
}
