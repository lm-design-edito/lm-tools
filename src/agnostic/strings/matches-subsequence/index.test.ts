import { describe, it, expect } from 'vitest'
import { matchesSubsequence } from './index.js'

describe('matchesSubsequence', () => {
  it('matches when every character is found in order, with gaps between them', () => {
    expect(matchesSubsequence('six feet under', 'sfu')).toBe(true)
  })

  it('matches a query equal to the candidate', () => {
    expect(matchesSubsequence('sfu', 'sfu')).toBe(true)
  })

  it('does not match when the characters are out of order', () => {
    expect(matchesSubsequence('six feet under', 'ufs')).toBe(false)
  })

  it('does not match a character the candidate never has', () => {
    expect(matchesSubsequence('six feet under', 'sfz')).toBe(false)
  })

  it('is case sensitive — folding case is the caller\'s job', () => {
    expect(matchesSubsequence('Six Feet Under', 'sfu')).toBe(false)
  })

  it('matches anything when the query is empty', () => {
    expect(matchesSubsequence('six feet under', '')).toBe(true)
  })

  it('does not match a query longer than what the candidate can supply in order', () => {
    expect(matchesSubsequence('sf', 'sfu')).toBe(false)
  })

  it('requires the same repeated character to recur in the candidate', () => {
    expect(matchesSubsequence('seft', 'ss')).toBe(false)
  })
})
