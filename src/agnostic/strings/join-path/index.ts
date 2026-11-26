/**
 * Joins path segments with a single `/`, resolving `.` and `..`.
 *
 * Repeated and trailing slashes collapse, and a `..` above an absolute root is ignored
 * rather than escaping it.
 *
 * @param segments - The segments to join, each possibly holding several `/`.
 * @returns The joined path, `''` when nothing is left of it.
 *
 * @example
 * joinPath('a/b/', '/c/../d')
 * // => 'a/b/d'
 */
export function joinPath (...segments: string[]): string {
  const isAbsolute = segments[0]?.startsWith('/') === true
  const parts = segments
    .flatMap(segment => segment.split('/'))
    .filter(part => part !== '' && part !== '.')
  const resolved: string[] = []
  for (const part of parts) {
    if (part !== '..') {
      resolved.push(part)
      continue
    }
    const last = resolved.at(-1)
    if (last !== undefined && last !== '..') {
      resolved.pop()
      continue
    }
    if (!isAbsolute) { resolved.push(part) }
  }
  return `${isAbsolute ? '/' : ''}${resolved.join('/')}`
}
