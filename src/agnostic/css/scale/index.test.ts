import { describe, it, expect } from 'vitest'
import {
  interpolateLevels,
  getScaleData,
  generateScaleCss,
  type ScaleDataOptions
} from './index.js'

describe('interpolateLevels', () => {
  it('returns an array including min and interpolated values', () => {
    const result = interpolateLevels(10, 20, 2)
    expect(result.length).toBe(4)
    expect(result[0]).toBe(10)
    expect(result.at(-1)).toBeCloseTo(20, 2)
  })

  it('rounds values to 2 decimals', () => {
    const result = interpolateLevels(10, 20, 3)
    result.forEach(val => {
      expect(Number(val.toFixed(2))).toBe(val)
    })
  })

  it('handles descending ranges', () => {
    const result = interpolateLevels(20, 10, 2)
    expect(result[0]).toBe(20)
    expect(result.at(-1)).toBeCloseTo(10, 2)
  })
})

describe('getScaleData', () => {
  const baseOptions: ScaleDataOptions = {
    breakpoints: [320, 768, 1280],
    loScaleBounds: [10, 20],
    hiScaleBounds: [30, 60],
    intermediateLevels: 2
  }

  it('returns one entry per breakpoint', () => {
    const result = getScaleData(baseOptions)
    expect(result.length).toBe(baseOptions.breakpoints.length)
  })

  it('includes breakpoint and levels', () => {
    const result = getScaleData(baseOptions)
    result.forEach(entry => {
      expect(entry).toHaveProperty('breakpoint')
      expect(entry).toHaveProperty('levels')
      expect(Array.isArray(entry.levels)).toBe(true)
    })
  })

  it('interpolates values between low and high bounds', () => {
    const result = getScaleData(baseOptions)
    const first = result[0]
    const last = result.at(-1)

    expect(first?.levels[0]).toBeCloseTo(10, 2)
    expect(last?.levels.at(-1)).toBeCloseTo(60, 2)
  })

  it('throws if breakpoints length < 2', () => {
    expect(() =>
      getScaleData({
        ...baseOptions,
        breakpoints: [320]
      })
    ).toThrow()
  })
})

describe('generateScaleCss', () => {
  const options = {
    scaleName: 'size',
    targetSelector: ':root',
    unit: 'px',
    breakpoints: [320, 768],
    loScaleBounds: [10, 20] as [number, number],
    hiScaleBounds: [30, 40] as [number, number],
    intermediateLevels: 1
  }

  it('generates base CSS block for first breakpoint', () => {
    const css = generateScaleCss(options)
    expect(css).toMatch(/:root\s*{[^}]+}/)
  })

  it('generates media queries for subsequent breakpoints', () => {
    const css = generateScaleCss(options)
    expect(css).toMatch(/@media \(min-width: 768px\)/)
  })

  it('generates CSS custom properties with correct naming', () => {
    const css = generateScaleCss(options)
    expect(css).toMatch(/--size-0:/)
    expect(css).toMatch(/--size-1:/)
  })

  it('applies the provided unit', () => {
    const css = generateScaleCss(options)
    expect(css).toMatch(/px;/)
  })

  it('produces consistent number of variables per breakpoint', () => {
    const css = generateScaleCss(options)
    const matches = css.match(/--size-\d+:/g) ?? []
    // 3 levels * 2 breakpoints
    expect(matches.length).toBe(6)
  })
})
