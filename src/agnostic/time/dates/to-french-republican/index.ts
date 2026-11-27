// The calendar as it was applied, 1792–1805: a Republican year begins on the civil day,
// at the Paris meridian, holding the true September equinox — year N at equinox 1791+N.

// The gap between two equinoxes being 365 or 366 days, the count of complementary days
// falls out on its own and no leap rule is needed.

import type { FrenchRepublicanDate } from './types.js'
import {
  gregorianToJdn,
  republicanYearStartJdn,
  toRoman,
  MONTH_NAMES,
  COMPLEMENTARY_DAY_NAMES,
  DECADE_DAY_NAMES
} from './utils.js'

/**
 * Converts a `Date` to the French Republican calendar.
 *
 * @param date - The date to convert.
 * @returns The equivalent {@link FrenchRepublicanDate}.
 *
 * @remarks
 * The date's local calendar day (`getFullYear` / `getMonth` / `getDate`) is
 * used as the Gregorian date, so the result reflects the runtime's local
 * timezone. Build the `Date` in the timezone you care about if this matters.
 *
 * @example
 * toFrenchRepublican(new Date(1799, 10, 9)).formatted // => '18 Brumaire an VIII'
 */
export function toFrenchRepublican (date: Date): FrenchRepublicanDate {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const jdn = gregorianToJdn(year, month, day)

  // Guess the equinox year as the date's own Gregorian year, then step back when the date
  // falls before that year's new year — January to September.
  let g = year
  let startJdn = republicanYearStartJdn(g)
  if (jdn < startJdn) {
    g -= 1
    startJdn = republicanYearStartJdn(g)
  }

  const republicanYear = g - 1791
  const yearRoman = toRoman(republicanYear)
  const dayOfYear = jdn - startJdn // 0-based

  if (dayOfYear >= 360) {
    // Complementary day (sansculottide): dayOfYear 360..365 -> index 0..5.
    const complementaryIndex = dayOfYear - 360
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const dayName = COMPLEMENTARY_DAY_NAMES[complementaryIndex]!
    return {
      year: republicanYear,
      yearRoman,
      isComplementary: true,
      monthIndex: null,
      monthName: null,
      dayOfMonth: complementaryIndex + 1,
      dayName,
      decade: null,
      dayOfYear,
      formatted: `${dayName}, an ${yearRoman}`
    }
  }

  const monthIndex = Math.floor(dayOfYear / 30) // 0..11
  const dayOfMonth = (dayOfYear % 30) + 1 // 1..30
  const decadeDayIndex = (dayOfMonth - 1) % 10 // 0..9
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const monthName = MONTH_NAMES[monthIndex]!
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const dayName = DECADE_DAY_NAMES[decadeDayIndex]!

  return {
    year: republicanYear,
    yearRoman,
    isComplementary: false,
    monthIndex,
    monthName,
    dayOfMonth,
    dayName,
    decade: Math.floor((dayOfMonth - 1) / 10) + 1, // 1..3
    dayOfYear,
    formatted: `${dayOfMonth} ${monthName} an ${yearRoman}`
  }
}
