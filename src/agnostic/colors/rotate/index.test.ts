import { describe, it, expect } from 'vitest'
import { rotate } from './index.js'
import { toHsl } from '../convert/index.js'

describe('rotate', () => {
  it('rotates hue by specified degrees', () => {
    const color = { h: 0, s: 100, l: 50 }
    const result = rotate(color, 180)
    const hsl = toHsl(result)
    expect(hsl.h).toBe(180)
  })

  it('preserves color format', () => {
    const rgbColor = { r: 255, g: 0, b: 0 }
    const result = rotate(rgbColor, 180)
    expect(result).toHaveProperty('r')
    expect(result).toHaveProperty('g')
    expect(result).toHaveProperty('b')
  })

  it('wraps hue when rotating beyond 360', () => {
    const color = { h: 300, s: 100, l: 50 }
    const result = rotate(color, 100)
    const hsl = toHsl(result)
    expect(hsl.h).toBeGreaterThanOrEqual(0)
    expect(hsl.h).toBeLessThan(360)
  })

  it('uses hsl method by default', () => {
    const color = { h: 0, s: 100, l: 50 }
    const result1 = rotate(color, 180)
    const result2 = rotate(color, 180, 'hsl')
    expect(toHsl(result1).h).toBe(toHsl(result2).h)
  })

  it('rotates using lab method', () => {
    const color = { r: 255, g: 0, b: 0 }
    const result = rotate(color, 180, 'lab')
    expect(result).toHaveProperty('r')
    expect(result).toHaveProperty('g')
    expect(result).toHaveProperty('b')
  })

  it('rotates using lch method', () => {
    const color = { r: 255, g: 0, b: 0 }
    const result = rotate(color, 180, 'lch')
    expect(result).toHaveProperty('r')
    expect(result).toHaveProperty('g')
    expect(result).toHaveProperty('b')
  })
})
