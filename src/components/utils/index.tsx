export function mergeClassNames (...names: Array<string | null | undefined | Array<string | null | undefined>>): string {
  return names.map(name => {
    if (typeof name !== 'string' && !Array.isArray(name)) return false
    if (Array.isArray(name)) return mergeClassNames(...name)
    if (name.trim() === '') return false
    return name.trim()
  })
    .filter((name): name is string => typeof name === 'string')
    .join(' ')
}
