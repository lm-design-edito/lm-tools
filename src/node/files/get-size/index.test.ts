import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { promises as fs } from 'node:fs'
import { pathToFileURL } from 'node:url'
import os from 'node:os'
import path from 'node:path'
import { getSize } from './index.js'

// A temp tree with known byte sizes:
//   root/
//     a.txt          (10 bytes)
//     sub/
//       b.txt        (5 bytes)
//       empty/       (0 bytes)
let root: string
const aBytes = 10
const bBytes = 5

beforeAll(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'lm-get-size-'))
  await fs.writeFile(path.join(root, 'a.txt'), 'x'.repeat(aBytes))
  await fs.mkdir(path.join(root, 'sub'))
  await fs.writeFile(path.join(root, 'sub', 'b.txt'), 'y'.repeat(bBytes))
  await fs.mkdir(path.join(root, 'sub', 'empty'))
})

afterAll(async () => {
  await fs.rm(root, { recursive: true, force: true })
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
})
