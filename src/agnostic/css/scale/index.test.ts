import { describe, it, expect, vi } from 'vitest'
import { createScale, type ScaleDescriptor } from './index.js'
import * as geo from '../../numbers/geometric-progressions/index.js'

describe('createScale', () => {
  it('returns a function', () => {
    const descriptor: ScaleDescriptor = {
      screenBounds: [320, 1280],
      lowLevel: [10, 20],
      highLevel: [30, 60],
      steps: 5
    }
    const scaleFn = createScale(descriptor)
    expect(typeof scaleFn).toBe('function')
  })

  it('produces CSS calc() formula for intermediate levels', () => {
    const descriptor: ScaleDescriptor = {
      screenBounds: [320, 1280],
      lowLevel: [10, 20],
      highLevel: [30, 60],
      steps: 5
    }
    const scaleFn = createScale(descriptor)
    const cssValue = scaleFn(3)
    expect(cssValue).toMatch(/^calc\([\d.]+vw \+ [\d.]+px\)$/)
  })

  it('wraps result in clamp() when clamp is true', () => {
    const descriptor: ScaleDescriptor = {
      screenBounds: [320, 1280],
      lowLevel: [10, 20],
      highLevel: [30, 60],
      steps: 5,
      clamp: true
    }
    const scaleFn = createScale(descriptor)
    const cssValue = scaleFn(3)
    expect(cssValue).toMatch(/^clamp\([\d.]+px, calc\([\d.]+vw \+ [\d.]+px\), [\d.]+px\)$/)
  })

  it('returns undefined if steps < 2', () => {
    const descriptor: ScaleDescriptor = {
      screenBounds: [320, 1280],
      lowLevel: [10, 20],
      highLevel: [30, 60],
      steps: 1
    }
    const scaleFn = createScale(descriptor)
    expect(scaleFn(1)).toBeUndefined()
  })

  it('handles descending low/high levels', () => {
    const descriptor: ScaleDescriptor = {
      screenBounds: [320, 1280],
      lowLevel: [20, 10],
      highLevel: [60, 30],
      steps: 5
    }
    const scaleFn = createScale(descriptor)
    const cssValue = scaleFn(3)
    expect(cssValue).toMatch(/^calc\(-?[\d.]+vw \+ -?[\d.]+px\)$/)
  })

  it('propagates NaN from getGeometricStep', () => {
    vi.spyOn(geo, 'getGeometricStep').mockReturnValueOnce(NaN)
    const descriptor: ScaleDescriptor = {
      screenBounds: [320, 1280],
      lowLevel: [10, 20],
      highLevel: [30, 60],
      steps: 5
    }
    const scaleFn = createScale(descriptor)
    const result = scaleFn(2)
    expect(result).toBe('calc(NaNvw + NaNpx)')
  })
})
