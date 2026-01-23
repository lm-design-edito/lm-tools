import { describe, it, expect } from 'vitest'
import { recordFormat } from './index.js'

describe('recordFormat', () => {
  it('applies formatters to all properties', async () => {
    const input = { a: 1, b: 2, c: 3 }
    const format = {
      a: (val: number) => val * 2,
      b: (val: number) => val * 3,
      c: (val: number) => val * 4
    }
    const result = await recordFormat(input, format)
    expect(result).toEqual({ a: 2, b: 6, c: 12 })
  })

  it('handles async formatters', async () => {
    const input = { a: 1, b: 2 }
    const format = {
      a: async (val: number) => val * 2,
      b: (val: number) => val * 3
    }
    const result = await recordFormat(input, format)
    expect(result).toEqual({ a: 2, b: 6 })
  })

  it('handles formatters that return different types', async () => {
    const input = { num: 5, str: 'hello' }
    const format = {
      num: (val: number) => val.toString(),
      str: (val: string) => val.toUpperCase()
    }
    const result = await recordFormat(input, format)
    expect(result).toEqual({ num: '5', str: 'HELLO' })
  })

  it('handles undefined values', async () => {
    const input = { a: 1, b: undefined }
    const format = {
      a: (val: number) => val * 2,
      b: (val: undefined) => 'missing'
    }
    const result = await recordFormat(input, format)
    expect(result).toEqual({ a: 2, b: 'missing' })
  })

  it('handles formatters that access other properties', async () => {
    const input = { base: 10, multiplier: 2 }
    const format = {
      base: (val: number) => val,
      multiplier: (val: number) => val * input.base
    }
    const result = await recordFormat(input, format)
    expect(result).toEqual({ base: 10, multiplier: 20 })
  })

  it('handles empty input object', async () => {
    const input = {}
    const format = {}
    const result = await recordFormat(input, format)
    expect(result).toEqual({})
  })

  it('handles format with fewer keys than input', async () => {
    const input = { a: 1, b: 2, c: 3 }
    const format = {
      a: (val: number) => val * 2
    }
    const result = await recordFormat(input, format)
    expect(result).toEqual({ a: 2 })
  })

  it('handles format with more keys than input', async () => {
    const input = { a: 1 }
    const format = {
      a: (val: number) => val * 2,
      b: (val: undefined) => 'default'
    }
    const result = await recordFormat(input, format)
    expect(result).toEqual({ a: 2, b: 'default' })
  })

  it('handles complex nested transformations', async () => {
    const input = { items: [1, 2, 3] }
    const format = {
      items: (val: number[]) => val.map(x => x * 2)
    }
    const result = await recordFormat(input, format)
    expect(result).toEqual({ items: [2, 4, 6] })
  })

  it('handles formatters that return promises', async () => {
    const input = { value: 5 }
    const format = {
      value: async (val: number) => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return val * 2
      }
    }
    const result = await recordFormat(input, format)
    expect(result).toEqual({ value: 10 })
  })
})
