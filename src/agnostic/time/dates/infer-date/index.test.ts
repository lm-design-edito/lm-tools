import { describe, it, expect } from 'vitest'
import { inferDate } from './index.js'

// Thursday, January 1st 2026, 15:05:09.042 — a Thursday on purpose, so that `next
// thursday` has to step over today, and the first day of a year, so that `last december`
// has to step back over it.
const reference = new Date(2026, 0, 1, 15, 5, 9, 42)

// Wednesday, July 15th 2026, 10:30 — a second vantage point, in the middle of a month and
// of a year, for the forms whose answer is only interesting once they have a past.
const summer = new Date(2026, 6, 15, 10, 30)

function infer (raw: string, locale = 'en'): Date | null {
  return inferDate(raw, locale, { reference })
}

function inferFrom (point: Date, raw: string): Date | null {
  return inferDate(raw, 'en', { reference: point })
}

/** What a read could not use, flattened — the callback is called once or not at all. */
function ignoredBy (raw: string): string[] {
  const seen: string[] = []
  inferDate(raw, 'en', { reference, onIgnored: atoms => { seen.push(...atoms) } })
  return seen
}

describe('inferDate', () => {
  describe('the reference', () => {
    it('reads everything against the one it is given', () => {
      expect(inferFrom(summer, 'the end of the month')).toEqual(new Date(2026, 6, 31))
      expect(inferFrom(summer, 'in 3 days')).toEqual(new Date(2026, 6, 18, 10, 30))
      expect(inferFrom(summer, 'the 6th')).toEqual(new Date(2026, 6, 6))
    })

    it('falls back to the moment of the call', () => {
      const read = inferDate('today')
      expect(read?.toDateString()).toBe(new Date().toDateString())
      expect(read?.getHours()).toBe(0)
    })

    it('never writes to it', () => {
      const point = new Date(2026, 0, 1, 15, 5, 9, 42)
      inferDate('the last friday of july at 6pm', 'en', { reference: point })
      expect(point).toEqual(new Date(2026, 0, 1, 15, 5, 9, 42))
    })
  })

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
      expect(infer('in 1.5 hours')).toEqual(new Date(2026, 0, 1, 16, 35, 9, 42))
    })

    it('counts a trailing fraction in the unit before it', () => {
      expect(infer('in an hour and a half')).toEqual(new Date(2026, 0, 1, 16, 35, 9, 42))
      expect(infer('a day and a half from now')).toEqual(new Date(2026, 0, 3, 3, 5, 9, 42))
      expect(infer('1.5 days ago')).toEqual(new Date(2025, 11, 31, 3, 5, 9, 42))
    })

    it('takes a unit under any of its spellings', () => {
      expect(infer('in 3 d')).toEqual(new Date(2026, 0, 4, 15, 5, 9, 42))
      expect(infer('in 3 hrs')).toEqual(new Date(2026, 0, 1, 18, 5, 9, 42))
      expect(infer('in 36 hours')).toEqual(new Date(2026, 0, 3, 3, 5, 9, 42))
    })

    it('reads from now as a sign of its own', () => {
      expect(infer('3 days from now')).toEqual(new Date(2026, 0, 4, 15, 5, 9, 42))
      expect(infer('3 days later')).toEqual(new Date(2026, 0, 4, 15, 5, 9, 42))
      expect(infer('3 days hence')).toEqual(new Date(2026, 0, 4, 15, 5, 9, 42))
    })

    it('walks the calendar rather than the milliseconds', () => {
      expect(infer('in a month')).toEqual(new Date(2026, 1, 1, 15, 5, 9, 42))
      expect(infer('in 2 months')).toEqual(new Date(2026, 2, 1, 15, 5, 9, 42))
      expect(infer('in a year')).toEqual(new Date(2027, 0, 1, 15, 5, 9, 42))
    })

    it('drops a quantity nobody signed', () => {
      expect(infer('3 days')).toBeNull()
      expect(infer('in 2.5')).toBeNull()
    })
  })

  describe('calendar steps', () => {
    it('moves by one unit and says nothing about the time', () => {
      expect(infer('next week')).toEqual(new Date(2026, 0, 8, 15, 5, 9, 42))
      expect(infer('last month')).toEqual(new Date(2025, 11, 1, 15, 5, 9, 42))
      expect(infer('next month')).toEqual(new Date(2026, 1, 1, 15, 5, 9, 42))
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
      expect(inferFrom(summer, 'january')).toEqual(new Date(2026, 0, 1))
      expect(inferFrom(summer, 'next january')).toEqual(new Date(2027, 0, 1))
    })
  })

  describe('calendar dates', () => {
    it('reads a day, a month and a year in any order', () => {
      expect(infer('january 6th 2019')).toEqual(new Date(2019, 0, 6))
      expect(infer('6 january')).toEqual(new Date(2026, 0, 6))
      expect(infer('the 6th')).toEqual(new Date(2026, 0, 6))
      expect(infer('january 6, 2019')).toEqual(new Date(2019, 0, 6))
      expect(infer('2019 january 6')).toEqual(new Date(2019, 0, 6))
    })

    it('reads a year alone as the first instant of it', () => {
      expect(infer('2019')).toEqual(new Date(2019, 0, 1))
    })

    it('reads a month by its short name', () => {
      expect(infer('dec 2019')).toEqual(new Date(2019, 11, 1))
      expect(infer('6 jan 2019')).toEqual(new Date(2019, 0, 6))
    })

    it('clamps a day the month has not got', () => {
      expect(infer('the 29th of february')).toEqual(new Date(2026, 1, 28))
      expect(infer('the 29th of february 2028')).toEqual(new Date(2028, 1, 29))
    })
  })

  describe('a date in digits', () => {
    it('reads three parts whole, rather than as loose numbers', () => {
      expect(infer('2026-03-14')).toEqual(new Date(2026, 2, 14))
      expect(infer('14/03/2026')).toEqual(new Date(2026, 2, 14))
      expect(infer('14-03-2026')).toEqual(new Date(2026, 2, 14))
      expect(infer('14.03.2026')).toEqual(new Date(2026, 2, 14))
    })

    it('takes the order from the head, and reads day first otherwise', () => {
      expect(infer('2026/03/14')).toEqual(new Date(2026, 2, 14))
      expect(infer('2026.3.4')).toEqual(new Date(2026, 2, 4))
      expect(infer('14/3/26')).toEqual(new Date(2026, 2, 14))
    })

    it('pivots a year written in two digits', () => {
      expect(infer('14/03/26')).toEqual(new Date(2026, 2, 14))
      expect(infer('14/03/69')).toEqual(new Date(1969, 2, 14))
      expect(infer('14/03/68')).toEqual(new Date(2068, 2, 14))
    })

    it('reports a date that is impossible read day first', () => {
      expect(infer('03/14/2026')).toBeNull()
      expect(ignoredBy('03/14/2026')).toEqual(['03/14/2026'])
    })

    it('reads two parts as a month, or as a day of this year', () => {
      expect(infer('2026-03')).toEqual(new Date(2026, 2, 1))
      expect(infer('3/2026')).toEqual(new Date(2026, 2, 1))
      expect(infer('14/03')).toEqual(new Date(2026, 2, 14))
    })

    it('clamps rather than rolling over', () => {
      expect(infer('31/02/2026')).toEqual(new Date(2026, 1, 28))
    })
  })

  describe('clock times', () => {
    it('reads a clock, with or without a meridiem', () => {
      expect(infer('9:20pm')).toEqual(new Date(2026, 0, 1, 21, 20))
      expect(infer('21:20')).toEqual(new Date(2026, 0, 1, 21, 20))
      expect(infer('12:30 am')).toEqual(new Date(2026, 0, 1, 0, 30))
      expect(infer('09:20')).toEqual(new Date(2026, 0, 1, 9, 20))
    })

    it('reads an hour on its own', () => {
      expect(infer('9pm')).toEqual(new Date(2026, 0, 1, 21))
      expect(infer('at 9')).toEqual(new Date(2026, 0, 1, 9))
      expect(infer('at 0')).toEqual(new Date(2026, 0, 1, 0))
    })

    it('reads the two noons the way the clock says', () => {
      expect(infer('12pm')).toEqual(new Date(2026, 0, 1, 12))
      expect(infer('12am')).toEqual(new Date(2026, 0, 1, 0))
    })

    it('keeps the seconds a clock names', () => {
      expect(infer('9:20:30')).toEqual(new Date(2026, 0, 1, 9, 20, 30))
    })

    it('refuses a clock that is not a time', () => {
      expect(infer('25:00')).toBeNull()
      expect(infer('9:70')).toBeNull()
      expect(ignoredBy('25:00')).toEqual(['25:00'])
    })
  })

  describe('the compact clock', () => {
    it('reads an hour written with an h', () => {
      expect(infer('21h30')).toEqual(new Date(2026, 0, 1, 21, 30))
      expect(infer('9h30')).toEqual(new Date(2026, 0, 1, 9, 30))
      expect(infer('9h30min20sec')).toEqual(new Date(2026, 0, 1, 9, 30, 20))
    })

    it('settles a bare 9h on the sign in front of it', () => {
      expect(infer('9h')).toEqual(new Date(2026, 0, 1, 9))
      expect(infer('at 9h')).toEqual(new Date(2026, 0, 1, 9))
      expect(infer('in 9h')).toEqual(new Date(2026, 0, 2, 0, 5, 9, 42))
    })

    it('reads a number as an hour when at has already said so', () => {
      expect(infer('at 9 h')).toEqual(new Date(2026, 0, 1, 9))
    })
  })

  describe('a clock to the millisecond, and its zone', () => {
    it('reads the fraction of a second, padded to the right', () => {
      expect(infer('09:20:05.123')).toEqual(new Date(2026, 0, 1, 9, 20, 5, 123))
      expect(infer('09:20:05,12')).toEqual(new Date(2026, 0, 1, 9, 20, 5, 120))
      expect(infer('09:20:05.5')).toEqual(new Date(2026, 0, 1, 9, 20, 5, 500))
    })

    it('reads a whole ISO instant, its T included', () => {
      expect(infer('2026-03-14T09:20:05.123')).toEqual(new Date(2026, 2, 14, 9, 20, 5, 123))
      expect(ignoredBy('2026-03-14T09:20:05.123')).toEqual([])
    })

    it('reports a zone instead of honouring it, and keeps the wall clock', () => {
      expect(infer('2026-03-14T09:20:05Z')).toEqual(new Date(2026, 2, 14, 9, 20, 5))
      expect(ignoredBy('2026-03-14T09:20:05Z')).toEqual(['z'])
      expect(infer('2026-03-14T09:20+02:00')).toEqual(new Date(2026, 2, 14, 9, 20))
      expect(ignoredBy('2026-03-14T09:20+02:00')).toEqual(['+02:00'])
      expect(ignoredBy('2026-03-14T09:20-0500')).toEqual(['-0500'])
    })
  })

  describe('named times of day', () => {
    it('reads one at its agreed hour', () => {
      expect(infer('midnight')).toEqual(new Date(2026, 0, 1, 0))
      expect(infer('noon')).toEqual(new Date(2026, 0, 1, 12))
      expect(infer('midday')).toEqual(new Date(2026, 0, 1, 12))
      expect(infer('afternoon')).toEqual(new Date(2026, 0, 1, 14))
      expect(infer('evening')).toEqual(new Date(2026, 0, 1, 20))
      expect(infer('tonight')).toEqual(new Date(2026, 0, 1, 20))
    })

    it('moves the day a direction belongs to', () => {
      expect(infer('last night')).toEqual(new Date(2025, 11, 31, 20))
      expect(infer('next morning')).toEqual(new Date(2026, 0, 2, 8))
      expect(infer('this morning')).toEqual(new Date(2026, 0, 1, 8))
      expect(infer('tomorrow morning')).toEqual(new Date(2026, 0, 2, 8))
    })

    it('lets a clock after it win', () => {
      expect(infer('tonight at 11pm')).toEqual(new Date(2026, 0, 1, 23))
    })
  })

  describe('same time', () => {
    it('names the reference clock, so a named day does not collapse it', () => {
      expect(infer('same time tomorrow')).toEqual(new Date(2026, 0, 2, 15, 5, 9, 42))
      expect(infer('tomorrow same time')).toEqual(new Date(2026, 0, 2, 15, 5, 9, 42))
      expect(infer('this time next week')).toEqual(new Date(2026, 0, 8, 15, 5, 9, 42))
      expect(infer('next friday at the same time')).toEqual(new Date(2026, 0, 2, 15, 5, 9, 42))
    })
  })

  describe('the named days of the year', () => {
    it('reads one as the occurrence ahead, today included', () => {
      expect(infer('christmas')).toEqual(new Date(2026, 11, 25))
      expect(infer('halloween')).toEqual(new Date(2026, 9, 31))
      expect(infer('all saints')).toEqual(new Date(2026, 10, 1))
      expect(infer('new year')).toEqual(new Date(2026, 0, 1))
    })

    it('steps a year rather than looking backwards', () => {
      expect(inferFrom(summer, 'christmas')).toEqual(new Date(2026, 11, 25))
      expect(inferFrom(summer, 'easter')).toEqual(new Date(2027, 2, 28))
      expect(inferFrom(summer, 'last easter')).toEqual(new Date(2026, 3, 5))
    })

    it('takes a phrase, a possessive and a trailing day', () => {
      expect(infer("new year's day")).toEqual(new Date(2026, 0, 1))
      expect(infer('christmas day')).toEqual(new Date(2026, 11, 25))
      expect(infer("valentine's day")).toEqual(new Date(2026, 1, 14))
      expect(infer("all saints' day")).toEqual(new Date(2026, 10, 1))
      expect(infer('may day')).toEqual(new Date(2026, 4, 1))
      expect(infer('bastille day')).toEqual(new Date(2026, 6, 14))
    })

    it('steps a year on a direction, and stays on the reference year for this', () => {
      expect(infer('last christmas')).toEqual(new Date(2025, 11, 25))
      expect(infer('this christmas')).toEqual(new Date(2026, 11, 25))
      expect(infer('next new year')).toEqual(new Date(2027, 0, 1))
    })

    it('computes easter and what hangs off it', () => {
      expect(infer('easter')).toEqual(new Date(2026, 3, 5))
      expect(infer('palm sunday')).toEqual(new Date(2026, 2, 29))
      expect(infer('good friday')).toEqual(new Date(2026, 3, 3))
      expect(infer('easter monday')).toEqual(new Date(2026, 3, 6))
      expect(infer('ascension')).toEqual(new Date(2026, 4, 14))
      expect(infer('pentecost')).toEqual(new Date(2026, 4, 24))
    })

    it('reads an eve as the evening before', () => {
      expect(infer('christmas eve')).toEqual(new Date(2026, 11, 24, 20))
      expect(infer("new year's eve")).toEqual(new Date(2026, 11, 31, 20))
    })

    it('composes with the rest of the vocabulary', () => {
      expect(infer('the friday before christmas')).toEqual(new Date(2026, 11, 18))
      expect(infer('2 days after christmas')).toEqual(new Date(2026, 11, 27))
      expect(infer('christmas + one week, on monday')).toEqual(new Date(2026, 11, 28))
      expect(infer('christmas at 9pm')).toEqual(new Date(2026, 11, 25, 21))
      expect(infer('the week after christmas')).toEqual(new Date(2027, 0, 1))
      expect(infer('two weeks before christmas')).toEqual(new Date(2026, 11, 11))
      expect(infer('the monday after easter')).toEqual(new Date(2026, 3, 6))
    })

    it('knows no holiday of one country alone', () => {
      expect(infer('thanksgiving')).toBeNull()
      expect(infer('veterans day')).toBeNull()
    })
  })

  describe('the ends of a period', () => {
    it('names one in a word', () => {
      expect(infer('the end of july')).toEqual(new Date(2026, 6, 31))
      expect(infer('end of july')).toEqual(new Date(2026, 6, 31))
      expect(infer('the beginning of july')).toEqual(new Date(2026, 6, 1))
      expect(infer('the start of 2019')).toEqual(new Date(2019, 0, 1))
      expect(infer('the end of february 2028')).toEqual(new Date(2028, 1, 29))
    })

    it('takes the period from a unit no number reached', () => {
      expect(infer('the end of the month')).toEqual(new Date(2026, 0, 31))
      expect(infer('the end of this month')).toEqual(new Date(2026, 0, 31))
      expect(infer('the end of next month')).toEqual(new Date(2026, 1, 28))
      expect(infer('the end of the year')).toEqual(new Date(2026, 11, 31))
      expect(infer('the beginning of next year')).toEqual(new Date(2027, 0, 1))
    })

    it('reports a period it has no reading for', () => {
      expect(ignoredBy('the end of the week')).toEqual(['week'])
    })

    it('keeps a clock named on the way', () => {
      expect(infer('the end of the month at 6pm')).toEqual(new Date(2026, 0, 31, 18))
      expect(infer('the last day of july at 6pm')).toEqual(new Date(2026, 6, 31, 18))
      expect(infer('the last friday of july at 6pm')).toEqual(new Date(2026, 6, 31, 18))
    })
  })

  describe('counting inside the period an operator names', () => {
    // July 2026 opens on a Wednesday, so its Fridays are the 3rd, 10th, 17th, 24th and
    // 31st — the last one being the month's own last day.
    it('counts a weekday from the end of the period when asked for the last', () => {
      expect(infer('the last friday of july')).toEqual(new Date(2026, 6, 31))
      expect(infer('the last friday of 2019')).toEqual(new Date(2019, 11, 27))
    })

    it('counts a weekday from the start of the period otherwise', () => {
      expect(infer('the first friday of july')).toEqual(new Date(2026, 6, 3))
      expect(infer('the second friday of july')).toEqual(new Date(2026, 6, 10))
      expect(infer('the 2nd friday of july')).toEqual(new Date(2026, 6, 10))
      expect(infer('the first friday of 2019')).toEqual(new Date(2019, 0, 4))
    })

    it('names one end of the period with a bare day', () => {
      expect(infer('the last day of july')).toEqual(new Date(2026, 6, 31))
      expect(infer('the first day of july')).toEqual(new Date(2026, 6, 1))
      expect(infer('the last day of 2019')).toEqual(new Date(2019, 11, 31))
      expect(infer('the last day of february')).toEqual(new Date(2026, 1, 28))
    })

    it('reads a weekday the way the operator after it points', () => {
      // The 20th of January 2026 is a Tuesday.
      expect(infer('the friday before the 20th')).toEqual(new Date(2026, 0, 16))
      expect(infer('the friday after the 20th')).toEqual(new Date(2026, 0, 23))
    })

    it('falls back to an ordinary seek with no period to count in', () => {
      expect(infer('the last friday')).toEqual(new Date(2025, 11, 26))
    })

    it('keeps an offset that lands outside the period', () => {
      // The period is collapsed before the left-hand side acts, and not collapsed again
      // after — or the two days would be undone by July's own first instant.
      expect(infer('2 days after july')).toEqual(new Date(2026, 6, 3))
    })

    it('counts inside a period a step named', () => {
      // February 2026 opens on a Sunday.
      expect(infer('the first monday of next month')).toEqual(new Date(2026, 1, 2))
      expect(infer('the first monday of next month at 9am')).toEqual(new Date(2026, 1, 2, 9))
      expect(infer('the last day of next month')).toEqual(new Date(2026, 1, 28))
    })
  })

  describe('after, before, from and of', () => {
    it('resolves the right-hand side first, then applies the left', () => {
      expect(infer('2 days after next friday')).toEqual(new Date(2026, 0, 4))
      expect(infer('2 days before 2026-03-14')).toEqual(new Date(2026, 2, 12))
      expect(infer('3 days from monday')).toEqual(new Date(2026, 0, 8))
      expect(infer('2 weeks from monday')).toEqual(new Date(2026, 0, 19))
    })

    it('reads a bare unit in front of an operator as one of it', () => {
      expect(infer('the day after tomorrow')).toEqual(new Date(2026, 0, 3))
      expect(infer('the day before yesterday')).toEqual(new Date(2025, 11, 30))
    })

    it('places a day of the month inside the period that follows', () => {
      expect(infer('the 1st of next month')).toEqual(new Date(2026, 1, 1))
      expect(infer('the 6th of january')).toEqual(new Date(2026, 0, 6))
    })

    it('reads a day of the month spelt out', () => {
      expect(infer('the first of next month')).toEqual(new Date(2026, 1, 1))
      expect(infer('the second of next month')).toEqual(new Date(2026, 1, 2))
    })

    it('keeps second a unit when a quantity precedes it', () => {
      expect(infer('in a second')).toEqual(new Date(2026, 0, 1, 15, 5, 10, 42))
    })

    it('clamps a day the month has not got rather than rolling over', () => {
      expect(infer('the 31st of next month')).toEqual(new Date(2026, 1, 28))
    })

    it('reports an operator with nothing on its left', () => {
      expect(infer('before 2019')).toEqual(new Date(2019, 0, 1))
      expect(ignoredBy('before 2019')).toEqual(['before'])
    })
  })

  describe('a weekday against what has already been placed', () => {
    it('reads forward when nothing has established a date', () => {
      expect(infer('on monday')).toEqual(new Date(2026, 0, 5))
      expect(infer('monday')).toEqual(new Date(2026, 0, 5))
    })

    it('scopes to the week of a date another token established', () => {
      // Saturday the 14th of March, whose ISO week opens on Monday the 9th.
      expect(infer('2026-03-14 on monday')).toEqual(new Date(2026, 2, 9))
      expect(infer('2026-03-14 on sunday')).toEqual(new Date(2026, 2, 15))
      expect(infer('the 6th on monday')).toEqual(new Date(2026, 0, 5))
    })

    it('does not count a time of day as a date', () => {
      expect(infer('9pm on monday')).toEqual(new Date(2026, 0, 5, 21))
    })

    it('lets an explicit direction win over both readings', () => {
      expect(infer('2026-03-14 next monday')).toEqual(new Date(2026, 2, 16))
    })

    it('opens the week where the caller says', () => {
      // Saturday the 14th. Under ISO the week's Sunday is the 15th, the day after;
      // where a week opens on Sunday it is the 8th, the week's own first day.
      const onSunday = { reference, weekStartsOn: 7 } as const
      expect(inferDate('2026-03-14 on sunday', 'en', onSunday)).toEqual(new Date(2026, 2, 8))
      expect(infer('2026-03-14 on sunday')).toEqual(new Date(2026, 2, 15))
      // Sunday the 4th of January, the last day of a week that opened on December 29th.
      expect(infer('2026-01-04 on monday')).toEqual(new Date(2025, 11, 29))
      expect(inferDate('2026-01-04 on monday', 'en', onSunday)).toEqual(new Date(2026, 0, 5))
    })
  })

  describe('a weekend', () => {
    it('reads as its saturday', () => {
      expect(infer('this weekend')).toEqual(new Date(2026, 0, 3))
      expect(infer('last weekend')).toEqual(new Date(2025, 11, 27))
      expect(infer('next weekend at 9pm')).toEqual(new Date(2026, 0, 3, 21))
      expect(inferFrom(summer, 'next weekend')).toEqual(new Date(2026, 6, 18))
      expect(infer('the last weekend of july')).toEqual(new Date(2026, 6, 25))
    })
  })

  describe('signs', () => {
    it('carries one sign across the whole string', () => {
      expect(infer('in 2 days and 3 hours')).toEqual(new Date(2026, 0, 3, 18, 5, 9, 42))
      expect(infer('in 1 week and 2 days')).toEqual(new Date(2026, 0, 10, 15, 5, 9, 42))
    })

    it('reaches backwards from a postfix sign', () => {
      expect(infer('2 days and 3 hours ago')).toEqual(new Date(2025, 11, 30, 12, 5, 9, 42))
    })

    it('takes plus and minus, written or spelt', () => {
      expect(infer('next friday + 2 days')).toEqual(new Date(2026, 0, 4))
      expect(infer('next friday plus 2 days')).toEqual(new Date(2026, 0, 4))
      expect(infer('next friday - 2 days')).toEqual(new Date(2025, 11, 31))
      expect(infer('monday - 2 days')).toEqual(new Date(2026, 0, 3))
      expect(infer('in -10 days')).toEqual(new Date(2025, 11, 22, 15, 5, 9, 42))
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
      expect(infer('midnight tomorrow')).toEqual(new Date(2026, 0, 2, 0))
    })

    it('folds a date in digits and a time', () => {
      expect(infer('2026-03-14 09:20')).toEqual(new Date(2026, 2, 14, 9, 20))
      expect(infer('14/03/2026 at 9pm')).toEqual(new Date(2026, 2, 14, 21))
    })
  })

  describe('laxity', () => {
    it('skips the tokens it does not know', () => {
      expect(infer('please publish this tomorrow at 9pm')).toEqual(new Date(2026, 0, 2, 21))
      expect(ignoredBy('please publish this tomorrow at 9pm')).toEqual(['please', 'publish'])
    })

    it('takes any separator, and any number of them', () => {
      expect(infer('in  3 days — at midnight')).toEqual(new Date(2026, 0, 4, 0, 0))
    })

    it('ignores case', () => {
      expect(infer('TOMORROW AT 9PM')).toEqual(new Date(2026, 0, 2, 21))
    })

    it('lets the later of two tokens win a part', () => {
      expect(infer('january february')).toEqual(new Date(2026, 1, 1))
      expect(infer('at 9pm at 10pm')).toEqual(new Date(2026, 0, 1, 22))
      expect(infer('january 6th, march 3rd')).toEqual(new Date(2026, 2, 3))
    })

    it('reads nothing out of a string that names no date', () => {
      expect(infer('hello world')).toBeNull()
      expect(infer('')).toBeNull()
    })
  })

  describe('onIgnored', () => {
    it('hands over what the read could not use, without changing the answer', () => {
      const ignored: string[][] = []
      const read = inferDate('the 3rd quarter', 'en', {
        reference,
        onIgnored: atoms => { ignored.push(atoms) }
      })
      expect(read).toEqual(new Date(2026, 0, 3))
      expect(ignored).toEqual([['quarter']])
    })

    it('reports a quantity no sign ever reached', () => {
      expect(infer('3 days')).toBeNull()
      expect(ignoredBy('3 days')).toEqual(['3', 'days'])
    })

    it('says nothing of the words a sentence is held together with', () => {
      expect(ignoredBy('the 6th of january')).toEqual([])
      expect(ignoredBy('in an hour and a half')).toEqual([])
    })

    it('stays silent when everything landed', () => {
      const ignored: string[][] = []
      inferDate('next thursday at 9:20pm', 'en', {
        reference,
        onIgnored: atoms => { ignored.push(atoms) }
      })
      expect(ignored).toEqual([])
    })

    it('reports a part out of range', () => {
      expect(ignoredBy('the 32nd')).toEqual(['32nd'])
      expect(ignoredBy('2026-13-01')).toEqual(['2026-13-01'])
    })
  })

  describe('locale', () => {
    it('reads month names in the locale it is given', () => {
      expect(infer('en décembre', 'fr')).toEqual(new Date(2026, 11, 1))
      expect(infer('6 décembre 2019', 'fr')).toEqual(new Date(2019, 11, 6))
      expect(infer('décembre', 'en')).toBeNull()
    })

    it('reads weekday names in it too', () => {
      expect(infer('lundi', 'fr')).toEqual(new Date(2026, 0, 5))
    })

    it('falls back to english on a locale the runtime does not know', () => {
      expect(infer('december', 'xx')).toEqual(new Date(2026, 11, 1))
    })
  })

  describe('never throwing', () => {
    const junk = [
      '', '   ', '----', '////', '🎉', 'xx', 'in', 'of', 'ago', '+', '-', 'the of the',
      '2026-99-99', '99:99', '0/0/0', '31/13/2026', 'the 0th', '32nd', '2026-13-01'
    ]

    for (const raw of junk) {
      it(`reads ${raw === '' ? 'an empty string' : raw} as nothing at all`, () => {
        expect(() => infer(raw)).not.toThrow()
        expect(infer(raw)).toBeNull()
      })
    }
  })

  // One line per string, so that adding a token costs one line to pin and touching the
  // lexer re-checks every form at once. The behaviours above state the rules; this
  // states the coverage.
  describe('corpus', () => {
    const corpus: Array<[string, Date | null]> = [
      ['today', new Date(2026, 0, 1)],
      ['tomorrow', new Date(2026, 0, 2)],
      ['yesterday', new Date(2025, 11, 31)],
      ['now', new Date(2026, 0, 1, 15, 5, 9, 42)],
      ['in 3 days', new Date(2026, 0, 4, 15, 5, 9, 42)],
      ['in 3 days, at midnight', new Date(2026, 0, 4)],
      ['3 days ago', new Date(2025, 11, 29, 15, 5, 9, 42)],
      ['3 days from now', new Date(2026, 0, 4, 15, 5, 9, 42)],
      ['in half an hour', new Date(2026, 0, 1, 15, 35, 9, 42)],
      ['in an hour and a half', new Date(2026, 0, 1, 16, 35, 9, 42)],
      ['in 1.5 hours', new Date(2026, 0, 1, 16, 35, 9, 42)],
      ['in 2 days and 3 hours', new Date(2026, 0, 3, 18, 5, 9, 42)],
      ['2 days and 3 hours ago', new Date(2025, 11, 30, 12, 5, 9, 42)],
      ['in 3 d', new Date(2026, 0, 4, 15, 5, 9, 42)],
      ['in 3 hrs', new Date(2026, 0, 1, 18, 5, 9, 42)],
      ['in 20 days', new Date(2026, 0, 21, 15, 5, 9, 42)],
      ['next week', new Date(2026, 0, 8, 15, 5, 9, 42)],
      ['last month', new Date(2025, 11, 1, 15, 5, 9, 42)],
      ['next year', new Date(2027, 0, 1, 15, 5, 9, 42)],
      ['next thursday', new Date(2026, 0, 8)],
      ['this thursday', new Date(2026, 0, 1)],
      ['last friday', new Date(2025, 11, 26)],
      ['friday', new Date(2026, 0, 2)],
      ['2 weeks from monday', new Date(2026, 0, 19)],
      ['december', new Date(2026, 11, 1)],
      ['next december', new Date(2026, 11, 1)],
      ['last december', new Date(2025, 11, 1)],
      ['dec 2019', new Date(2019, 11, 1)],
      ['2019', new Date(2019, 0, 1)],
      ['january 6th 2019', new Date(2019, 0, 6)],
      ['6 january', new Date(2026, 0, 6)],
      ['the 6th', new Date(2026, 0, 6)],
      ['2026-03-14', new Date(2026, 2, 14)],
      ['2026-03-14 21:30', new Date(2026, 2, 14, 21, 30)],
      ['14/03/2026', new Date(2026, 2, 14)],
      ['14.03.2026', new Date(2026, 2, 14)],
      ['14/03/26', new Date(2026, 2, 14)],
      ['2026-03', new Date(2026, 2, 1)],
      ['14/03', new Date(2026, 2, 14)],
      ['03/14/2026', null],
      ['9:20pm', new Date(2026, 0, 1, 21, 20)],
      ['21:20', new Date(2026, 0, 1, 21, 20)],
      ['9pm', new Date(2026, 0, 1, 21)],
      ['at 9', new Date(2026, 0, 1, 9)],
      ['9:20:30', new Date(2026, 0, 1, 9, 20, 30)],
      ['9:30:20', new Date(2026, 0, 1, 9, 30, 20)],
      ['09:20:05.123', new Date(2026, 0, 1, 9, 20, 5, 123)],
      ['2026-03-14T09:20:05.123Z', new Date(2026, 2, 14, 9, 20, 5, 123)],
      ['21h30', new Date(2026, 0, 1, 21, 30)],
      ['9h30min20sec', new Date(2026, 0, 1, 9, 30, 20)],
      ['midnight', new Date(2026, 0, 1)],
      ['noon', new Date(2026, 0, 1, 12)],
      ['tonight', new Date(2026, 0, 1, 20)],
      ['last night', new Date(2025, 11, 31, 20)],
      ['tomorrow morning', new Date(2026, 0, 2, 8)],
      ['same time tomorrow', new Date(2026, 0, 2, 15, 5, 9, 42)],
      ['next thursday at 9:20pm', new Date(2026, 0, 8, 21, 20)],
      ['9pm next thursday', new Date(2026, 0, 8, 21)],
      ['christmas', new Date(2026, 11, 25)],
      ['xmas', new Date(2026, 11, 25)],
      ['christmas eve', new Date(2026, 11, 24, 20)],
      ["new year's eve", new Date(2026, 11, 31, 20)],
      ['epiphany', new Date(2026, 0, 6)],
      ['april fools', new Date(2026, 3, 1)],
      ['armistice day', new Date(2026, 10, 11)],
      ['boxing day', new Date(2026, 11, 26)],
      ['easter', new Date(2026, 3, 5)],
      ['good friday', new Date(2026, 3, 3)],
      ['the friday before christmas', new Date(2026, 11, 18)],
      ['the end of july', new Date(2026, 6, 31)],
      ['the end of the month', new Date(2026, 0, 31)],
      ['the beginning of next year', new Date(2027, 0, 1)],
      ['this weekend', new Date(2026, 0, 3)],
      ['the last weekend of july', new Date(2026, 6, 25)],
      ['the last friday of july', new Date(2026, 6, 31)],
      ['the second friday of july', new Date(2026, 6, 10)],
      ['the last day of july', new Date(2026, 6, 31)],
      ['2 days after july', new Date(2026, 6, 3)],
      ['2 days after next friday', new Date(2026, 0, 4)],
      ['the day after tomorrow', new Date(2026, 0, 3)],
      ['2 days before 2026-03-14', new Date(2026, 2, 12)],
      ['3 days from monday', new Date(2026, 0, 8)],
      ['the 1st of next month', new Date(2026, 1, 1)],
      ['the first of next month', new Date(2026, 1, 1)],
      ['the 31st of next month', new Date(2026, 1, 28)],
      ['the 6th of january', new Date(2026, 0, 6)],
      ['the first monday of next month', new Date(2026, 1, 2)],
      ['in a second', new Date(2026, 0, 1, 15, 5, 10, 42)],
      ['9h20 pm', new Date(2026, 0, 1, 21, 20)],
      ['a couple of days', null],
      ['on monday', new Date(2026, 0, 5)],
      ['2026-03-14 on monday', new Date(2026, 2, 9)],
      ['2026-03-14 next monday', new Date(2026, 2, 16)],
      ['9pm on monday', new Date(2026, 0, 1 + 4, 21)],
      ['the 3rd quarter', new Date(2026, 0, 3)],
      ['thanksgiving', null],
      ['3 days', null],
      ['hello world', null],
      ['week 32', null],
      ['', null]
    ]

    for (const [raw, expected] of corpus) {
      it(`reads ${raw === '' ? 'an empty string' : raw}`, () => {
        expect(infer(raw)).toEqual(expected)
      })
    }
  })
})
