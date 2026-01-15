import { describe, it, expect } from 'vitest'
import { unknownToString } from './index.js'

describe('unknownToString', () => {
  it('returns error message for Error instances', () => {
    const error = new Error('test error message')
    expect(unknownToString(error)).toBe('test error message')
  })

  it('returns the string for string inputs', () => {
    expect(unknownToString('test string')).toBe('test string')
    expect(unknownToString('')).toBe('')
  })

  it('returns JSON stringified object for objects', () => {
    expect(unknownToString({ a: 1, b: 'test' })).toBe('{"a":1,"b":"test"}')
    expect(unknownToString({ nested: { value: 42 } })).toBe('{"nested":{"value":42}}')
  })

  it('returns JSON stringified array for arrays', () => {
    expect(unknownToString([1, 2, 3])).toBe('[1,2,3]')
    expect(unknownToString(['a', 'b', 'c'])).toBe('["a","b","c"]')
  })

  it('returns stringified number for numbers', () => {
    expect(unknownToString(42)).toBe('42')
    expect(unknownToString(0)).toBe('0')
    expect(unknownToString(-123)).toBe('-123')
  })

  it('returns stringified boolean for booleans', () => {
    expect(unknownToString(true)).toBe('true')
    expect(unknownToString(false)).toBe('false')
  })

  it('returns stringified null for null', () => {
    expect(unknownToString(null)).toBe('null')
  })

  it('returns stringified undefined for undefined', () => {
    expect(unknownToString(undefined)).toBe('undefined')
  })
})
