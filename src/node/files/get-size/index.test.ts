import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { promises as fs } from 'node:fs'
import { pathToFileURL } from 'node:url'
import os from 'node:os'
import path from 'node:path'
import { getSize } from './index.js'
import { seconds } from '../../../agnostic/time/duration/index.js'

// Fixtures (all under the OS temp dir):
//   root/         a.txt (10) + sub/b.txt (5) + sub/empty/
//   wideRoot/     60 x 1-byte files (exercises concurrency)
//   linkRoot/     target.txt (7) + link -> target.txt (symlink to file)
//   cycleRoot/    self -> cycleRoot (symlink cycle to its own dir)
//   hlRoot/       original.txt (9) + hard.txt (hard link to original.txt)
let root: string
let wideRoot: string
let linkRoot: string
let cycleRoot: string
let hlRoot: string
const aBytes = 10
const bBytes = 5
const wideFileCount = 60
const targetBytes = 7
const hardBytes = 9

beforeAll(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'lm-get-size-'))
  await fs.writeFile(path.join(root, 'a.txt'), 'x'.repeat(aBytes))
  await fs.mkdir(path.join(root, 'sub'))
  await fs.writeFile(path.join(root, 'sub', 'b.txt'), 'y'.repeat(bBytes))
  await fs.mkdir(path.join(root, 'sub', 'empty'))

  wideRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'lm-get-size-wide-'))
  await Promise.all(
    [...Array<number>(wideFileCount)].map(async (_, i) =>
      await fs.writeFile(path.join(wideRoot, `f${i}.txt`), 'z'))
  )

  linkRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'lm-get-size-link-'))
  await fs.writeFile(path.join(linkRoot, 'target.txt'), 't'.repeat(targetBytes))
  await fs.symlink(path.join(linkRoot, 'target.txt'), path.join(linkRoot, 'link'))

  cycleRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'lm-get-size-cycle-'))
  await fs.symlink(cycleRoot, path.join(cycleRoot, 'self'))

  hlRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'lm-get-size-hl-'))
  await fs.writeFile(path.join(hlRoot, 'original.txt'), 'h'.repeat(hardBytes))
  await fs.link(path.join(hlRoot, 'original.txt'), path.join(hlRoot, 'hard.txt'))
})

afterAll(async () => {
  await Promise.all(
    [root, wideRoot, linkRoot, cycleRoot, hlRoot].map(async dir =>
      await fs.rm(dir, { recursive: true, force: true }))
  )
})

describe('getSize', () => {
  it('returns the size of a single file', async () => {
    expect(await getSize(path.join(root, 'a.txt'))).toBe(aBytes)
  })

  it('sums the sizes of a directory recursively', async () => {
    expect(await getSize(root)).toBe(aBytes + bBytes)
  })

  it('returns the size of a nested directory', async () => {
    expect(await getSize(path.join(root, 'sub'))).toBe(bBytes)
  })

  it('returns 0 for an empty directory', async () => {
    expect(await getSize(path.join(root, 'sub', 'empty'))).toBe(0)
  })

  describe('PathLike variants', () => {
    it('accepts a Buffer path', async () => {
      expect(await getSize(Buffer.from(path.join(root, 'a.txt')))).toBe(aBytes)
    })

    it('accepts a file: URL', async () => {
      expect(await getSize(pathToFileURL(root))).toBe(aBytes + bBytes)
    })
  })

  it('rejects when the path does not exist', async () => {
    await expect(getSize(path.join(root, 'does-not-exist'))).rejects.toThrow()
  })

  describe('concurrency', () => {
    it('computes the same total with concurrency: 1', async () => {
      expect(await getSize(root, { concurrency: 1 })).toBe(aBytes + bBytes)
    })

    it('handles a wide directory under a low concurrency', async () => {
      expect(await getSize(wideRoot, { concurrency: 4 })).toBe(wideFileCount)
    })
  })

  describe('onError', () => {
    it("counts a missing path as 0 when onError is 'skip'", async () => {
      expect(await getSize(path.join(root, 'nope'), { onError: 'skip' })).toBe(0)
    })

    it('invokes the onError callback and skips the entry', async () => {
      const seen: string[] = []
      const size = await getSize(path.join(root, 'nope'), {
        onError: (_error, failedPath) => { seen.push(failedPath) }
      })
      expect(size).toBe(0)
      expect(seen).toHaveLength(1)
      expect(seen[0]).toBe(path.join(root, 'nope'))
    })
  })

  describe('signal', () => {
    it('rejects when the signal is already aborted', async () => {
      await expect(getSize(root, { signal: AbortSignal.abort() })).rejects.toThrow()
    })
  })

  describe('maxDepth', () => {
    it('counts only the first level with maxDepth: 1', async () => {
      // a.txt (depth 1) counted; sub/ is a dir at depth 1, not descended.
      expect(await getSize(root, { maxDepth: 1 })).toBe(aBytes)
    })

    it('descends one more level with maxDepth: 2', async () => {
      expect(await getSize(root, { maxDepth: 2 })).toBe(aBytes + bBytes)
    })
  })

  describe('followSymlinks', () => {
    it('does not follow links by default (link counts as its own size)', async () => {
      // target.txt (7) + the link's own (non-zero) size.
      expect(await getSize(linkRoot)).toBeGreaterThan(targetBytes)
    })

    it('follows links and dedupes the shared target', async () => {
      // The link resolves to target.txt, so the shared inode is counted once.
      expect(await getSize(linkRoot, { followSymlinks: true })).toBe(targetBytes)
    })

    it('is cycle-safe when a link points back into the tree', async () => {
      expect(await getSize(cycleRoot, { followSymlinks: true })).toBe(0)
    })
  })

  describe('dedupeHardlinks', () => {
    it('counts each hard link separately by default', async () => {
      expect(await getSize(hlRoot)).toBe(hardBytes * 2)
    })

    it('counts a shared inode once when dedupeHardlinks is set', async () => {
      expect(await getSize(hlRoot, { dedupeHardlinks: true })).toBe(hardBytes)
    })
  })

  describe('sizeOf', () => {
    it("'allocated' is at least the apparent content size", async () => {
      const content = await getSize(root)
      const allocated = await getSize(root, { sizeOf: 'allocated' })
      expect(allocated).toBeGreaterThanOrEqual(content)
    })
  })

  describe('timeoutMs', () => {
    it('completes normally within a generous timeout (number)', async () => {
      expect(await getSize(root, { timeoutMs: 10_000 })).toBe(aBytes + bBytes)
    })

    it('accepts a Duration', async () => {
      expect(await getSize(root, { timeoutMs: seconds(10) })).toBe(aBytes + bBytes)
    })

    it('still honours an already-aborted signal when combined with a timeout', async () => {
      await expect(
        getSize(root, { timeoutMs: 10_000, signal: AbortSignal.abort() })
      ).rejects.toThrow()
    })
  })
})
