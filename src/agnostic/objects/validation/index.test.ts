import { describe, it, expect } from 'vitest'
import { fromPartial } from './index.js'

describe('fromPartial', () => {
  it('returns true when all partial entries match', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const partial = { a: 1, b: 2 }
    expect(fromPartial(obj, partial)).toBe(true)
  })

  it('returns true when partial is empty', () => {
    const obj = { a: 1, b: 2 }
    const partial = {}
    expect(fromPartial(obj, partial)).toBe(true)
  })

  it('returns false when any partial entry does not match', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const partial = { a: 1, b: 3 }
    expect(fromPartial(obj, partial)).toBe(false)
  })

  it('returns false when partial has key not in object', () => {
    const obj = { a: 1, b: 2 }
    const partial = { a: 1, c: 3 }
    expect(fromPartial(obj, partial)).toBe(false)
  })

  it('handles string values', () => {
    const obj = { name: 'John', age: 30 }
    const partial = { name: 'John' }
    expect(fromPartial(obj, partial)).toBe(true)
  })

  it('handles boolean values', () => {
    const obj = { active: true, verified: false }
    const partial = { active: true }
    expect(fromPartial(obj, partial)).toBe(true)
  })

  it('handles null values', () => {
    const obj = { a: null, b: 2 }
    const partial = { a: null }
    expect(fromPartial(obj, partial)).toBe(true)
  })

  it('handles undefined values', () => {
    const obj = { a: undefined, b: 2 }
    const partial = { a: undefined }
    expect(fromPartial(obj, partial)).toBe(true)
  })

  it('performs shallow equality check', () => {
    const obj = { nested: { a: 1 } }
    const partial = { nested: { a: 1 } }
    // Shallow check: objects are compared by reference
    expect(fromPartial(obj, partial)).toBe(false)
  })

  it('handles arrays with shallow equality', () => {
    const obj = { items: [1, 2, 3] }
    const partial = { items: [1, 2, 3] }
    // Shallow check: arrays are compared by reference
    expect(fromPartial(obj, partial)).toBe(false)
  })

  it('handles arrays with same reference', () => {
    const items = [1, 2, 3]
    const obj = { items }
    const partial = { items }
    expect(fromPartial(obj, partial)).toBe(true)
  })

  it('handles multiple matching entries', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4, e: 5 }
    const partial = { a: 1, c: 3, e: 5 }
    expect(fromPartial(obj, partial)).toBe(true)
  })

  it('handles objects with no matching entries', () => {
    const obj = { a: 1, b: 2 }
    const partial = { a: 2, b: 1 }
    expect(fromPartial(obj, partial)).toBe(false)
  })
})
