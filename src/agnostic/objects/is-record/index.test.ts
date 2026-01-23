import { describe, it, expect } from 'vitest'
import { isRecord } from './index.js'

describe('isRecord', () => {
  it('returns true for plain objects', () => {
    expect(isRecord({})).toBe(true)
    expect(isRecord({ a: 1 })).toBe(true)
    expect(isRecord({ a: 1, b: 'string' })).toBe(true)
  })

  it('returns true for objects with string keys', () => {
    expect(isRecord({ 'key': 'value' })).toBe(true)
    expect(isRecord({ '0': 0, '1': 1 })).toBe(true)
  })

  it('returns false for null', () => {
    expect(isRecord(null)).toBe(false)
  })

  it('returns false for arrays', () => {
    expect(isRecord([])).toBe(false)
    expect(isRecord([1, 2, 3])).toBe(false)
  })

  it('returns false for primitives', () => {
    expect(isRecord(42)).toBe(false)
    expect(isRecord('string')).toBe(false)
    expect(isRecord(true)).toBe(false)
    expect(isRecord(undefined)).toBe(false)
  })

  it('returns false for Date objects', () => {
    expect(isRecord(new Date())).toBe(false)
  })

  it('returns false for RegExp objects', () => {
    expect(isRecord(/test/)).toBe(false)
  })

  it('returns false for functions', () => {
    expect(isRecord(() => {})).toBe(false)
    expect(isRecord(function () {})).toBe(false)
  })

  it('returns true for objects created with Object.create(null)', () => {
    const obj = Object.create(null)
    obj.key = 'value'
    expect(isRecord(obj)).toBe(true)
  })

  it('returns true for class instances with string keys', () => {
    class MyClass {
      prop = 'value'
    }
    const instance = new MyClass()
    expect(isRecord(instance)).toBe(true)
  })
})
