import { describe, it, expect } from 'vitest'
import { sanitizePath } from './index.js'

describe('sanitizePath', () => {
  it('sanitizes each segment and removes empty/.. segments', () => {
    const input = '/some//../unsafe/..//path/ fi?le.txt'
    const result = sanitizePath(input)
    expect(result).toBe('/some/unsafe/path/file.txt')
  })

  it('returns null for an empty or fully-invalid path', () => {
    expect(sanitizePath('')).toBeNull()
    expect(sanitizePath('/../..///')).toBeNull()
  })

  it('ensures the returned path starts with a leading slash', () => {
    const input = 'relative/path.txt'
    const result = sanitizePath(input)
    expect(result?.startsWith('/')).toBe(true)
  })
})
