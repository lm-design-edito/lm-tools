import { type PathLike, promises as fs } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

/**
 * Computes the total size, in bytes, of a file or directory.
 *
 * For a regular file, returns its own size. For a directory, returns the summed
 * size of everything it contains, recursively.
 *
 * @param target - Path to a file or directory (`string`, `Buffer`, or a `file:` URL).
 * @returns The total size in bytes.
 *
 * @remarks
 * Symbolic links are not followed: each link counts as its own (small) size, not
 * that of its target. This keeps the traversal free of cycles and double-counting.
 *
 * @throws If `target` does not exist or cannot be read (e.g. `ENOENT`, `EACCES`).
 */
export async function getSize (target: PathLike): Promise<number> {
  return await computeSize(toPathString(target))
}

function toPathString (target: PathLike): string {
  if (typeof target === 'string') return target
  if (Buffer.isBuffer(target)) return target.toString('utf-8')
  return fileURLToPath(target)
}

async function computeSize (target: string): Promise<number> {
  const stats = await fs.lstat(target)
  if (!stats.isDirectory()) return stats.size
  const children = await fs.readdir(target)
  const childSizes = await Promise.all(
    children.map(async child => await computeSize(path.join(target, child)))
  )
  return childSizes.reduce((total, size) => total + size, 0)
}
