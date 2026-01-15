import { describe, it, expect } from 'vitest'
import { invert } from './index.js'
import { toRgb } from '../convert/index.js'

describe('invert', () => {
  it('inverts color using lch method by default', () => {
    const result = invert({ r: 255, g: 0, b: 0 })
    const rgb = toRgb(result)
    expect(rgb.r).not.toBe(255)
  })

  it('preserves color format', () => {
    const hslColor = { h: 180, s: 50, l: 75 }
    const result = invert(hslColor)
    expect(result).toHaveProperty('h')
    expect(result).toHaveProperty('s')
    expect(result).toHaveProperty('l')
  })

  it('inverts using rgb method', () => {
    const result = invert({ r: 255, g: 128, b: 64 }, 'rgb')
    const rgb = toRgb(result)
    expect(rgb.r).toBe(0)
    expect(rgb.g).toBe(127)
    expect(rgb.b).toBe(191)
  })

  it('inverts using lab method', () => {
    const result = invert({ r: 255, g: 0, b: 0 }, 'lab')
    const rgb = toRgb(result)
    expect(rgb).toHaveProperty('r')
    expect(rgb).toHaveProperty('g')
    expect(rgb).toHaveProperty('b')
  })
})
