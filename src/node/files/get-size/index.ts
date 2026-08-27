import { type PathLike, type Stats, promises as fs } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

/**
 * How to react to a per-entry read error (a failing `lstat`/`readdir`):
 * - `'throw'`: reject the whole computation (default).
 * - `'skip'`: count the offending entry as 0 bytes and keep going.
 * - a function: called with the error and the offending path, then the entry
 *   counts as 0 bytes.
 */
export type OnError = 'throw' | 'skip' | ((error: unknown, path: string) => void)

export type GetSizeOptions = {
  /** Maximum number of concurrent filesystem reads. Bounds file-descriptor usage on large trees. @default 32 */
  concurrency?: number
  /** How to handle a per-entry read error. @default 'throw' */
  onError?: OnError
  /** Abort the traversal; aborting rejects with the signal's reason. */
  signal?: AbortSignal
  /** Maximum directory depth to descend; entries deeper than this are not counted. @default Infinity */
  maxDepth?: number
  /** Follow symbolic links instead of counting the link itself. Cycle-safe via inode tracking. @default false */
  followSymlinks?: boolean
  /** Count a file reached through several hard links only once. @default false */
  dedupeHardlinks?: boolean
  /** `'content'` = apparent size (`stat.size`); `'allocated'` = on-disk blocks (`stat.blocks × 512`). @default 'content' */
  sizeOf?: 'content' | 'allocated'
}

export const defaultGetSizeOptions = {
  concurrency: 32,
  onError: 'throw',
  maxDepth: Infinity,
  followSymlinks: false,
  dedupeHardlinks: false,
  sizeOf: 'content'
} satisfies Omit<GetSizeOptions, 'signal'>

type ResolvedOptions = {
  onError: OnError
  signal: AbortSignal | undefined
  limit: <T>(fn: () => Promise<T>) => Promise<T>
  maxDepth: number
  followSymlinks: boolean
  dedupeHardlinks: boolean
  sizeOf: 'content' | 'allocated'
  visited: Set<string>
}

/**
 * Computes the total size, in bytes, of a file or directory.
 *
 * For a regular file, returns its own size. For a directory, returns the summed
 * size of everything it contains, recursively.
 *
 * @param target - Path to a file or directory (`string`, `Buffer`, or a `file:` URL).
 * @param [options] - Optional configuration. See `GetSizeOptions`.
 * @returns The total size in bytes.
 *
 * @remarks
 * By default symbolic links are not followed (each link counts as its own small
 * size) and hard links are counted once per link. Enable `followSymlinks` to
 * resolve links — cycles and repeated targets are made safe by tracking visited
 * inodes — and `dedupeHardlinks` to count a shared inode only once.
 *
 * @throws If a path cannot be read and `onError` is `'throw'` (the default), or if
 * `options.signal` is aborted.
 */
export async function getSize (target: PathLike, options: GetSizeOptions = {}): Promise<number> {
  const concurrency = Math.max(1, Math.floor(options.concurrency ?? defaultGetSizeOptions.concurrency))
  const resolved: ResolvedOptions = {
    onError: options.onError ?? defaultGetSizeOptions.onError,
    signal: options.signal,
    limit: createLimiter(concurrency),
    maxDepth: options.maxDepth ?? defaultGetSizeOptions.maxDepth,
    followSymlinks: options.followSymlinks ?? defaultGetSizeOptions.followSymlinks,
    dedupeHardlinks: options.dedupeHardlinks ?? defaultGetSizeOptions.dedupeHardlinks,
    sizeOf: options.sizeOf ?? defaultGetSizeOptions.sizeOf,
    visited: new Set<string>()
  }
  return await computeSize(toPathString(target), resolved, 0)
}

function toPathString (target: PathLike): string {
  if (typeof target === 'string') return target
  if (Buffer.isBuffer(target)) return target.toString('utf-8')
  return fileURLToPath(target)
}

function measure (stats: Stats, options: ResolvedOptions): number {
  return options.sizeOf === 'allocated' ? stats.blocks * 512 : stats.size
}

async function computeSize (target: string, options: ResolvedOptions, depth: number): Promise<number> {
  options.signal?.throwIfAborted()

  let stats: Stats
  try {
    stats = await options.limit(async () => await fs.lstat(target))
  } catch (error) {
    return handleError(error, target, options)
  }

  // Resolve symlinks when asked; otherwise a link counts as its own size.
  let realTarget = target
  if (stats.isSymbolicLink()) {
    if (!options.followSymlinks) return measure(stats, options)
    try {
      stats = await options.limit(async () => await fs.stat(target))
      if (stats.isDirectory()) realTarget = await options.limit(async () => await fs.realpath(target))
    } catch (error) {
      return handleError(error, target, options)
    }
  }

  // Count each physical inode once when following links (cycle safety) or
  // deduping hard links.
  if (options.followSymlinks || options.dedupeHardlinks) {
    const key = `${stats.dev}:${stats.ino}`
    if (options.visited.has(key)) return 0
    options.visited.add(key)
  }

  if (!stats.isDirectory()) return measure(stats, options)
  if (depth >= options.maxDepth) return 0

  let children: string[]
  try {
    children = await options.limit(async () => await fs.readdir(realTarget))
  } catch (error) {
    return handleError(error, realTarget, options)
  }
  const childSizes = await Promise.all(
    children.map(async child => await computeSize(path.join(realTarget, child), options, depth + 1))
  )
  return childSizes.reduce((total, size) => total + size, 0)
}

function handleError (error: unknown, target: string, options: ResolvedOptions): number {
  if (options.onError === 'throw') throw error
  if (typeof options.onError === 'function') options.onError(error, target)
  return 0
}

// Global concurrency limiter: at most `max` wrapped calls run at once. Wrapped
// calls must be leaf operations (single fs syscalls) that never await another
// wrapped call, so the recursive traversal cannot deadlock on slots.
function createLimiter (max: number): <T>(fn: () => Promise<T>) => Promise<T> {
  let active = 0
  const waiters: Array<() => void> = []
  const acquire = async (): Promise<void> => {
    if (active < max) {
      active += 1
      return
    }
    // Resumed by `release`, which hands over the slot without decrementing.
    await new Promise<void>(resolve => { waiters.push(resolve) })
  }
  const release = (): void => {
    const resume = waiters.shift()
    if (resume !== undefined) resume()
    else active -= 1
  }
  return async function limit<T> (fn: () => Promise<T>): Promise<T> {
    await acquire()
    try {
      return await fn()
    } finally {
      release()
    }
  }
}
