import { describe, it, expect } from 'vitest'
import { recordMap } from './index.js'

describe('recordMap', () => {
  it('maps values using the mapper function', () => {
    const record = { a: 1, b: 2, c: 3 }
    const result = recordMap(record, val => val * 2)
    expect(result).toEqual({ a: 2, b: 4, c: 6 })
  })

  it('preserves keys while transforming values', () => {
    const record = { x: 'hello', y: 'world' }
    const result = recordMap(record, val => val.toUpperCase())
    expect(result).toEqual({ x: 'HELLO', y: 'WORLD' })
  })

  it('provides both value and key to mapper function', () => {
    const record = { a: 1, b: 2 }
    const result = recordMap(record, (val, key) => `${key}:${val}`)
    expect(result).toEqual({ a: 'a:1', b: 'b:2' })
  })

  it('handles empty records', () => {
    const record = {}
    const result = recordMap(record, val => val)
    expect(result).toEqual({})
  })

  it('handles records with different value types', () => {
    const record = { num: 5, str: 'test', bool: true }
    const result = recordMap(record, val => String(val))
    expect(result).toEqual({ num: '5', str: 'test', bool: 'true' })
  })

  it('handles mapper that changes value type', () => {
    const record = { a: 1, b: 2, c: 3 }
    const result = recordMap(record, val => val > 2)
    expect(result).toEqual({ a: false, b: false, c: true })
  })

  it('handles mapper that returns objects', () => {
    const record = { a: 1, b: 2 }
    const result = recordMap(record, val => ({ value: val }))
    expect(result).toEqual({ a: { value: 1 }, b: { value: 2 } })
  })

  it('handles mapper that returns arrays', () => {
    const record = { a: 1, b: 2 }
    const result = recordMap(record, val => [val, val * 2])
    expect(result).toEqual({ a: [1, 2], b: [2, 4] })
  })

  it('only processes own properties', () => {
    const parent = { inherited: 'value' }
    const record = Object.create(parent)
    record.own = 'ownValue'
    const result = recordMap(record, val => val.toUpperCase())
    expect(result).toEqual({ own: 'OWNVALUE' })
  })

  it('handles numeric string keys', () => {
    const record = { '0': 'zero', '1': 'one', '2': 'two' }
    const result = recordMap(record, val => val.toUpperCase())
    expect(result).toEqual({ '0': 'ZERO', '1': 'ONE', '2': 'TWO' })
  })
})
