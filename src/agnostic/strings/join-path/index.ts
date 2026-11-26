/**
 * Joins path segments with a single `/`, resolving `.` and `..` as it goes.
 *
 * Works on strings alone, with no filesystem knowledge, so it runs in a browser where
 * Node's `path.join` cannot. Empty segments and repeated slashes collapse; a trailing
 * slash is dropped. The result is absolute when the first segment starts with `/`, and
 * a `..` that would climb above an absolute root is ignored rather than escaping it.
 *
 * @param segments - The segments to join, each possibly holding several `/`.
 * @returns The joined path, `''` when nothing is left of it.
 *
 * @example
 * joinPath('/var', 'www', 'html')
 * // => '/var/www/html'
 *
 * @example
 * joinPath('a/b/', '/c/../d')
 * // => 'a/b/d'
 *
 * @example
 * joinPath('..', 'sibling')
 * // => '../sibling'
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
