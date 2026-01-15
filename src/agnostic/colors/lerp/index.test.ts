import { describe, it, expect } from 'vitest'
import { lerp } from './index.js'
import { toRgb } from '../convert/index.js'

describe('lerp', () => {
  it('returns first color when amount is 0', () => {
    const c1 = { r: 255, g: 0, b: 0 }
    const c2 = { r: 0, g: 255, b: 0 }
    const result = lerp(c1, c2, 0)
    const rgb = toRgb(result)
    expect(rgb.r).toBe(255)
    expect(rgb.g).toBe(0)
    expect(rgb.b).toBe(0)
  })

  it('returns second color when amount is 1', () => {
    const c1 = { r: 255, g: 0, b: 0 }
    const c2 = { r: 0, g: 255, b: 0 }
    const result = lerp(c1, c2, 1)
    const rgb = toRgb(result)
    expect(rgb.r).toBe(0)
    expect(rgb.g).toBe(255)
    expect(rgb.b).toBe(0)
  })

  it('interpolates between colors', () => {
    const c1 = { r: 0, g: 0, b: 0 }
    const c2 = { r: 255, g: 255, b: 255 }
    const result = lerp(c1, c2, 0.5)
    const rgb = toRgb(result)
    expect(rgb.r).toBeGreaterThan(0)
    expect(rgb.r).toBeLessThan(255)
  })

  it('preserves first color format', () => {
    const c1 = { h: 0, s: 100, l: 50 }
    const c2 = { r: 0, g: 255, b: 0 }
    const result = lerp(c1, c2, 0.5)
    expect(result).toHaveProperty('h')
    expect(result).toHaveProperty('s')
    expect(result).toHaveProperty('l')
  })

  it('uses rgb method by default', () => {
    const c1 = { r: 0, g: 0, b: 0 }
    const c2 = { r: 255, g: 255, b: 255 }
    const result1 = lerp(c1, c2, 0.5)
    const result2 = lerp(c1, c2, 0.5, 'rgb')
    expect(toRgb(result1)).toEqual(toRgb(result2))
  })

  it('interpolates using lab method', () => {
    const c1 = { r: 255, g: 0, b: 0 }
    const c2 = { r: 0, g: 255, b: 0 }
    const result = lerp(c1, c2, 0.5, 'lab')
    const rgb = toRgb(result)
    expect(rgb).toHaveProperty('r')
    expect(rgb).toHaveProperty('g')
    expect(rgb).toHaveProperty('b')
  })
})
