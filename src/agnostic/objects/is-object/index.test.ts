import { describe, it, expect } from 'vitest'
import { isObject, isNonNullObject } from './index.js'

describe('isObject', () => {
  it('returns true for plain objects', () => {
    expect(isObject({})).toBe(true)
    expect(isObject({ a: 1 })).toBe(true)
  })

  it('returns true for null', () => {
    expect(isObject(null)).toBe(true)
  })

  it('returns true for arrays', () => {
    expect(isObject([])).toBe(true)
    expect(isObject([1, 2, 3])).toBe(true)
  })

  it('returns true for Date objects', () => {
    expect(isObject(new Date())).toBe(true)
  })

  it('returns true for RegExp objects', () => {
    expect(isObject(/test/)).toBe(true)
  })

  it('returns false for primitives', () => {
    expect(isObject(42)).toBe(false)
    expect(isObject('string')).toBe(false)
    expect(isObject(true)).toBe(false)
    expect(isObject(undefined)).toBe(false)
  })

  it('returns false for functions', () => {
    expect(isObject(() => {})).toBe(false)
    expect(isObject(function () {})).toBe(false)
  })
})

describe('isNonNullObject', () => {
  it('returns true for plain objects', () => {
    expect(isNonNullObject({})).toBe(true)
    expect(isNonNullObject({ a: 1 })).toBe(true)
  })

  it('returns false for null', () => {
    expect(isNonNullObject(null)).toBe(false)
  })

  it('returns true for arrays', () => {
    expect(isNonNullObject([])).toBe(true)
    expect(isNonNullObject([1, 2, 3])).toBe(true)
  })

  it('returns true for Date objects', () => {
    expect(isNonNullObject(new Date())).toBe(true)
  })

  it('returns true for RegExp objects', () => {
    expect(isNonNullObject(/test/)).toBe(true)
  })

  it('returns false for primitives', () => {
    expect(isNonNullObject(42)).toBe(false)
    expect(isNonNullObject('string')).toBe(false)
    expect(isNonNullObject(true)).toBe(false)
    expect(isNonNullObject(undefined)).toBe(false)
  })

  it('returns false for functions', () => {
    expect(isNonNullObject(() => {})).toBe(false)
    expect(isNonNullObject(function () {})).toBe(false)
  })
})
