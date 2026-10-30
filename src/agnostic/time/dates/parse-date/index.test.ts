import { describe, it, expect } from 'vitest'
import { formatDate } from '../format-date/index.js'
import { parseDate } from './index.js'

// Thursday, January 1st 2026, 15:05:09.042 — the reference every test that leaves a
// part unnamed reads against, so none of them depends on the day it runs.
const reference = new Date(2026, 0, 1, 15, 5, 9, 42)

function parse (raw: string, format: string, locale = 'en'): Date | null {
  return parseDate(raw, format, locale, { reference })
}

describe('parseDate', () => {
  describe('template', () => {
    it('reads back what formatDate wrote', () => {
      expect(parse('2026-01-01 03:05 PM', '{{YYYY}}-{{MM}}-{{DD}} {{hh}}:{{mm}} {{A}}'))
        .toEqual(new Date(2026, 0, 1, 15, 5))
    })

    it('expects whatever sits outside the placeholders', () => {
      expect(parse('le 1 janvier 2026', 'le {{D}} {{MMMM}} {{YYYY}}', 'fr'))
        .toEqual(new Date(2026, 0, 1))
    })

    it('refuses a string the template does not fit', () => {
      expect(parse('01/01/2026', '{{YYYY}}-{{MM}}-{{DD}}')).toBeNull()
    })

    it('refuses what the template does not account for', () => {
      expect(parse('2026-01-01 and then some', '{{YYYY}}-{{MM}}-{{DD}}')).toBeNull()
    })

    it('expects an unknown token as the literal formatDate left it', () => {
      expect(parse('{{ZZ}} 2026', '{{ZZ}} {{YYYY}}')).toEqual(new Date(2026, 0, 1))
    })
  })

  describe('padding', () => {
    it('reads the padded parts', () => {
      expect(parse('01 01 15 05 09 042', '{{DD}} {{MM}} {{HH}} {{mm}} {{ss}} {{ms}}'))
        .toEqual(new Date(2026, 0, 1, 15, 5, 9, 42))
    })

    it('lets a bare token read a padded part', () => {
      expect(parse('2026-01-01', '{{YYYY}}-{{M}}-{{D}}')).toEqual(new Date(2026, 0, 1))
    })

    it('requires two digits from a doubled token', () => {
      expect(parse('2026-1-1', '{{YYYY}}-{{MM}}-{{DD}}')).toBeNull()
    })

    it('reads a year written unpadded', () => {
      expect(parse('999-01-01', '{{YYYY}}-{{MM}}-{{DD}}')?.getFullYear()).toBe(999)
    })

    it('takes the strptime pivot on a two-digit year', () => {
      expect(parse('69', '{{YY}}')?.getFullYear()).toBe(1969)
      expect(parse('68', '{{YY}}')?.getFullYear()).toBe(2068)
    })
  })

  describe('names', () => {
    it('reads a month by its full name', () => {
      expect(parse('January 2026', '{{MMMM}} {{YYYY}}')).toEqual(new Date(2026, 0, 1))
      expect(parse('décembre 2026', '{{MMMM}} {{YYYY}}', 'fr')).toEqual(new Date(2026, 11, 1))
    })

    it('reads a month by its short name', () => {
      expect(parse('Mar 2026', '{{MMM}} {{YYYY}}')).toEqual(new Date(2026, 2, 1))
    })

    it('refuses a month name the locale has not got', () => {
      expect(parse('janvier 2026', '{{MMMM}} {{YYYY}}')).toBeNull()
    })

    it('matches a weekday name without letting it decide the date', () => {
      expect(parse('Monday 1 January 2026', '{{dddd}} {{D}} {{MMMM}} {{YYYY}}'))
        .toEqual(new Date(2026, 0, 1))
    })

    it('matches an ordinal suffix, and its absence', () => {
      expect(parse('January 1st 2026', '{{MMMM}} {{D}}{{th}} {{YYYY}}'))
        .toEqual(new Date(2026, 0, 1))
      expect(parse('janvier 2 2026', '{{MMMM}} {{D}}{{th}} {{YYYY}}', 'fr'))
        .toEqual(new Date(2026, 0, 2))
    })
  })

  describe('12-hour clock', () => {
    it('reads an afternoon hour off the meridiem', () => {
      expect(parse('03:05 PM', '{{hh}}:{{mm}} {{A}}')).toEqual(new Date(2026, 0, 1, 15, 5))
    })

    it('reads midnight and noon as 12', () => {
      expect(parse('12:30 AM', '{{hh}}:{{mm}} {{A}}')).toEqual(new Date(2026, 0, 1, 0, 30))
      expect(parse('12:30 PM', '{{hh}}:{{mm}} {{A}}')).toEqual(new Date(2026, 0, 1, 12, 30))
    })

    it('reads a 12-hour clock with no meridiem as the morning', () => {
      expect(parse('12:30', '{{h}}:{{mm}}')).toEqual(new Date(2026, 0, 1, 0, 30))
      expect(parse('3:30', '{{h}}:{{mm}}')).toEqual(new Date(2026, 0, 1, 3, 30))
    })

    it('refuses an hour a 12-hour clock cannot show', () => {
      expect(parse('13:30 PM', '{{hh}}:{{mm}} {{A}}')).toBeNull()
      expect(parse('00:30 AM', '{{hh}}:{{mm}} {{A}}')).toBeNull()
    })

    it('refuses the two clocks when they disagree, and takes them when they do not', () => {
      expect(parse('15 03PM', '{{HH}} {{hh}}{{A}}')).toEqual(new Date(2026, 0, 1, 15))
      expect(parse('15 04PM', '{{HH}} {{hh}}{{A}}')).toBeNull()
    })
  })

  describe('what the template leaves out', () => {
    it('reads a year alone as the first instant of it', () => {
      expect(parse('2019', '{{YYYY}}')).toEqual(new Date(2019, 0, 1, 0, 0, 0, 0))
    })

    it('reads a month alone as its first day', () => {
      expect(parse('2019-04', '{{YYYY}}-{{MM}}')).toEqual(new Date(2019, 3, 1, 0, 0, 0, 0))
    })

    it('reads a time alone against the reference day', () => {
      expect(parse('09:20', '{{HH}}:{{mm}}')).toEqual(new Date(2026, 0, 1, 9, 20, 0, 0))
    })

    it('fills a gap in the middle from the reference', () => {
      expect(parse('2019 06', '{{YYYY}} {{DD}}')).toEqual(new Date(2019, 0, 6, 0, 0, 0, 0))
    })

    it('refuses a template naming no part of a date', () => {
      expect(parse('Thursday', '{{dddd}}')).toBeNull()
      expect(parse('PM', '{{A}}')).toBeNull()
    })
  })

  describe('what cannot be a date', () => {
    it('refuses a day the month has not got', () => {
      expect(parse('2026-02-31', '{{YYYY}}-{{MM}}-{{DD}}')).toBeNull()
      expect(parse('2026-02-29', '{{YYYY}}-{{MM}}-{{DD}}')).toBeNull()
      expect(parse('2024-02-29', '{{YYYY}}-{{MM}}-{{DD}}')).toEqual(new Date(2024, 1, 29))
    })

    it('refuses a part out of range rather than rolling it over', () => {
      expect(parse('2026-13-01', '{{YYYY}}-{{MM}}-{{DD}}')).toBeNull()
      expect(parse('2026-00-01', '{{YYYY}}-{{MM}}-{{DD}}')).toBeNull()
      expect(parse('24:00', '{{HH}}:{{mm}}')).toBeNull()
      expect(parse('15:75', '{{HH}}:{{mm}}')).toBeNull()
    })

    it('refuses a part that contradicts itself', () => {
      expect(parse('1/01', '{{D}}/{{DD}}')).toEqual(new Date(2026, 0, 1))
      expect(parse('1/02', '{{D}}/{{DD}}')).toBeNull()
    })
  })

  describe('leniency', () => {
    it('ignores case', () => {
      expect(parse('1 JANUARY 2026 03:05 pm', '{{D}} {{MMMM}} {{YYYY}} {{hh}}:{{mm}} {{A}}'))
        .toEqual(new Date(2026, 0, 1, 15, 5))
    })

    it('takes any run of whitespace where the template has one', () => {
      expect(parse('  1   January   2026  ', '{{D}} {{MMMM}} {{YYYY}}'))
        .toEqual(new Date(2026, 0, 1))
    })

    it('still asks for the whitespace the template has', () => {
      expect(parse('1January2026', '{{D}} {{MMMM}} {{YYYY}}')).toBeNull()
    })
  })

  describe('round trip with formatDate', () => {
    const written = new Date(2026, 6, 4, 21, 20, 9, 42)
    // A template only names so much, so a round trip comes back as precise as the
    // template is — the expectation is the written date truncated to its finest part.
    const cases = [
      {
        template: '{{YYYY}}-{{MM}}-{{DD}} {{HH}}:{{mm}}:{{ss}}.{{ms}}',
        expected: written
      },
      {
        template: '{{dddd}} {{D}}{{th}} {{MMMM}} {{YYYY}}, {{h}}:{{mm}} {{a}}',
        expected: new Date(2026, 6, 4, 21, 20)
      },
      {
        template: '{{D}}/{{M}}/{{YY}}',
        expected: new Date(2026, 6, 4)
      }
    ]

    for (const { template, expected } of cases) {
      it(`reads back what formatDate writes with ${template}`, () => {
        const read = parseDate(formatDate(written, template), template, 'en', { reference: written })
        expect(read).toEqual(expected)
      })
    }
  })
})
