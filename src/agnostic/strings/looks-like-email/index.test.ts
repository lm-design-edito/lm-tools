import { describe, it, expect } from 'vitest'
import { looksLikeEmail } from './index.js'

describe('looksLikeEmail', () => {
  describe('accepting', () => {
    it('accepts a plain address', () => {
      expect(looksLikeEmail('reader@example.com')).toBe(true)
    })

    it('accepts subdomains, plus addressing and unicode', () => {
      expect(looksLikeEmail('reader+tag@mail.example.co.uk')).toBe(true)
      expect(looksLikeEmail('lecteur@éditions.fr')).toBe(true)
    })
  })

  describe('rejecting', () => {
    it('rejects a missing or repeated at sign', () => {
      expect(looksLikeEmail('reader.example.com')).toBe(false)
      expect(looksLikeEmail('reader@@example.com')).toBe(false)
      expect(looksLikeEmail('a@b@example.com')).toBe(false)
    })

    it('rejects a domain with no dot', () => {
      expect(looksLikeEmail('reader@example')).toBe(false)
    })

    it('rejects whitespace, newline included', () => {
      expect(looksLikeEmail('a reader@example.com')).toBe(false)
      expect(looksLikeEmail('not an address\nreader@example.com')).toBe(false)
    })

    it('rejects an empty local part or domain', () => {
      expect(looksLikeEmail('@example.com')).toBe(false)
      expect(looksLikeEmail('reader@')).toBe(false)
      expect(looksLikeEmail('')).toBe(false)
    })
  })
})
