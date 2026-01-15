import { describe, it, expect } from 'vitest'
import { palette } from './index.js'

describe('palette', () => {
  it('generates complementary palette', () => {
    const result = palette({ r: 255, g: 0, b: 0 }, 'complementary')
    expect(result).toHaveLength(1)
  })

  it('generates split-complementary palette', () => {
    const result = palette({ r: 255, g: 0, b: 0 }, 'split-complementary')
    expect(result).toHaveLength(2)
  })

  it('generates triadic palette', () => {
    const result = palette({ r: 255, g: 0, b: 0 }, 'triadic')
    expect(result).toHaveLength(2)
  })

  it('generates tetradic palette', () => {
    const result = palette({ r: 255, g: 0, b: 0 }, 'tetradic')
    expect(result).toHaveLength(3)
  })

  it('preserves color format', () => {
    const hslColor = { h: 180, s: 50, l: 75 }
    const result = palette(hslColor, 'complementary')
    expect(result[0]).toHaveProperty('h')
    expect(result[0]).toHaveProperty('s')
    expect(result[0]).toHaveProperty('l')
  })

  it('generates complementary-lab palette', () => {
    const result = palette({ r: 255, g: 0, b: 0 }, 'complementary-lab')
    expect(result).toHaveLength(1)
  })

  it('generates triadic-lch palette', () => {
    const result = palette({ r: 255, g: 0, b: 0 }, 'triadic-lch')
    expect(result).toHaveLength(2)
  })
})
