import { describe, it, expect } from 'vitest'
import {
  isContiguousPartialDate,
  knownDateFields,
  partialDatePrecision,
  toPartialDate
} from './index.js'

describe('knownDateFields', () => {
  it('reads the known parts coarsest first', () => {
    expect(knownDateFields({ day: 14, year: 2026 })).toEqual(['year', 'day'])
    expect(knownDateFields({ year: 2026, month: 3, day: 14 })).toEqual(['year', 'month', 'day'])
  })

  it('takes absent, null and undefined as the same unknown', () => {
    expect(knownDateFields({ year: 2026, month: null })).toEqual(['year'])
    expect(knownDateFields({ year: 2026, month: undefined })).toEqual(['year'])
    expect(knownDateFields({})).toEqual([])
  })

  it('keeps a zero, which is a value like any other', () => {
    expect(knownDateFields({ hours: 0 })).toEqual(['hours'])
  })
})

describe('partialDatePrecision', () => {
  it('names the finest known part', () => {
    expect(partialDatePrecision({ year: 2026 })).toBe('year')
    expect(partialDatePrecision({ year: 2026, month: 3 })).toBe('month')
    expect(partialDatePrecision({ year: 2026, month: 3, day: 14, hours: 21 })).toBe('hours')
  })

  it('reads through a hole above it', () => {
    expect(partialDatePrecision({ year: 2026, day: 14 })).toBe('day')
    expect(partialDatePrecision({ minutes: 30 })).toBe('minutes')
  })

  it('has nothing to say about a record that knows nothing', () => {
    expect(partialDatePrecision({})).toBeNull()
  })
})

describe('isContiguousPartialDate', () => {
  it('holds when every part down to the precision is known', () => {
    expect(isContiguousPartialDate({ year: 2026, month: 3 })).toBe(true)
    expect(isContiguousPartialDate({ year: 2026, month: 3, day: 14 })).toBe(true)
    expect(isContiguousPartialDate({})).toBe(true)
  })

  it('fails on a hole, wherever it sits', () => {
    expect(isContiguousPartialDate({ year: 2026, day: 14 })).toBe(false)
    expect(isContiguousPartialDate({ month: 3, day: 14 })).toBe(false)
    expect(isContiguousPartialDate({ year: 2026, month: 3, day: 14, minutes: 30 })).toBe(false)
  })
})

describe('toPartialDate', () => {
  it('knows every part of a date', () => {
    expect(toPartialDate(new Date(2026, 2, 14, 21, 30, 5, 123))).toEqual({
      year: 2026,
      month: 3,
      day: 14,
      hours: 21,
      minutes: 30,
      seconds: 5,
      milliseconds: 123
    })
  })

  it('counts months from one, where a Date counts from zero', () => {
    expect(toPartialDate(new Date(2026, 0, 1)).month).toBe(1)
  })
})
