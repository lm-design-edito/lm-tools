export function mergeClassNames (...names: Array<string | null | undefined>): string {
  return names.map(name => {
    if (typeof name !== 'string') return false
    if (name.trim() === '') return false
    return name.trim()
  })
    .filter((name): name is string => typeof name === 'string')
    .join(' ')
}
