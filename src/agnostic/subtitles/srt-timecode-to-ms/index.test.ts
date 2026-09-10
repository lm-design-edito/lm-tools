import { describe, it, expect } from 'vitest'
import { srtTimecodeToMs } from './index.js'

describe('srtTimecodeToMs', () => {
  it('adds up hours, minutes, seconds and milliseconds', () => {
    expect(srtTimecodeToMs('01:02:03,004')).toBe(3723004)
  })

  it('sits at zero for the start of a file', () => {
    expect(srtTimecodeToMs('00:00:00,000')).toBe(0)
  })

  describe('the fractional field', () => {
    it('reads a single digit as tenths of a second', () => {
      expect(srtTimecodeToMs('00:00:01,5')).toBe(1500)
    })

    it('reads two digits as hundredths', () => {
      expect(srtTimecodeToMs('00:00:01,05')).toBe(1050)
    })

    it('reads three digits as milliseconds', () => {
      expect(srtTimecodeToMs('00:00:01,005')).toBe(1005)
    })

    it('drops precision the format does not carry', () => {
      expect(srtTimecodeToMs('00:00:01,5009')).toBe(1500)
    })
  })

  it('tolerates surrounding whitespace, as found around an arrow', () => {
    expect(srtTimecodeToMs(' 00:00:02,000 ')).toBe(2000)
  })

  it('accepts hour counts beyond two digits', () => {
    expect(srtTimecodeToMs('100:00:00,000')).toBe(360000000)
  })

  describe('refusing what is not a timecode', () => {
    it('returns null on a dot separator, which SRT does not use', () => {
      expect(srtTimecodeToMs('00:00:01.500')).toBeNull()
    })

    it('returns null on a missing field', () => {
      expect(srtTimecodeToMs('00:01,000')).toBeNull()
    })

    it('returns null on plain text', () => {
      expect(srtTimecodeToMs('Bonjour')).toBeNull()
    })

    it('returns null rather than zero, so a caller can tell the two apart', () => {
      expect(srtTimecodeToMs('')).toBeNull()
    })
  })
})
