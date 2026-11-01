import { describe, it, expect } from 'vitest'
import { inferDate } from './index.js'

// Thursday, January 1st 2026, 15:05:09.042 — a Thursday on purpose, so that
// `next thursday` has to step over today.
const reference = new Date(2026, 0, 1, 15, 5, 9, 42)

function infer (raw: string, locale = 'en'): Date | null {
  return inferDate(raw, locale, { reference })
}

describe('inferDate', () => {
  describe('day anchors', () => {
    it('reads a named day as that day at midnight', () => {
      expect(infer('today')).toEqual(new Date(2026, 0, 1))
      expect(infer('tomorrow')).toEqual(new Date(2026, 0, 2))
      expect(infer('yesterday')).toEqual(new Date(2025, 11, 31))
    })

    it('reads now as the reference itself', () => {
      expect(infer('now')).toEqual(reference)
    })
  })

  describe('offsets', () => {
    it('keeps the time of day', () => {
      expect(infer('in 3 days')).toEqual(new Date(2026, 0, 4, 15, 5, 9, 42))
      expect(infer('3 days ago')).toEqual(new Date(2025, 11, 29, 15, 5, 9, 42))
      expect(infer('two weeks ago')).toEqual(new Date(2025, 11, 18, 15, 5, 9, 42))
    })

    it('counts a fraction of a unit', () => {
      expect(infer('in half an hour')).toEqual(new Date(2026, 0, 1, 15, 35, 9, 42))
    })

    it('takes a unit under any of its spellings', () => {
      expect(infer('in 3 d')).toEqual(new Date(2026, 0, 4, 15, 5, 9, 42))
      expect(infer('in 3 hrs')).toEqual(new Date(2026, 0, 1, 18, 5, 9, 42))
    })

    it('reads from now as a sign of its own', () => {
      expect(infer('3 days from now')).toEqual(new Date(2026, 0, 4, 15, 5, 9, 42))
      expect(infer('3 days later')).toEqual(new Date(2026, 0, 4, 15, 5, 9, 42))
    })

    it('drops a quantity nobody signed', () => {
      expect(infer('3 days')).toBeNull()
    })
  })

  describe('calendar steps', () => {
    it('moves by one unit and says nothing about the time', () => {
      expect(infer('next week')).toEqual(new Date(2026, 0, 8, 15, 5, 9, 42))
      expect(infer('last month')).toEqual(new Date(2025, 11, 1, 15, 5, 9, 42))
      expect(infer('next year')).toEqual(new Date(2027, 0, 1, 15, 5, 9, 42))
    })
  })

  describe('seeks', () => {
    it('never lands back on where it started', () => {
      expect(infer('next thursday')).toEqual(new Date(2026, 0, 8))
      expect(infer('last december')).toEqual(new Date(2025, 11, 1))
    })

    it('includes today when asked for this one', () => {
      expect(infer('this thursday')).toEqual(new Date(2026, 0, 1))
    })

    it('looks backwards on last', () => {
      expect(infer('last friday')).toEqual(new Date(2025, 11, 26))
    })

    it('seeks a bare weekday, today included', () => {
      expect(infer('friday')).toEqual(new Date(2026, 0, 2))
      expect(infer('thursday')).toEqual(new Date(2026, 0, 1))
    })

    it('sets a bare month in the reference year rather than seeking it', () => {
      expect(infer('december')).toEqual(new Date(2026, 11, 1))
      expect(infer('next december')).toEqual(new Date(2026, 11, 1))
    })
  })

  describe('calendar dates', () => {
    it('reads a day, a month and a year in any order', () => {
      expect(infer('january 6th 2019')).toEqual(new Date(2019, 0, 6))
      expect(infer('6 january')).toEqual(new Date(2026, 0, 6))
      expect(infer('the 6th')).toEqual(new Date(2026, 0, 6))
    })

    it('reads a year alone as the first instant of it', () => {
      expect(infer('2019')).toEqual(new Date(2019, 0, 1))
    })

    it('reads a month by its short name', () => {
      expect(infer('dec 2019')).toEqual(new Date(2019, 11, 1))
    })

    it('reads a numeric date whole, rather than as loose numbers', () => {
      expect(infer('2026-03-14')).toEqual(new Date(2026, 2, 14))
    })
  })

  describe('clock times', () => {
    it('reads a clock, with or without a meridiem', () => {
      expect(infer('9:20pm')).toEqual(new Date(2026, 0, 1, 21, 20))
      expect(infer('21:20')).toEqual(new Date(2026, 0, 1, 21, 20))
      expect(infer('12:30 am')).toEqual(new Date(2026, 0, 1, 0, 30))
    })

    it('reads an hour on its own', () => {
      expect(infer('9pm')).toEqual(new Date(2026, 0, 1, 21))
      expect(infer('at 9')).toEqual(new Date(2026, 0, 1, 9))
    })

    it('keeps the seconds a clock names', () => {
      expect(infer('9:20:30')).toEqual(new Date(2026, 0, 1, 9, 20, 30))
    })

    it('reads a named time at its agreed hour', () => {
      expect(infer('midnight')).toEqual(new Date(2026, 0, 1, 0))
      expect(infer('noon')).toEqual(new Date(2026, 0, 1, 12))
      expect(infer('tonight')).toEqual(new Date(2026, 0, 1, 20))
      expect(infer('tomorrow morning')).toEqual(new Date(2026, 0, 2, 8))
    })
  })

  describe('compounds', () => {
    it('folds a seek and a time', () => {
      expect(infer('next thursday at 9:20pm')).toEqual(new Date(2026, 0, 8, 21, 20))
    })

    it('folds an offset and a time', () => {
      expect(infer('in 3 days, at midnight')).toEqual(new Date(2026, 0, 4, 0, 0))
    })

    it('does not care about the order', () => {
      expect(infer('9pm next thursday')).toEqual(new Date(2026, 0, 8, 21))
    })
  })

  describe('laxity', () => {
    it('skips the tokens it does not know', () => {
      expect(infer('please publish this tomorrow at 9pm')).toEqual(new Date(2026, 0, 2, 21))
    })

    it('takes any separator, and any number of them', () => {
      expect(infer('in  3 days — at midnight')).toEqual(new Date(2026, 0, 4, 0, 0))
    })

    it('ignores case', () => {
      expect(infer('TOMORROW AT 9PM')).toEqual(new Date(2026, 0, 2, 21))
    })

    it('lets the later of two tokens win a part', () => {
      expect(infer('january february')).toEqual(new Date(2026, 1, 1))
    })

    it('reads nothing out of a string that names no date', () => {
      expect(infer('hello world')).toBeNull()
      expect(infer('')).toBeNull()
    })
  })

  describe('locale', () => {
    it('reads month names in the locale it is given', () => {
      expect(infer('en décembre', 'fr')).toEqual(new Date(2026, 11, 1))
      expect(infer('décembre', 'en')).toBeNull()
    })
  })
})
