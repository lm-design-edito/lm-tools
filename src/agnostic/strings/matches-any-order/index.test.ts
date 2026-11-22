import { describe, it, expect } from 'vitest'
import { matchesAnyOrder } from './index.js'

describe('matchesAnyOrder', () => {
  it('matches when every character is present, regardless of order', () => {
    expect(matchesAnyOrder('draft fox', 'drxf')).toBe(true)
  })

  it('matches the same characters given out of order', () => {
    expect(matchesAnyOrder('draft fox', 'fxrd')).toBe(true)
  })

  it('does not match a character the candidate never has', () => {
    expect(matchesAnyOrder('draft fox', 'drxz')).toBe(false)
  })

  it('matches anything when the query is empty', () => {
    expect(matchesAnyOrder('draft fox', '')).toBe(true)
  })

  it('is case sensitive — folding case is the caller\'s job', () => {
    expect(matchesAnyOrder('Draft Fox', 'drxf')).toBe(false)
  })

  describe('repetition', () => {
    it('matches a repeated character present the same number of times', () => {
      expect(matchesAnyOrder('class', 'ss')).toBe(true)
    })

    it('does not match a repeated character asked for more times than it occurs', () => {
      expect(matchesAnyOrder('class', 'sss')).toBe(false)
    })
  })
})
