import { describe, it, expect } from 'vitest'
import {
  days,
  minutes,
  seconds
} from '../index.js'
import { formatDuration } from './index.js'
import { getDurationParts } from './parts.js'

const DAY = 86400000

describe('formatDuration', () => {
  describe('template', () => {
    it('splits the duration across the units the template mentions', () => {
      expect(formatDuration(seconds(3725), '{{h}}:{{mm}}:{{ss}}')).toBe('1:02:05')
    })

    it('puts the whole duration on the only unit a template asks for', () => {
      expect(formatDuration(seconds(3725), '{{s}}s')).toBe('3725s')
      expect(formatDuration(days(400), '{{d}} days')).toBe('400 days')
    })

    it('accepts a plain number of milliseconds in place of a Duration', () => {
      expect(formatDuration(3725000, '{{h}}:{{mm}}:{{ss}}')).toBe('1:02:05')
    })

    it('pads a doubled token to two digits and leaves its bare twin alone', () => {
      expect(formatDuration(minutes(5), '{{mm}}:{{ss}}')).toBe('05:00')
      expect(formatDuration(minutes(5), '{{m}}:{{s}}')).toBe('5:0')
    })

    it('pads milliseconds to three digits', () => {
      expect(formatDuration(1042, '{{s}}.{{ms}}')).toBe('1.042')
    })

    it('substitutes every occurrence of a repeated token', () => {
      expect(formatDuration(seconds(5), '{{s}}/{{s}}')).toBe('5/5')
    })

    it('leaves an unknown token untouched, braces included', () => {
      expect(formatDuration(seconds(5), '{{ZZ}} {{s}}')).toBe('{{ZZ}} 5')
    })

    it('does not substitute a bare letter outside a placeholder', () => {
      expect(formatDuration(seconds(5), 'd h m s {{s}}')).toBe('d h m s 5')
    })
  })

  describe('remainder', () => {
    it('drops the fraction of the smallest unit by default', () => {
      expect(formatDuration(119600, '{{m}}:{{s}}')).toBe('1:59')
    })

    it('keeps the fraction when floorSmallestUnit is off', () => {
      expect(formatDuration(119600, '{{m}}:{{s}}', { floorSmallestUnit: false })).toBe('1:59.6')
    })
  })

  describe('month and year approximation', () => {
    it('counts 365 days as a full year by default', () => {
      expect(formatDuration(days(365), '{{Y}}')).toBe('1')
    })

    it('falls one year short of the Gregorian mean year when the approximation is off', () => {
      expect(formatDuration(days(365), '{{Y}}', { useApproximateMonthAndYear: false })).toBe('0')
    })
  })

  describe('negative durations', () => {
    it('signs every part rather than the string as a whole', () => {
      expect(formatDuration(seconds(-90), '{{m}}:{{ss}}')).toBe('-1:-30')
    })
  })
})

describe('getDurationParts', () => {
  describe('breakdown', () => {
    it('cascades the remainder from each unit down to the next', () => {
      expect(getDurationParts(days(400), { units: ['Y', 'd'] })).toMatchObject({
        Y: 1,
        M: 0,
        w: 0,
        d: 35,
        h: 0,
        m: 0,
        s: 0,
        ms: 0
      })
    })

    it('orders the units itself, whatever order they are given in', () => {
      expect(getDurationParts(3725000, { units: ['s', 'h', 'm'] })).toMatchObject({ h: 1, m: 2, s: 5 })
    })

    it('ignores a unit listed twice', () => {
      expect(getDurationParts(3725000, { units: ['h', 'm', 's', 'h'] })).toMatchObject({ h: 1, m: 2, s: 5 })
    })

    it('reaches every part under its readable name too', () => {
      const parts = getDurationParts(3725000, { units: ['h', 'm', 's'] })
      expect(parts).toMatchObject({
        hours: parts.h,
        minutes: parts.m,
        seconds: parts.s,
        milliseconds: parts.ms,
        days: parts.d,
        weeks: parts.w,
        months: parts.M,
        years: parts.Y
      })
    })
  })

  describe('units left out', () => {
    it('puts the whole duration, fraction included, on the largest unit it reaches', () => {
      const parts = getDurationParts(days(400))
      expect(parts.Y).toBeCloseTo(1.0959, 4)
      expect(parts.d).toBe(0)
    })

    it('picks the unit off the duration, not off the largest one that exists', () => {
      expect(getDurationParts(90000).m).toBe(1.5)
      expect(getDurationParts(500).ms).toBe(500)
    })

    it('falls back to milliseconds for a duration shorter than one', () => {
      expect(getDurationParts(0.5)).toMatchObject({ ms: 0.5, s: 0 })
    })

    it('leaves every part at zero for a zero duration', () => {
      expect(getDurationParts(0)).toMatchObject({
        Y: 0, M: 0, w: 0, d: 0, h: 0, m: 0, s: 0, ms: 0
      })
    })
  })

  describe('floorSmallestUnit', () => {
    it('leaves the remainder on the smallest unit by default', () => {
      expect(getDurationParts(119600, { units: ['m', 's'] })).toMatchObject({ m: 1, s: 59.6 })
    })

    it('truncates the whole duration, so the missing fraction leaves every part', () => {
      expect(getDurationParts(119600, { units: ['m', 's'], floorSmallestUnit: true })).toMatchObject({ m: 1, s: 59 })
    })

    it('rounds off the floating-point dust the cascade leaves behind', () => {
      // 30 days on ['M', 'd'] divides exactly, but only in decimal.
      expect(getDurationParts(30 * DAY, { units: ['M', 'd'], floorSmallestUnit: true })).toMatchObject({ M: 1, d: 0 })
    })
  })

  describe('month and year approximation', () => {
    it('uses 30-day months and 365-day years by default', () => {
      expect(getDurationParts(365 * DAY, { units: ['Y', 'd'] })).toMatchObject({ Y: 1, d: 0 })
      expect(getDurationParts(30 * DAY, { units: ['M', 'd'] })).toMatchObject({ M: 1, d: 0 })
    })

    it('uses the Gregorian mean year when the approximation is off', () => {
      expect(getDurationParts(365 * DAY, {
        units: ['Y', 'd'],
        useApproximateMonthAndYear: false
      })).toMatchObject({ Y: 0, d: 365 })
      expect(getDurationParts(30 * DAY, {
        units: ['M'],
        useApproximateMonthAndYear: false
      }).M).toBeCloseTo(0.9856, 4)
    })
  })

  describe('negative durations', () => {
    it('breaks the magnitude down, then negates every part', () => {
      expect(getDurationParts(seconds(-90), { units: ['m', 's'] })).toMatchObject({ m: -1, s: -30 })
    })

    it('leaves an empty part at zero rather than at negative zero', () => {
      const parts = getDurationParts(-30000, { units: ['m', 's'] })
      expect(Object.is(parts.m, 0)).toBe(true)
      expect(parts.s).toBe(-30)
    })
  })
})
