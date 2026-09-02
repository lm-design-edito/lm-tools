import { describe, it, expect } from 'vitest'
import { formatDate } from './index.js'
import { getDateParts } from './parts.js'

// Thursday, January 1st 2026, 15:05:09.042 — read in the runtime's own timezone,
// which is also the one the fixture is built in, so the tests hold anywhere.
const thursdayAfternoon = new Date(2026, 0, 1, 15, 5, 9, 42)

describe('formatDate', () => {
  describe('template', () => {
    it('fills a template with the parts of the date', () => {
      expect(formatDate(thursdayAfternoon, '{{YYYY}}-{{MM}}-{{DD}} {{hh}}:{{mm}} {{A}}'))
        .toBe('2026-01-01 03:05 PM')
    })

    it('keeps whatever sits outside the placeholders', () => {
      expect(formatDate(thursdayAfternoon, 'le {{D}} {{MMMM}} {{YYYY}}', 'fr'))
        .toBe('le 1 janvier 2026')
    })

    it('does not substitute a bare letter outside a placeholder', () => {
      expect(formatDate(thursdayAfternoon, 'D M Y {{D}}')).toBe('D M Y 1')
    })

    it('substitutes every occurrence of a repeated token', () => {
      expect(formatDate(thursdayAfternoon, '{{D}}/{{D}}')).toBe('1/1')
    })

    it('leaves an unknown token untouched, braces included', () => {
      expect(formatDate(thursdayAfternoon, '{{ZZ}} {{YYYY}}')).toBe('{{ZZ}} 2026')
    })
  })

  describe('padding', () => {
    it('pads the doubled tokens to two digits', () => {
      expect(formatDate(thursdayAfternoon, '{{DD}} {{MM}} {{HH}} {{hh}} {{mm}} {{ss}}'))
        .toBe('01 01 15 03 05 09')
    })

    it('leaves the bare twins unpadded', () => {
      expect(formatDate(thursdayAfternoon, '{{D}} {{M}} {{H}} {{h}} {{m}} {{s}}'))
        .toBe('1 1 15 3 5 9')
    })

    it('pads milliseconds to three digits', () => {
      expect(formatDate(thursdayAfternoon, '{{ms}}')).toBe('042')
    })

    it('truncates YY to the last two digits of the year', () => {
      expect(formatDate(thursdayAfternoon, '{{YY}}')).toBe('26')
    })
  })

  describe('12-hour clock', () => {
    it('writes midnight as 12 AM', () => {
      expect(formatDate(new Date(2026, 0, 1, 0, 30), '{{h}}:{{mm}} {{A}}')).toBe('12:30 AM')
    })

    it('writes noon as 12 PM', () => {
      expect(formatDate(new Date(2026, 0, 1, 12, 30), '{{h}}:{{mm}} {{A}}')).toBe('12:30 PM')
    })

    it('starts the afternoon back at 1', () => {
      expect(formatDate(new Date(2026, 0, 1, 13), '{{h}} {{a}}')).toBe('1 pm')
    })
  })

  describe('locales', () => {
    it('names the weekday and the month in English by default', () => {
      expect(formatDate(thursdayAfternoon, '{{dd}} {{d}} {{MMMM}} {{MMM}}'))
        .toBe('Thursday Thu January Jan')
    })

    it('names them in the requested locale', () => {
      expect(formatDate(thursdayAfternoon, '{{dd}} {{MMMM}}', 'fr')).toBe('jeudi janvier')
    })
  })

  describe('ordinal suffix', () => {
    it('follows the English rule', () => {
      const suffix = (day: number): string => formatDate(new Date(2026, 0, day), '{{D}}{{th}}')
      expect(suffix(1)).toBe('1st')
      expect(suffix(2)).toBe('2nd')
      expect(suffix(3)).toBe('3rd')
      expect(suffix(4)).toBe('4th')
      expect(suffix(21)).toBe('21st')
      expect(suffix(22)).toBe('22nd')
      expect(suffix(23)).toBe('23rd')
    })

    it('keeps the teens on th, where the last digit would say otherwise', () => {
      const suffix = (day: number): string => formatDate(new Date(2026, 0, day), '{{D}}{{th}}')
      expect(suffix(11)).toBe('11th')
      expect(suffix(12)).toBe('12th')
      expect(suffix(13)).toBe('13th')
    })

    it('marks only the 1st in French', () => {
      expect(formatDate(new Date(2026, 0, 1), '{{D}}{{th}}', 'fr')).toBe('1er')
      expect(formatDate(new Date(2026, 0, 2), '{{D}}{{th}}', 'fr')).toBe('2')
    })
  })
})

describe('getDateParts', () => {
  describe('quantities', () => {
    it('hands over plain numbers, unpadded', () => {
      expect(getDateParts(thursdayAfternoon)).toMatchObject({
        D: 1,
        M: 1,
        YYYY: 2026,
        H: 15,
        h: 3,
        m: 5,
        s: 9,
        ms: 42
      })
    })

    it('numbers the months from 1, where Date numbers them from 0', () => {
      expect(getDateParts(new Date(2026, 11, 25)).M).toBe(12)
    })

    it('reaches every part under its readable name too', () => {
      const parts = getDateParts(thursdayAfternoon)
      expect(parts).toMatchObject({
        dayOfMonth: parts.D,
        shortWeekdayName: parts.d,
        fullWeekdayName: parts.dd,
        monthNumber: parts.M,
        shortMonthName: parts.MMM,
        fullMonthName: parts.MMMM,
        year: parts.YYYY,
        hours24: parts.H,
        hours12: parts.h,
        minutes: parts.m,
        seconds: parts.s,
        milliseconds: parts.ms,
        upperCaseMeridiem: parts.A,
        lowerCaseMeridiem: parts.a,
        dayOrdinalSuffix: parts.th
      })
    })
  })

  describe('12-hour clock', () => {
    it('reads both midnight and noon as 12', () => {
      expect(getDateParts(new Date(2026, 0, 1, 0)).h).toBe(12)
      expect(getDateParts(new Date(2026, 0, 1, 12)).h).toBe(12)
    })

    it('splits the meridiem at noon', () => {
      expect(getDateParts(new Date(2026, 0, 1, 11, 59))).toMatchObject({ A: 'AM', a: 'am' })
      expect(getDateParts(new Date(2026, 0, 1, 12, 0))).toMatchObject({ A: 'PM', a: 'pm' })
    })
  })

  describe('locales', () => {
    it('localises the weekday and month names', () => {
      expect(getDateParts(thursdayAfternoon, 'fr')).toMatchObject({
        d: 'jeu.',
        dd: 'jeudi',
        MMM: 'janv.',
        MMMM: 'janvier'
      })
    })

    it('falls back to English on a locale the runtime does not support', () => {
      expect(getDateParts(thursdayAfternoon, 'xx')).toMatchObject({
        dd: 'Thursday',
        MMMM: 'January',
        th: 'st'
      })
    })

    it('leaves the ordinal suffix empty for a locale that has no rule here', () => {
      expect(getDateParts(thursdayAfternoon, 'es').th).toBe('')
    })
  })
})
