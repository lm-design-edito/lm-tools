import { describe, it, expect, vi } from 'vitest'
import { getGeometricStep } from './index.js'

describe('getGeometricStep', () => {
  it('returns the minimum value at level 0', () => {
    expect(getGeometricStep(2, 32, 0, 5)).toBeCloseTo(2)
  })

  it('returns the maximum value at the last level', () => {
    const steps = 5
    const min = 2
    const max = 32
    const result = getGeometricStep(min, max, steps, steps)
    expect(result).toBeCloseTo(max)
  })

  it('returns intermediate geometric values for levels in between', () => {
    const min = 1
    const max = 16
    const steps = 4
    const values = Array.from({ length: steps + 1 }, (_, i) => getGeometricStep(min, max, i, steps))
    expect(values[0]).toBeCloseTo(1)
    expect(values[1]).toBeCloseTo(2)
    expect(values[2]).toBeCloseTo(4)
    expect(values[3]).toBeCloseTo(8)
    expect(values[4]).toBeCloseTo(16)
  })

  it('returns NaN if min is zero', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(getGeometricStep(0, 10, 1, 5)).toBeNaN()
    expect(spy).toHaveBeenCalledWith('Cannot generate values if min value is zero')
    spy.mockRestore()
  })

  it('returns NaN if steps is less than 1', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(getGeometricStep(1, 10, 1, 0)).toBeNaN()
    expect(spy).toHaveBeenCalledWith('Cannot generate values if steps is lower than one')
    spy.mockRestore()
  })

  it('handles min greater than max', () => {
    const min = 16
    const max = 1
    const steps = 4
    const values = Array.from({ length: steps + 1 }, (_, i) => getGeometricStep(min, max, i, steps))
    expect(values[0]).toBeCloseTo(16)
    expect(values[steps]).toBeCloseTo(1)
  })
})
