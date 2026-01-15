import { describe, it, expect } from 'vitest'
import { luminance } from './index.js'

describe('luminance', () => {
  it('returns high luminance for white', () => {
    const result = luminance({ r: 255, g: 255, b: 255 })
    expect(result).toBeGreaterThan(0.9)
  })

  it('returns low luminance for black', () => {
    const result = luminance({ r: 0, g: 0, b: 0 })
    expect(result).toBeLessThan(0.1)
  })

  it('returns value between 0 and 1', () => {
    const result = luminance({ r: 128, g: 128, b: 128 })
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(1)
  })

  it('uses lab method by default', () => {
    const result1 = luminance({ r: 128, g: 128, b: 128 })
    const result2 = luminance({ r: 128, g: 128, b: 128 }, 'lab')
    expect(result1).toBe(result2)
  })

  it('calculates using rgb method', () => {
    const result = luminance({ r: 255, g: 255, b: 255 }, 'rgb')
    expect(result).toBeGreaterThan(0.9)
  })

  it('calculates using xyz method', () => {
    const result = luminance({ r: 255, g: 255, b: 255 }, 'xyz')
    expect(result).toBeGreaterThan(0.9)
  })
})
