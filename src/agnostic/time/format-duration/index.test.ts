import { describe, it, expect } from 'vitest'
import { formatDuration } from './index.js'

describe('formatDuration', () => {
  it('fills a padded hours, minutes and seconds pattern', () => {
    expect(formatDuration(3723456, 'hh:mm:ss')).toBe('01:02:03')
  })

  it('renders each field as a remainder of the one above it', () => {
    // One hour and a half: the minutes field reads 30, never 90.
    expect(formatDuration(5400000, 'hh:mm:ss')).toBe('01:30:00')
  })

  it('pads the milliseconds to three digits', () => {
    expect(formatDuration(3723456, 'mm:ss:ms')).toBe('02:03:456')
  })

  it('drops the padding on the single-letter tokens', () => {
    expect(formatDuration(3723456, 'h:m:s')).toBe('1:2:3')
  })

  it('derives frames from the frame rate', () => {
    expect(formatDuration(1500, 'ss:frame')).toBe('01:12')
    expect(formatDuration(1500, 'ss:frame', 50)).toBe('01:25')
  })

  it('leaves punctuation separators untouched', () => {
    expect(formatDuration(61000, 'mm — ss')).toBe('01 — 01')
  })

  it('substitutes single-letter tokens even inside words', () => {
    // 'h', 'm', 's' and 'f' are tokens wherever they sit: the format is a token
    // pattern, not a template one can write prose in.
    expect(formatDuration(61000, 'mm min ss')).toBe('01 1in 01')
  })

  describe('edge cases', () => {
    it('renders a zero duration', () => {
      expect(formatDuration(0, 'hh:mm:ss:ms')).toBe('00:00:00:000')
    })

    it('lets the hours grow past two digits', () => {
      expect(formatDuration(360000000, 'hh:mm')).toBe('100:00')
    })

    it('loses the hours when the pattern omits them', () => {
      expect(formatDuration(3723456, 'mm:ss')).toBe('02:03')
    })
  })
})
