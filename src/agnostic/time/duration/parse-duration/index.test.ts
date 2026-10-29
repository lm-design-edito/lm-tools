import { describe, it, expect } from 'vitest'
import { parseDuration } from './index.js'

describe('parseDuration', () => {
  describe('a bare number', () => {
    it('reads as milliseconds', () => { expect(parseDuration('500')).toBe(500) })
    it('keeps a negative value, for a caller that counts from the end', () => {
      expect(parseDuration('-1')).toBe(-1)
    })
    it('takes a decimal', () => { expect(parseDuration('12.5')).toBe(12.5) })
  })

  describe('suffixes', () => {
    it('reads milliseconds', () => { expect(parseDuration('500ms')).toBe(500) })
    it('reads seconds under both aliases', () => {
      expect(parseDuration('12s')).toBe(12000)
      expect(parseDuration('12sec')).toBe(12000)
    })
    it('reads a decimal number of minutes', () => { expect(parseDuration('1.2min')).toBe(72000) })
    it('reads hours, days and weeks', () => {
      expect(parseDuration('3h')).toBe(10800000)
      expect(parseDuration('1d')).toBe(86400000)
      expect(parseDuration('1w')).toBe(604800000)
    })
    it('tries the longest suffix first, so ms is never read as minutes', () => {
      expect(parseDuration('1ms')).toBe(1)
      expect(parseDuration('1m')).toBe(60000)
    })
    it('tells minutes from months by case alone', () => {
      expect(parseDuration('1m')).toBe(60000)
      expect(parseDuration('1M')).toBe(2592000000)
    })
    it('reads the three month aliases alike', () => {
      expect(parseDuration('2mo')).toBe(5184000000)
      expect(parseDuration('2mth')).toBe(5184000000)
      expect(parseDuration('2M')).toBe(5184000000)
    })
    it('reads years, a flat 365 days each', () => { expect(parseDuration('1y')).toBe(31536000000) })
  })

  describe('what it refuses', () => {
    it('refuses an exponent or a hexadecimal, which no article means to write', () => {
      expect(parseDuration('1e3')).toBeNull()
      expect(parseDuration('0x10')).toBeNull()
    })
    it('refuses an unknown unit', () => { expect(parseDuration('456f')).toBeNull() })
    it('refuses a suffix with no value', () => { expect(parseDuration('min')).toBeNull() })
    it('refuses an empty string', () => { expect(parseDuration('')).toBeNull() })
    it('refuses a value with an inner space', () => { expect(parseDuration('1.2 min')).toBeNull() })
    it('ignores surrounding whitespace', () => { expect(parseDuration(' 12s ')).toBe(12000) })
  })
})
