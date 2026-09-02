import { describe, it, expect } from 'vitest'
import {
  Duration,
  d,
  days,
  h,
  hours,
  m,
  milliseconds,
  min,
  minutes,
  months,
  ms,
  mth,
  s,
  sec,
  seconds,
  w,
  weeks,
  y,
  years,
  yr,
  type DurationType
} from './index.js'

describe('Duration', () => {
  describe('unit normalisation', () => {
    it('keeps a long form as it is given', () => {
      expect(new Duration(1, 'milliseconds').type).toBe('milliseconds')
      expect(new Duration(1, 'seconds').type).toBe('seconds')
      expect(new Duration(1, 'minutes').type).toBe('minutes')
      expect(new Duration(1, 'hours').type).toBe('hours')
      expect(new Duration(1, 'days').type).toBe('days')
      expect(new Duration(1, 'weeks').type).toBe('weeks')
      expect(new Duration(1, 'months').type).toBe('months')
      expect(new Duration(1, 'years').type).toBe('years')
    })

    it('expands a short form to its long form', () => {
      expect(new Duration(1, 'ms').type).toBe('milliseconds')
      expect(new Duration(1, 's').type).toBe('seconds')
      expect(new Duration(1, 'sec').type).toBe('seconds')
      expect(new Duration(1, 'min').type).toBe('minutes')
      expect(new Duration(1, 'h').type).toBe('hours')
      expect(new Duration(1, 'd').type).toBe('days')
      expect(new Duration(1, 'w').type).toBe('weeks')
    })

    it('tells minutes from months by the case of the token', () => {
      expect(new Duration(1, 'm').type).toBe('minutes')
      expect(new Duration(1, 'M').type).toBe('months')
    })

    it('still accepts the month and year aliases that predate the format-date tokens', () => {
      expect(new Duration(1, 'mo').type).toBe('months')
      expect(new Duration(1, 'mth').type).toBe('months')
      expect(new Duration(1, 'y').type).toBe('years')
      expect(new Duration(1, 'Y').type).toBe('years')
    })

    it('falls back to milliseconds on a unit it does not know', () => {
      // The fallback is unreachable through the types — only a caller in plain JS
      // gets there, and it is that caller the test stands in for.
      const duration = new Duration(5, 'fortnights' as DurationType)
      expect(duration.type).toBe('milliseconds')
      expect(duration.toMs()).toBe(5)
    })
  })

  describe('toMilliseconds', () => {
    it('converts each unit by its fixed length', () => {
      expect(milliseconds(1).toMilliseconds()).toBe(1)
      expect(seconds(1).toMilliseconds()).toBe(1000)
      expect(minutes(1).toMilliseconds()).toBe(60000)
      expect(hours(1).toMilliseconds()).toBe(3600000)
      expect(days(1).toMilliseconds()).toBe(86400000)
      expect(weeks(1).toMilliseconds()).toBe(604800000)
    })

    it('approximates a month as 30 days and a year as 365', () => {
      expect(months(1).toMilliseconds()).toBe(30 * 86400000)
      expect(years(1).toMilliseconds()).toBe(365 * 86400000)
    })

    it('carries the sign and the fraction of the value it was given', () => {
      expect(seconds(-90).toMilliseconds()).toBe(-90000)
      expect(hours(1.5).toMilliseconds()).toBe(5400000)
    })
  })

  describe('conversions to other units', () => {
    it('reads a duration back in a larger unit', () => {
      expect(seconds(90).toMinutes()).toBe(1.5)
      expect(minutes(90).toHours()).toBe(1.5)
      expect(hours(36).toDays()).toBe(1.5)
      expect(days(14).toWeeks()).toBe(2)
    })

    it('reads a duration back in a smaller unit', () => {
      expect(hours(2).toSeconds()).toBe(7200)
      expect(days(1).toMinutes()).toBe(1440)
    })

    it('divides by the same month and year approximations it multiplies by', () => {
      expect(days(30).toMonths()).toBe(1)
      expect(days(365).toYear()).toBe(1)
    })

    it('yields a fractional value rather than a truncated one', () => {
      expect(seconds(30).toMinutes()).toBe(0.5)
      expect(days(400).toYear()).toBeCloseTo(1.0959, 4)
    })
  })

  describe('shorthand aliases', () => {
    it('exposes a shorthand for every conversion', () => {
      const duration = minutes(3)
      expect(duration.toMs()).toBe(duration.toMilliseconds())
      expect(duration.toS()).toBe(duration.toSeconds())
      expect(duration.toSec()).toBe(duration.toSeconds())
      expect(duration.toM()).toBe(duration.toMinutes())
      expect(duration.toMin()).toBe(duration.toMinutes())
      expect(duration.toH()).toBe(duration.toHours())
      expect(duration.toD()).toBe(duration.toDays())
      expect(duration.toW()).toBe(duration.toWeeks())
      expect(duration.toMth()).toBe(duration.toMonths())
      expect(duration.toY()).toBe(duration.toYear())
      expect(duration.toYr()).toBe(duration.toYear())
    })

    it('keeps its conversions bound once they are detached from the instance', () => {
      const { toMs, toMinutes } = hours(2)
      expect(toMs()).toBe(7200000)
      expect(toMinutes()).toBe(120)
    })
  })
})

describe('milliseconds', () => {
  it('builds a duration counted in milliseconds', () => {
    expect(milliseconds(250)).toMatchObject({ value: 250, type: 'milliseconds' })
  })

  it('is also exported as ms', () => {
    expect(ms).toBe(milliseconds)
  })
})

describe('seconds', () => {
  it('builds a duration counted in seconds', () => {
    expect(seconds(30)).toMatchObject({ value: 30, type: 'seconds' })
  })

  it('is also exported as s and sec', () => {
    expect(s).toBe(seconds)
    expect(sec).toBe(seconds)
  })
})

describe('minutes', () => {
  it('builds a duration counted in minutes', () => {
    expect(minutes(45)).toMatchObject({ value: 45, type: 'minutes' })
  })

  it('is also exported as m and min', () => {
    expect(m).toBe(minutes)
    expect(min).toBe(minutes)
  })
})

describe('hours', () => {
  it('builds a duration counted in hours', () => {
    expect(hours(12)).toMatchObject({ value: 12, type: 'hours' })
  })

  it('is also exported as h', () => {
    expect(h).toBe(hours)
  })
})

describe('days', () => {
  it('builds a duration counted in days', () => {
    expect(days(7)).toMatchObject({ value: 7, type: 'days' })
  })

  it('is also exported as d', () => {
    expect(d).toBe(days)
  })
})

describe('weeks', () => {
  it('builds a duration counted in weeks', () => {
    expect(weeks(3)).toMatchObject({ value: 3, type: 'weeks' })
  })

  it('is also exported as w', () => {
    expect(w).toBe(weeks)
  })
})

describe('months', () => {
  it('builds a duration counted in months', () => {
    expect(months(2)).toMatchObject({ value: 2, type: 'months' })
  })

  it('is also exported as mth', () => {
    expect(mth).toBe(months)
  })
})

describe('years', () => {
  it('builds a duration counted in years', () => {
    expect(years(1)).toMatchObject({ value: 1, type: 'years' })
  })

  it('is also exported as y and yr', () => {
    expect(y).toBe(years)
    expect(yr).toBe(years)
  })
})
