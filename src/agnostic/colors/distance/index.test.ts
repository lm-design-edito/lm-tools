import { describe, it, expect } from 'vitest'
import { distance } from './index.js'

describe('distance', () => {
  it('returns small distance for identical colors', () => {
    const result = distance({ r: 255, g: 128, b: 64 }, { r: 255, g: 128, b: 64 })
    expect(result).toBeLessThan(1)
  })

  it('returns larger distance for very different colors', () => {
    const result = distance({ r: 255, g: 0, b: 0 }, { r: 0, g: 255, b: 0 })
    expect(result).toBeGreaterThan(10)
  })

  it('uses ciede2000 method by default', () => {
    const result1 = distance({ r: 255, g: 0, b: 0 }, { r: 0, g: 255, b: 0 })
    const result2 = distance({ r: 255, g: 0, b: 0 }, { r: 0, g: 255, b: 0 }, 'ciede2000')
    expect(result1).toBe(result2)
  })

  it('returns non-negative distance', () => {
    const result = distance({ r: 100, g: 100, b: 100 }, { r: 200, g: 200, b: 200 })
    expect(result).toBeGreaterThanOrEqual(0)
  })
})
