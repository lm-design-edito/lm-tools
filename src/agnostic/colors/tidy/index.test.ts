import { describe, it, expect } from 'vitest'
import { tidy } from './index.js'

describe('tidy', () => {
  it('clamps RGB values to valid range', () => {
    const result = tidy({ r: 300, g: -10, b: 128 })
    expect(result).toMatchObject({ r: 255, g: 0, b: 128 })
  })

  it('clamps alpha to 0-1 range', () => {
    const result = tidy({ r: 128, g: 128, b: 128, a: 2 })
    expect(result).toMatchObject({ a: 1 })
  })

  it('preserves valid RGB colors', () => {
    const color = { r: 128, g: 128, b: 128, a: 0.5 }
    const result = tidy(color)
    expect(result).toEqual({ r: 128, g: 128, b: 128, a: 0.5 })
  })

  it('clamps HSL values to valid range', () => {
    const result = tidy({ h: 450, s: 150, l: -10 })
    expect(result).toMatchObject({ h: 90, s: 100, l: 0 })
  })

  it('wraps hue to 0-360 range', () => {
    const result = tidy({ h: -30, s: 50, l: 50 })
    expect(result).toMatchObject({ h: 330, s: 50, l: 50 })
  })

  it('clamps HSB values to valid range', () => {
    const result = tidy({ h: 450, s: 150, b: -10 })
    expect(result).toMatchObject({ h: 90, s: 100, b: 0 })
  })

  it('clamps CMYK values to valid range', () => {
    const result = tidy({ c: 150, m: -10, y: 50, k: 50 })
    expect(result).toMatchObject({ c: 100, m: 0, y: 50, k: 50 })
  })

  it('preserves color format', () => {
    const hslColor = { h: 180, s: 50, l: 75 }
    const result = tidy(hslColor)
    expect(result).toHaveProperty('h')
    expect(result).toHaveProperty('s')
    expect(result).toHaveProperty('l')
  })

  it('tidies hex colors', () => {
    const result = tidy('#ff0000')
    expect(typeof result).toBe('string')
    expect(result).toMatch(/^#/)
  })
})
