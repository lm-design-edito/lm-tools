import { describe, it, expect } from 'vitest'
import { grayscale } from './index.js'
import { toRgb } from '../convert/index.js'

describe('grayscale', () => {
  it('converts color to grayscale using lab method by default', () => {
    const result = grayscale({ r: 255, g: 128, b: 64 })
    const rgb = toRgb(result)
    expect(rgb.r).toBe(rgb.g)
    expect(rgb.g).toBe(rgb.b)
  })

  it('preserves color format', () => {
    const hslColor = { h: 180, s: 50, l: 75 }
    const result = grayscale(hslColor)
    expect(result).toHaveProperty('h')
    expect(result).toHaveProperty('s')
    expect(result).toHaveProperty('l')
  })

  it('converts using rgb-avg method', () => {
    const result = grayscale({ r: 255, g: 128, b: 64 }, 'rgb-avg')
    const rgb = toRgb(result)
    expect(rgb.r).toBe(rgb.g)
    expect(rgb.g).toBe(rgb.b)
  })

  it('converts using hsl method', () => {
    const result = grayscale({ h: 180, s: 50, l: 75 }, 'hsl')
    expect(result).toMatchObject({ s: 0 })
  })

  it('converts using lch method', () => {
    const result = grayscale({ r: 255, g: 128, b: 64 }, 'lch')
    const rgb = toRgb(result)
    expect(rgb.r).toBe(rgb.g)
    expect(rgb.g).toBe(rgb.b)
  })
})
