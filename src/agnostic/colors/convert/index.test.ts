import { describe, it, expect } from 'vitest'
import { toRgb, toHsl, toHsb, toCmyk, toHex, toLab, toLch, toXyz, viaRgb } from './index.js'

describe('colors/convert', () => {
  describe('toRgb', () => {
    it('preserves RGB colors', () => {
      const color = { r: 255, g: 128, b: 64 }
      expect(toRgb(color)).toEqual({ r: 255, g: 128, b: 64 })
    })

    it('converts hex to RGB', () => {
      const result = toRgb('#ff8040')
      expect(result).toMatchObject({ r: 255, g: 128, b: 64 })
    })

    it('converts HSL to RGB', () => {
      const result = toRgb({ h: 0, s: 100, l: 50 })
      expect(result).toMatchObject({ r: 255, g: 0, b: 0 })
    })
  })

  describe('toHsl', () => {
    it('preserves HSL colors', () => {
      const color = { h: 180, s: 50, l: 75 }
      expect(toHsl(color)).toEqual({ h: 180, s: 50, l: 75 })
    })

    it('converts RGB to HSL', () => {
      const result = toHsl({ r: 255, g: 0, b: 0 })
      expect(result).toMatchObject({ h: 0, s: 100, l: 50 })
    })
  })

  describe('toHsb', () => {
    it('preserves HSB colors', () => {
      const color = { h: 180, s: 50, b: 75 }
      expect(toHsb(color)).toEqual({ h: 180, s: 50, b: 75 })
    })

    it('converts RGB to HSB', () => {
      const result = toHsb({ r: 255, g: 0, b: 0 })
      expect(result).toMatchObject({ h: 0, s: 100, b: 100 })
    })
  })

  describe('toCmyk', () => {
    it('preserves CMYK colors', () => {
      const color = { c: 50, m: 50, y: 50, k: 50 }
      expect(toCmyk(color)).toEqual({ c: 50, m: 50, y: 50, k: 50 })
    })

    it('converts RGB to CMYK', () => {
      const result = toCmyk({ r: 0, g: 0, b: 0 })
      expect(result).toMatchObject({ k: 100 })
    })
  })

  describe('toHex', () => {
    it('preserves hex colors', () => {
      expect(toHex('#ff0000')).toBe('#ff0000')
    })

    it('converts RGB to hex', () => {
      const result = toHex({ r: 255, g: 0, b: 0 })
      expect(result).toBe('#ff0000ff')
    })
  })

  describe('toLab', () => {
    it('preserves Lab colors', () => {
      const color = { l: 50, a: 0, b: 0 }
      expect(toLab(color)).toMatchObject({ l: 50, a: 0, b: 0 })
    })

    it('converts RGB to Lab', () => {
      const result = toLab({ r: 255, g: 255, b: 255 })
      expect(result.l).toBeGreaterThan(90)
    })
  })

  describe('toLch', () => {
    it('preserves LCH colors', () => {
      const color = { l: 50, c: 50, h: 180 }
      expect(toLch(color)).toMatchObject({ l: 50, c: 50, h: 180 })
    })

    it('converts RGB to LCH', () => {
      const result = toLch({ r: 255, g: 0, b: 0 })
      expect(result).toHaveProperty('l')
      expect(result).toHaveProperty('c')
      expect(result).toHaveProperty('h')
    })
  })

  describe('toXyz', () => {
    it('preserves XYZ colors', () => {
      const color = { x: 50, y: 50, z: 50 }
      expect(toXyz(color)).toMatchObject({ x: 50, y: 50, z: 50 })
    })

    it('converts RGB to XYZ', () => {
      const result = toXyz({ r: 255, g: 255, b: 255 })
      expect(result).toHaveProperty('x')
      expect(result).toHaveProperty('y')
      expect(result).toHaveProperty('z')
    })
  })

  describe('viaRgb', () => {
    it('transforms color and preserves format', () => {
      const hslColor = { h: 0, s: 100, l: 50 }
      const result = viaRgb(hslColor, rgb => ({ ...rgb, r: 128 }))
      expect(result).toHaveProperty('h')
      expect(result).toHaveProperty('s')
      expect(result).toHaveProperty('l')
    })
  })
})
