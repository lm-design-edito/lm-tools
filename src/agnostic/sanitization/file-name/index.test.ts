import { describe, it, expect } from 'vitest'
import { sanitizeFileName } from './index.js'

describe('sanitizeFileName', () => {
  it('removes invalid characters and trims/condenses spaces', () => {
    const input = '  in*va|lid:file?name  '
    const result = sanitizeFileName(input)
    expect(result).toBe('invalidfilename')
  })

  it('normalizes multiple dots and strips leading/trailing dots', () => {
    const input = '...my...file...name...'
    const result = sanitizeFileName(input)
    expect(result).toBe('my.file.name')
  })

  it('returns null when the result is empty', () => {
    const result = sanitizeFileName(' <>:"/\\\\|?*')
    expect(result).toBeNull()
  })

  it('returns null when exceeding max length', () => {
    const long = 'a'.repeat(10)
    const result = sanitizeFileName(long, 5)
    expect(result).toBeNull()
  })
})
