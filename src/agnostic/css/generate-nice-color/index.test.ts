import { describe, it, expect } from 'vitest'
import { generateNiceColor, niceColors } from './index.js'

describe('generateNiceColor', () => {
  it('returns a color from the niceColors array', () => {
    const result = generateNiceColor()
    expect(niceColors).toContain(result)
  })
})
