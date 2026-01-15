import { describe, it, expect } from 'vitest'
import { isHex, isRgb, isHsl, isHsb, isCmyk, isXyz, isLab, isLch, isCssColor, isColor } from './index.js'

describe('isHex', () => {
  it('returns true for valid hex colors', () => {
    expect(isHex('#ff0000')).toBe(true)
    expect(isHex('#f00')).toBe(true)
    expect(isHex('#ff0000ff')).toBe(true)
    expect(isHex('#f00f')).toBe(true)
  })

  it('returns false for invalid hex colors', () => {
    expect(isHex('ff0000')).toBe(false)
    expect(isHex('#gg0000')).toBe(false)
    expect(isHex('#ff')).toBe(false)
    expect(isHex(123)).toBe(false)
  })
})

describe('isRgb', () => {
  it('returns true for valid RGB colors', () => {
    expect(isRgb({ r: 255, g: 128, b: 64 })).toBe(true)
    expect(isRgb({ r: 255, g: 128, b: 64, a: 0.5 })).toBe(true)
  })

  it('returns false for invalid RGB colors', () => {
    expect(isRgb({ r: 255, g: 128 })).toBe(false)
    expect(isRgb({ r: '255', g: 128, b: 64 })).toBe(false)
    expect(isRgb(null)).toBe(false)
  })
})

describe('isHsl', () => {
  it('returns true for valid HSL colors', () => {
    expect(isHsl({ h: 180, s: 50, l: 75 })).toBe(true)
    expect(isHsl({ h: 180, s: 50, l: 75, a: 0.5 })).toBe(true)
  })

  it('returns false for invalid HSL colors', () => {
    expect(isHsl({ h: 180, s: 50 })).toBe(false)
    expect(isHsl({ h: '180', s: 50, l: 75 })).toBe(false)
    expect(isHsl(null)).toBe(false)
  })
})

describe('isHsb', () => {
  it('returns true for valid HSB colors', () => {
    expect(isHsb({ h: 180, s: 50, b: 75 })).toBe(true)
    expect(isHsb({ h: 180, s: 50, b: 75, a: 0.5 })).toBe(true)
  })

  it('returns false for invalid HSB colors', () => {
    expect(isHsb({ h: 180, s: 50 })).toBe(false)
    expect(isHsb({ h: '180', s: 50, b: 75 })).toBe(false)
  })
})

describe('isCmyk', () => {
  it('returns true for valid CMYK colors', () => {
    expect(isCmyk({ c: 50, m: 50, y: 50, k: 50 })).toBe(true)
    expect(isCmyk({ c: 50, m: 50, y: 50, k: 50, a: 0.5 })).toBe(true)
  })

  it('returns false for invalid CMYK colors', () => {
    expect(isCmyk({ c: 50, m: 50, y: 50 })).toBe(false)
    expect(isCmyk({ c: '50', m: 50, y: 50, k: 50 })).toBe(false)
  })
})

describe('isXyz', () => {
  it('returns true for valid XYZ colors', () => {
    expect(isXyz({ x: 50, y: 50, z: 50 })).toBe(true)
    expect(isXyz({ x: 50, y: 50, z: 50, a: 0.5 })).toBe(true)
  })

  it('returns false for invalid XYZ colors', () => {
    expect(isXyz({ x: 50, y: 50 })).toBe(false)
    expect(isXyz({ x: '50', y: 50, z: 50 })).toBe(false)
  })
})

describe('isLab', () => {
  it('returns true for valid Lab colors', () => {
    expect(isLab({ l: 50, a: 0, b: 0 })).toBe(true)
    expect(isLab({ l: 50, a: 0, b: 0, al: 0.5 })).toBe(true)
  })

  it('returns false for invalid Lab colors', () => {
    expect(isLab({ l: 50, a: 0 })).toBe(false)
    expect(isLab({ l: '50', a: 0, b: 0 })).toBe(false)
  })
})

describe('isLch', () => {
  it('returns true for valid LCH colors', () => {
    expect(isLch({ l: 50, c: 50, h: 180 })).toBe(true)
    expect(isLch({ l: 50, c: 50, h: 180, a: 0.5 })).toBe(true)
  })

  it('returns false for invalid LCH colors', () => {
    expect(isLch({ l: 50, c: 50 })).toBe(false)
    expect(isLch({ l: '50', c: 50, h: 180 })).toBe(false)
  })
})

describe('isCssColor', () => {
  it('returns true for valid CSS color names', () => {
    expect(isCssColor('red')).toBe(true)
    expect(isCssColor('blue')).toBe(true)
  })

  it('returns false for invalid CSS color names', () => {
    expect(isCssColor('notacolor')).toBe(false)
    expect(isCssColor('#ff0000')).toBe(false)
    expect(isCssColor(123)).toBe(false)
  })
})

describe('isColor', () => {
  it('returns true for any valid color format', () => {
    expect(isColor('#ff0000')).toBe(true)
    expect(isColor({ r: 255, g: 0, b: 0 })).toBe(true)
    expect(isColor({ h: 0, s: 100, l: 50 })).toBe(true)
    expect(isColor('red')).toBe(true)
  })

  it('returns false for invalid colors', () => {
    expect(isColor('notacolor')).toBe(false)
    expect(isColor(123)).toBe(false)
    expect(isColor(null)).toBe(false)
    expect(isColor({ r: 255 })).toBe(false)
  })
})
