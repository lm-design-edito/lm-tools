import { describe, it, expect } from 'vitest'
import { toBoolean, toNumber, toString, toNull, toArray, toNumberArr, toRecord, toError } from './index.js'

describe('toBoolean', () => {
  it('returns boolean values as-is', () => {
    expect(toBoolean(true)).toBe(true)
    expect(toBoolean(false)).toBe(false)
  })

  it('returns true for string "true" (case-insensitive, trimmed)', () => {
    expect(toBoolean('true')).toBe(true)
    expect(toBoolean('TRUE')).toBe(true)
    expect(toBoolean('  true  ')).toBe(true)
  })

  it('returns false for other strings', () => {
    expect(toBoolean('false')).toBe(false)
    expect(toBoolean('yes')).toBe(false)
    expect(toBoolean('')).toBe(false)
  })

  it('returns true for truthy values', () => {
    expect(toBoolean(1)).toBe(true)
    expect(toBoolean({})).toBe(true)
    expect(toBoolean([])).toBe(true)
  })

  it('returns false for falsy values', () => {
    expect(toBoolean(0)).toBe(false)
    expect(toBoolean(null)).toBe(false)
    expect(toBoolean(undefined)).toBe(false)
  })
})

describe('toNumber', () => {
  it('returns numbers as-is', () => {
    expect(toNumber(42)).toBe(42)
    expect(toNumber(0)).toBe(0)
    expect(toNumber(-123)).toBe(-123)
  })

  it('parses string numbers', () => {
    expect(toNumber('42')).toBe(42)
    expect(toNumber('3.14')).toBe(3.14)
    expect(toNumber('-123')).toBe(-123)
  })

  it('returns 0 for non-numeric strings', () => {
    expect(toNumber('abc')).toBeNaN()
    expect(toNumber('')).toBeNaN()
  })

  it('returns 0 for non-string, non-number values', () => {
    expect(toNumber(null)).toBe(0)
    expect(toNumber(undefined)).toBe(0)
    expect(toNumber({})).toBe(0)
  })
})

describe('toString', () => {
  it('returns strings as-is', () => {
    expect(toString('test')).toBe('test')
    expect(toString('')).toBe('')
  })

  it('converts numbers to strings', () => {
    expect(toString(42)).toBe('42')
    expect(toString(0)).toBe('0')
  })

  it('converts other values using String()', () => {
    expect(toString(null)).toBe('null')
    expect(toString(undefined)).toBe('undefined')
    expect(toString(true)).toBe('true')
  })
})

describe('toNull', () => {
  it('always returns null', () => {
    expect(toNull(42)).toBe(null)
    expect(toNull('test')).toBe(null)
    expect(toNull(null)).toBe(null)
    expect(toNull(undefined)).toBe(null)
  })
})

describe('toArray', () => {
  it('returns arrays as-is', () => {
    const arr = [1, 2, 3]
    expect(toArray(arr)).toBe(arr)
  })

  it('converts objects to key-value pairs', () => {
    const result = toArray({ a: 1, b: 2 })
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual(['a', 1])
    expect(result[1]).toEqual(['b', 2])
  })

  it('wraps other values in array', () => {
    expect(toArray(42)).toEqual([42])
    expect(toArray('test')).toEqual(['test'])
    expect(toArray(null)).toEqual([null])
  })
})

describe('toNumberArr', () => {
  it('converts array to number array', () => {
    expect(toNumberArr([1, 2, 3])).toEqual([1, 2, 3])
    expect(toNumberArr(['1', '2', '3'])).toEqual([1, 2, 3])
  })

  it('converts object to number array', () => {
    const result = toNumberArr({ a: '1', b: '2' })
    expect(result).toHaveLength(2)
    expect(result[0]).toBe(0)
    expect(result[1]).toBe(0)
  })

  it('wraps single value and converts to number', () => {
    expect(toNumberArr(42)).toEqual([42])
    expect(toNumberArr('123')).toEqual([123])
  })
})

describe('toRecord', () => {
  it('copies object keys and values', () => {
    const obj = { a: 1, b: 'test' }
    const result = toRecord(obj)
    expect(result).toEqual({ a: 1, b: 'test' })
    expect(result).not.toBe(obj)
  })

  it('returns empty object for non-objects', () => {
    expect(toRecord(42)).toEqual({})
    expect(toRecord('test')).toEqual({ '0': 't', '1': 'e', '2': 's', '3': 't' })
    expect(toRecord(null)).toEqual({})
  })
})

describe('toError', () => {
  it('returns Error instances as-is', () => {
    const error = new Error('test')
    expect(toError(error)).toBe(error)
  })

  it('creates Error from string', () => {
    const error = toError('test message')
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('test message')
  })

  it('creates Error from other values', () => {
    const error = toError(42)
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('42')
  })
})
