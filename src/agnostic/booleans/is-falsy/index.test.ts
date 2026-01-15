import { describe, it, expect } from 'vitest'
import { isFalsy, isNotFalsy } from './index.js'

describe('booleans/is-falsy', () => {
  it('returns true on all falsy values', () => {
    expect(isFalsy(null)).toBe(true)
    expect(isFalsy(undefined)).toBe(true)
    expect(isFalsy(false)).toBe(true)
    expect(isFalsy('')).toBe(true)
    expect(isFalsy(0)).toBe(true)
    expect(isFalsy(-0)).toBe(true)
    expect(isFalsy(NaN)).toBe(true)
    expect(isFalsy(0n)).toBe(true)
  })
})

describe('booleans/is-not-falsy', () => {
  it('returns false on all falsy values', () => {
    expect(isNotFalsy(null)).toBe(false)
    expect(isNotFalsy(undefined)).toBe(false)
    expect(isNotFalsy(false)).toBe(false)
    expect(isNotFalsy('')).toBe(false)
    expect(isNotFalsy(0)).toBe(false)
    expect(isNotFalsy(-0)).toBe(false)
    expect(isNotFalsy(NaN)).toBe(false)
    expect(isNotFalsy(0n)).toBe(false)
  })
})
