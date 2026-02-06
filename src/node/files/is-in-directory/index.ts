import path from 'node:path'

/**
 * Checks whether a child path is contained within a parent directory.
 *
 * @param childPath  - The path to check if it's within the parent.
 * @param parentPath - The parent directory path.
 * @returns `true` if `childPath` is within `parentPath`, `false` otherwise.
 */
export function isInDirectory (
  childPath: string,
  parentPath: string
): boolean {
  const rel = path.relative(parentPath, childPath)
  return rel !== '' && !rel.startsWith('..')
}
