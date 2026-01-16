import { describe, it, expect } from 'vitest'
import { contrast } from './index.js'

describe('contrast', () => {
  it('calculates contrast between white and black', () => {
    const result = contrast({ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 })
    expect(result).toBeGreaterThan(20)
  })

  it('calculates contrast between similar colors', () => {
    const result = contrast({ r: 200, g: 200, b: 200 }, { r: 210, g: 210, b: 210 })
    expect(result).toBeLessThan(2)
  })

  it('uses wcag method by default', () => {
    const result1 = contrast({ r: 255, g: 0, b: 0 }, { r: 0, g: 255, b: 0 })
    const result2 = contrast({ r: 255, g: 0, b: 0 }, { r: 0, g: 255, b: 0 }, 'wcag')
    expect(result1).toBe(result2)
  })

  it('returns value greater than 1 for any two colors', () => {
    const result = contrast({ r: 100, g: 100, b: 100 }, { r: 150, g: 150, b: 150 })
    expect(result).toBeGreaterThanOrEqual(1)
  })
})
