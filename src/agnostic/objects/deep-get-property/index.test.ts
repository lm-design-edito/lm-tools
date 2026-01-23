import { describe, it, expect } from 'vitest'
import { deepGetProperty } from './index.js'

describe('deepGetProperty', () => {
  it('retrieves a top-level property', () => {
    const obj = { a: 1, b: 2 }
    expect(deepGetProperty(obj, 'a')).toBe(1)
    expect(deepGetProperty(obj, 'b')).toBe(2)
  })

  it('retrieves a nested property', () => {
    const obj = { a: { b: { c: 42 } } }
    expect(deepGetProperty(obj, 'a.b.c')).toBe(42)
  })

  it('handles paths with extra spaces', () => {
    const obj = { a: { b: { c: 'value' } } }
    expect(deepGetProperty(obj, 'a. b . c')).toBe('value')
  })

  it('handles empty path segments', () => {
    const obj = { a: { b: 5 } }
    expect(deepGetProperty(obj, 'a..b')).toBe(5)
  })

  it('returns the entire object for empty path', () => {
    const obj = { a: 1, b: 2 }
    expect(deepGetProperty(obj, '')).toBe(obj)
  })

  it('returns the entire object for path with only dots', () => {
    const obj = { a: 1, b: 2 }
    expect(deepGetProperty(obj, '...')).toBe(obj)
  })

  it('throws PROPERTY_UNREACHABLE when path goes through non-object', () => {
    const obj = { a: 42 }
    expect(() => deepGetProperty(obj, 'a.b')).toThrow('PROPERTY_UNREACHABLE')
  })

  it('throws PROPERTY_UNREACHABLE when accessing property on null', () => {
    const obj = { a: null }
    expect(() => deepGetProperty(obj, 'a.b')).toThrow('PROPERTY_UNREACHABLE')
  })

  it('throws PROPERTY_UNREACHABLE when accessing property on undefined', () => {
    const obj = { a: undefined }
    expect(() => deepGetProperty(obj, 'a.b')).toThrow('PROPERTY_UNREACHABLE')
  })

  it('throws PROPERTY_UNREACHABLE when accessing property on primitive', () => {
    const obj = { a: 'string' }
    expect(() => deepGetProperty(obj, 'a.b')).toThrow('PROPERTY_UNREACHABLE')
  })

  it('throws PROPERTY_UNREACHABLE when input is not a record', () => {
    expect(() => deepGetProperty(null, 'a')).toThrow('PROPERTY_UNREACHABLE')
    expect(() => deepGetProperty(42, 'a')).toThrow('PROPERTY_UNREACHABLE')
    expect(() => deepGetProperty('string', 'a')).toThrow('PROPERTY_UNREACHABLE')
  })

  it('returns undefined for non-existent property', () => {
    const obj = { a: 1 }
    expect(deepGetProperty(obj, 'b')).toBeUndefined()
  })

  it('handles arrays as intermediate values', () => {
    const obj = { a: [1, 2, 3] }
    expect(deepGetProperty(obj, 'a')).toEqual([1, 2, 3])
    expect(deepGetProperty(obj, 'a.1')).toEqual(2)
  })
})
