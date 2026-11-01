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
    })
  })

  describe('a direction on a time of day', () => {
    it('moves the day the time belongs to', () => {
      expect(infer('last night')).toEqual(new Date(2025, 11, 31, 20))
      expect(infer('next morning')).toEqual(new Date(2026, 0, 2, 8))
      expect(infer('this morning')).toEqual(new Date(2026, 0, 1, 8))
    })

    it('reads the afternoon at its agreed hour', () => {
      expect(infer('afternoon')).toEqual(new Date(2026, 0, 1, 14))
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
      const ignored: string[][] = []
      const read = inferDate('3 days', 'en', {
        reference,
        onIgnored: atoms => { ignored.push(atoms) }
      })
      expect(read).toBeNull()
      expect(ignored).toEqual([['3', 'days']])
    })

    it('stays silent when everything landed', () => {
      const ignored: string[][] = []
      inferDate('next thursday at 9:20pm', 'en', {
        reference,
        onIgnored: atoms => { ignored.push(atoms) }
      })
      expect(ignored).toEqual([])
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
    })
  })

  describe('after, before, from and of', () => {
    it('resolves the right-hand side first, then applies the left', () => {
      expect(infer('2 days after next friday')).toEqual(new Date(2026, 0, 4))
      expect(infer('2 days before 2026-03-14')).toEqual(new Date(2026, 2, 12))
      expect(infer('3 days from monday')).toEqual(new Date(2026, 0, 8))
    })

    it('reads a bare unit in front of an operator as one of it', () => {
      expect(infer('the day after tomorrow')).toEqual(new Date(2026, 0, 3))
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
      const ignored: string[][] = []
      const read = inferDate('before 2019', 'en', {
        reference,
        onIgnored: atoms => { ignored.push(atoms) }
      })
      expect(read).toEqual(new Date(2019, 0, 1))
      expect(ignored).toEqual([['before']])
    })
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
      ['in 2 days and 3 hours', new Date(2026, 0, 3, 18, 5, 9, 42)],
      ['2 days and 3 hours ago', new Date(2025, 11, 30, 12, 5, 9, 42)],
      ['in 3 d', new Date(2026, 0, 4, 15, 5, 9, 42)],
      ['in 3 hrs', new Date(2026, 0, 1, 18, 5, 9, 42)],
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
      ['9:20pm', new Date(2026, 0, 1, 21, 20)],
      ['21:20', new Date(2026, 0, 1, 21, 20)],
      ['12:30 am', new Date(2026, 0, 1, 0, 30)],
      ['9pm', new Date(2026, 0, 1, 21)],
      ['at 9', new Date(2026, 0, 1, 9)],
      ['9:30:20', new Date(2026, 0, 1, 9, 30, 20)],
      ['21h30', new Date(2026, 0, 1, 21, 30)],
      ['9h30', new Date(2026, 0, 1, 9, 30)],
      ['9h', new Date(2026, 0, 1, 9)],
      ['at 9h', new Date(2026, 0, 1, 9)],
      ['in 9h', new Date(2026, 0, 2, 0, 5, 9, 42)],
      ['9h30min20sec', new Date(2026, 0, 1, 9, 30, 20)],
      ['midnight', new Date(2026, 0, 1)],
      ['noon', new Date(2026, 0, 1, 12)],
      ['tonight', new Date(2026, 0, 1, 20)],
      ['afternoon', new Date(2026, 0, 1, 14)],
      ['last night', new Date(2025, 11, 31, 20)],
      ['tomorrow morning', new Date(2026, 0, 2, 8)],
      ['next thursday at 9:20pm', new Date(2026, 0, 8, 21, 20)],
      ['9pm next thursday', new Date(2026, 0, 8, 21)],
      ['next friday + 2 days', new Date(2026, 0, 4)],
      ['next friday - 2 days', new Date(2025, 11, 31)],
      ['please publish this tomorrow at 9pm', new Date(2026, 0, 2, 21)],
      ['TOMORROW AT 9PM', new Date(2026, 0, 2, 21)],
      ['in  3 days — at midnight', new Date(2026, 0, 4)],
      ['january february', new Date(2026, 1, 1)],
      ['2 days after next friday', new Date(2026, 0, 4)],
      ['the day after tomorrow', new Date(2026, 0, 3)],
      ['2 days before 2026-03-14', new Date(2026, 2, 12)],
      ['3 days from monday', new Date(2026, 0, 8)],
      ['the 1st of next month', new Date(2026, 1, 1)],
      ['the first of next month', new Date(2026, 1, 1)],
      ['the 31st of next month', new Date(2026, 1, 28)],
      ['the 6th of january', new Date(2026, 0, 6)],
      ['in a second', new Date(2026, 0, 1, 15, 5, 10, 42)],
      ['9h20 pm', new Date(2026, 0, 1, 21, 20)],
      ['a couple of days', null],
      ['on monday', new Date(2026, 0, 5)],
      ['2026-03-14 on monday', new Date(2026, 2, 9)],
      ['2026-03-14 next monday', new Date(2026, 2, 16)],
      ['9pm on monday', new Date(2026, 0, 1 + 4, 21)],
      ['the 3rd quarter', new Date(2026, 0, 3)],
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
