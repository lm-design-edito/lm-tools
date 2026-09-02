import type {
  DateParts,
  DateTokenParts
} from './types.js'

/**
 * The localised weekday names, indexed the way `Date.prototype.getDay` numbers
 * them. January 1st 2023 was a Sunday, so the week is walked from there.
 */
function weekdayNames (locale: string, weekday: 'short' | 'long'): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday })
  return [...Array<string>(7)].map((_, i) => formatter.format(new Date(2023, 0, i + 1)))
}

/**
 * The localised month names, indexed the way `Date.prototype.getMonth` numbers
 * them — January at 0.
 */
function monthNames (locale: string, month: 'short' | 'long'): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { month })
  return [...Array<string>(12)].map((_, i) => formatter.format(new Date(2023, i, 1)))
}

/** The ordinal suffix a locale appends to a day number, empty when it has none. */
function dayOrdinalSuffix (day: number, locale: string): string {
  if (locale.startsWith('fr')) return day === 1 ? 'er' : ''
  if (!locale.startsWith('en')) return ''
  const mod10 = day % 10
  const mod100 = day % 100
  if (mod10 === 1 && mod100 !== 11) return 'st'
  if (mod10 === 2 && mod100 !== 12) return 'nd'
  if (mod10 === 3 && mod100 !== 13) return 'rd'
  return 'th'
}

/**
 * Breaks a `Date` down into every fragment `formatDate` knows how to render,
 * localised and ready to concatenate.
 *
 * Reach for this over `formatDate` when the fragments go somewhere a template
 * string can't — separate DOM nodes, a `<time>` element's parts, an object
 * handed to a view layer.
 *
 * @param date - The `Date` to break down.
 * @param locale - Optional locale code, falling back to `'en'` when the runtime
 * doesn't support it.
 * @returns The parts, each one reachable under its format token and under its
 * readable name.
 * @see {@link DateParts}
 *
 * @remarks
 * Every fragment is read off the `Date` in the runtime's local timezone, since a
 * `Date` carries no timezone of its own.
 *
 * @example
 * const parts = getDateParts(new Date(2026, 0, 1, 15, 5), 'fr')
 * parts.MMMM            // => 'janvier'
 * parts.fullMonthName   // => 'janvier', the same value
 */
export function getDateParts (date: Date, locale = 'en'): DateParts {
  const safeLocale = Intl.DateTimeFormat.supportedLocalesOf(locale).length === 0
    ? 'en'
    : locale
  const day = date.getDate()
  const dayOfWeek = date.getDay()
  const month = date.getMonth()
  const year = date.getFullYear()
  const hours = date.getHours()
  const twelveHours = hours % 12 === 0 ? 12 : hours % 12
  const isPM = hours >= 12
  const tokens: DateTokenParts = {
    'D': `${day}`,
    'DD': `${day}`.padStart(2, '0'),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    'd': weekdayNames(safeLocale, 'short')[dayOfWeek]!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    'dd': weekdayNames(safeLocale, 'long')[dayOfWeek]!,
    'M': `${month + 1}`,
    'MM': `${month + 1}`.padStart(2, '0'),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    'MMM': monthNames(safeLocale, 'short')[month]!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    'MMMM': monthNames(safeLocale, 'long')[month]!,
    'YY': `${year}`.slice(-2),
    'YYYY': `${year}`,
    'H': `${hours}`,
    'HH': `${hours}`.padStart(2, '0'),
    'h': `${twelveHours}`,
    'hh': `${twelveHours}`.padStart(2, '0'),
    'm': `${date.getMinutes()}`,
    'mm': `${date.getMinutes()}`.padStart(2, '0'),
    's': `${date.getSeconds()}`,
    'ss': `${date.getSeconds()}`.padStart(2, '0'),
    'ms': `${date.getMilliseconds()}`.padStart(3, '0'),
    'A': isPM ? 'PM' : 'AM',
    'a': isPM ? 'pm' : 'am',
    'th': dayOrdinalSuffix(day, safeLocale)
  }
  return {
    ...tokens,
    dayOfMonth: tokens.D,
    paddedDayOfMonth: tokens.DD,
    shortWeekdayName: tokens.d,
    fullWeekdayName: tokens.dd,
    monthNumber: tokens.M,
    paddedMonthNumber: tokens.MM,
    shortMonthName: tokens.MMM,
    fullMonthName: tokens.MMMM,
    twoDigitYear: tokens.YY,
    fourDigitYear: tokens.YYYY,
    hours24: tokens.H,
    paddedHours24: tokens.HH,
    hours12: tokens.h,
    paddedHours12: tokens.hh,
    minutes: tokens.m,
    paddedMinutes: tokens.mm,
    seconds: tokens.s,
    paddedSeconds: tokens.ss,
    paddedMilliseconds: tokens.ms,
    upperCaseMeridiem: tokens.A,
    lowerCaseMeridiem: tokens.a,
    dayOrdinalSuffix: tokens.th
  }
}

// [WIP] timezone tokens were removed since JavaScript's Date object doesn't hold
// timezone data — those templates would only reflect the current client's
// timezone, no matter what the input Date obj was

// 'ZZ': () => {
//   const timezoneOffset = date.getTimezoneOffset()
//   const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60)
//   const offsetMinutes = Math.abs(timezoneOffset) % 60
//   const sign = timezoneOffset > 0 ? '-' : '+'
//   return `${sign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`
// },
// 'Z': () => {
//   const timezoneOffset = date.getTimezoneOffset()
//   if (timezoneOffset === 0) return 'Z'
//   const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60)
//   const offsetMinutes = Math.abs(timezoneOffset) % 60
//   const sign = timezoneOffset > 0 ? '-' : '+'
//   return `${sign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`
// },
// 'z': () => {
//   return Intl.DateTimeFormat(locale, { timeZoneName: 'short' })
//     .formatToParts(date)
//     .find(part => part.type === 'timeZoneName')?.value || ''
// },
// 'zz': () => {
//   return Intl.DateTimeFormat(locale, { timeZoneName: 'long' })
//     .formatToParts(date)
//     .find(part => part.type === 'timeZoneName')?.value || ''
// },
// 'tz': () => Intl.DateTimeFormat().resolvedOptions().timeZone || ''
