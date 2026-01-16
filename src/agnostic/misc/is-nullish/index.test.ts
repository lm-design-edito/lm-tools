import { describe, it, expect } from 'vitest'
import { isNullish, isNotNullish } from './index.js'

describe('isNullish', () => {
  it('returns true for null', () => {
    expect(isNullish(null)).toBe(true)
  })

  it('returns true for undefined', () => {
    expect(isNullish(undefined)).toBe(true)
  })

  it('returns false for other falsy values', () => {
    expect(isNullish(false)).toBe(false)
    expect(isNullish(0)).toBe(false)
    expect(isNullish('')).toBe(false)
    expect(isNullish(NaN)).toBe(false)
  })

  it('returns false for truthy values', () => {
    expect(isNullish(true)).toBe(false)
    expect(isNullish(1)).toBe(false)
    expect(isNullish('test')).toBe(false)
    expect(isNullish({})).toBe(false)
    expect(isNullish([])).toBe(false)
  })
})

describe('isNotNullish', () => {
  it('returns false for null', () => {
    expect(isNotNullish(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isNotNullish(undefined)).toBe(false)
  })

  it('returns true for other falsy values', () => {
    expect(isNotNullish(false)).toBe(true)
    expect(isNotNullish(0)).toBe(true)
    expect(isNotNullish('')).toBe(true)
    expect(isNotNullish(NaN)).toBe(true)
  })

  it('returns true for truthy values', () => {
    expect(isNotNullish(true)).toBe(true)
    expect(isNotNullish(1)).toBe(true)
    expect(isNotNullish('test')).toBe(true)
    expect(isNotNullish({})).toBe(true)
    expect(isNotNullish([])).toBe(true)
  })
})
