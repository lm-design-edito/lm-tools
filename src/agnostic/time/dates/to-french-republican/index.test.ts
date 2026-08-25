import { describe, it, expect } from 'vitest'
import { toFrenchRepublican } from './index.js'
import { RepublicanMonth, ComplementaryDay, DecadeDay } from './types.js'

describe('toFrenchRepublican', () => {
  it('maps the first day of the calendar (An I) to 1 Vendémiaire', () => {
    const result = toFrenchRepublican(new Date(1792, 8, 22))
    expect(result).toMatchObject({
      year: 1,
      yearRoman: 'I',
      isComplementary: false,
      monthIndex: 0,
      monthName: RepublicanMonth.VENDEMIAIRE,
      dayOfMonth: 1,
      dayName: DecadeDay.PRIMIDI,
      decade: 1,
      dayOfYear: 0,
      formatted: '1 Vendémiaire an I'
    })
  })

  it('converts a well-known historical date (18 Brumaire an VIII)', () => {
    const result = toFrenchRepublican(new Date(1799, 10, 9))
    expect(result.formatted).toBe('18 Brumaire an VIII')
    expect(result.year).toBe(8)
    expect(result.yearRoman).toBe('VIII')
    expect(result.monthName).toBe(RepublicanMonth.BRUMAIRE)
    expect(result.dayOfMonth).toBe(18)
  })

  it('converts 9 Thermidor an II (fall of Robespierre)', () => {
    const result = toFrenchRepublican(new Date(1794, 6, 27))
    expect(result.formatted).toBe('9 Thermidor an II')
    expect(result.monthName).toBe(RepublicanMonth.THERMIDOR)
  })

  describe('regular days', () => {
    it('computes the décade (1–3) from the day of the month', () => {
      // 18 Brumaire -> second décade, Octidi (8th day of the décade).
      const result = toFrenchRepublican(new Date(1799, 10, 9))
      expect(result.isComplementary).toBe(false)
      expect(result.decade).toBe(2)
      expect(result.dayName).toBe(DecadeDay.OCTIDI)
    })

    it('never yields a day of month outside 1–30', () => {
      const result = toFrenchRepublican(new Date(2026, 7, 25))
      expect(result.isComplementary).toBe(false)
      expect(result.dayOfMonth).toBeGreaterThanOrEqual(1)
      expect(result.dayOfMonth).toBeLessThanOrEqual(30)
      expect(result.dayOfYear).toBeLessThan(360)
    })
  })

  describe('complementary days (sansculottides)', () => {
    it('nulls out the month fields on a complementary day', () => {
      const result = toFrenchRepublican(new Date(1795, 8, 17))
      expect(result).toMatchObject({
        isComplementary: true,
        monthIndex: null,
        monthName: null,
        decade: null,
        dayOfMonth: 1,
        dayName: ComplementaryDay.VERTU,
        formatted: 'Jour de la vertu, an III'
      })
    })

    it('exposes the 6th complementary day in a sextile year (An III)', () => {
      // An III is a leap (sextile) year, so it has a sixth sansculottide.
      const result = toFrenchRepublican(new Date(1795, 8, 22))
      expect(result.isComplementary).toBe(true)
      expect(result.dayOfMonth).toBe(6)
      expect(result.dayName).toBe(ComplementaryDay.REVOLUTION)
      expect(result.dayOfYear).toBe(365)
    })

    it('rolls over to the next year on the following equinox', () => {
      const lastDay = toFrenchRepublican(new Date(1795, 8, 22))
      const newYear = toFrenchRepublican(new Date(1795, 8, 23))
      expect(lastDay.year).toBe(3)
      expect(newYear.year).toBe(4)
      expect(newYear.formatted).toBe('1 Vendémiaire an IV')
      expect(newYear.dayOfYear).toBe(0)
    })
  })

  describe('year handling', () => {
    it('steps back a Gregorian year for dates before the new year', () => {
      // January 1800 still belongs to An VIII (started at the 1799 equinox).
      const result = toFrenchRepublican(new Date(1800, 0, 1))
      expect(result.year).toBe(8)
    })

    it('extrapolates the rule to modern dates', () => {
      const result = toFrenchRepublican(new Date(2026, 7, 25))
      expect(result.year).toBe(234)
      expect(result.yearRoman).toBe('CCXXXIV')
      expect(result.formatted).toBe('8 Fructidor an CCXXXIV')
    })
  })
})

describe('Republican calendar enums', () => {
  it('lists the twelve months in order', () => {
    const months = Object.values(RepublicanMonth)
    expect(months).toHaveLength(12)
    expect(months[0]).toBe('Vendémiaire')
    expect(months[11]).toBe('Fructidor')
  })

  it('lists the six complementary days in order', () => {
    const days = Object.values(ComplementaryDay)
    expect(days).toHaveLength(6)
    expect(days[0]).toBe('Jour de la vertu')
    expect(days[5]).toBe('Jour de la Révolution')
  })

  it('lists the ten décade days in order', () => {
    const days = Object.values(DecadeDay)
    expect(days).toHaveLength(10)
    expect(days[0]).toBe('Primidi')
    expect(days[9]).toBe('Décadi')
  })
})
