/**
 * Formats a `Date` object into a string according to a custom template and locale.
 *
 * Supported tokens (placeholders must be wrapped in `{{...}}`):
 *
 * **Day**
 * - `D` : Day of month (1–31)
 * - `DD` : Day of month, padded (01–31)
 * - `d` : Short weekday name (Mon, Tue, ...)
 * - `dd` : Full weekday name (Monday, Tuesday, ...)
 *
 * **Month**
 * - `M` : Month number (1–12)
 * - `MM` : Month number, padded (01–12)
 * - `MMM` : Short month name (Jan, Feb, ...)
 * - `MMMM` : Full month name (January, February, ...)
 *
 * **Year**
 * - `YY` : Two-digit year
 * - `YYYY` : Four-digit year
 *
 * **Hours**
 * - `H` : 24h format
 * - `HH` : 24h format, padded
 * - `h` : 12h format
 * - `hh` : 12h format, padded
 *
 * **Minutes & Seconds**
 * - `m` / `mm` : Minutes
 * - `s` / `ss` : Seconds
 *
 * **AM/PM**
 * - `A` : AM/PM
 * - `a` : am/pm
 *
 * **Ordinal suffix**
 * - `th` : Day ordinal suffix (`st`, `nd`, `rd`, `th` for English; `er` for French 1st)
 *
 * @param date - The `Date` object to format.
 * @param format - The template string containing tokens.
 * @param locale - Optional locale code (default: `'en'`).
 * @returns Formatted date string.
 *
 * @example
 * formatDate(new Date(2026, 0, 1, 15, 5), '{{YYYY}}-{{MM}}-{{DD}} {{hh}}:{{mm}} {{A}}')
 * // => "2026-01-01 03:05 PM"
 */
export function formatDate (
  date: Date,
  format: string,
  locale: string = 'en'
): string {
  if (Intl
    .DateTimeFormat
    .supportedLocalesOf(locale).length === 0) {
    locale = 'en'
  }
  const day = date.getDate()
  const dayOfWeek = date.getDay()
  const month = date.getMonth()
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()
  const isPM = hours >= 12
  const shortDateNames = [...Array(7)].map((_, i) => new Intl.DateTimeFormat(
    locale,
    { weekday: 'short' }
  ).format(new Date(2023, 0, i + 1)))
  const dateNames = [...Array(7)].map((_, i) => new Intl.DateTimeFormat(
    locale,
    { weekday: 'long' }
  ).format(new Date(2023, 0, i + 1)))
  const shortMonthNames = [...Array(12)].map((_, i) => new Intl.DateTimeFormat(
    locale,
    { month: 'short' }
  ).format(new Date(2023, i, 1)))
  const monthNames = [...Array(12)].map((_, i) => new Intl.DateTimeFormat(
    locale,
    { month: 'long' }
  ).format(new Date(2023, i, 1)))
  const replacements: Record<string, () => string> = {
    'DD': () => String(day).padStart(2, '0'),
    'D': () => String(day),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    'dd': () => dateNames[dayOfWeek]!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    'd': () => shortDateNames[dayOfWeek]!,
    'MM': () => String(month + 1).padStart(2, '0'),
    'M': () => String(month + 1),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    'MMMM': () => monthNames[month]!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    'MMM': () => shortMonthNames[month]!,
    'YYYY': () => String(year),
    'YY': () => String(year).slice(-2),
    'hh': () => String(hours % 12 !== 0 ? hours % 12 : 12).padStart(2, '0'),
    'h': () => String(hours % 12 !== 0 ? hours % 12 : 12),
    'HH': () => String(hours).padStart(2, '0'),
    'H': () => String(hours),
    'mm': () => String(minutes).padStart(2, '0'),
    'm': () => String(minutes),
    'ss': () => String(seconds).padStart(2, '0'),
    's': () => String(seconds),
    'A': () => (isPM ? 'PM' : 'AM'),
    'a': () => (isPM ? 'pm' : 'am'),
    'th': () => {
      if (locale.startsWith('fr') && day === 1) return 'er'
      if (locale.startsWith('en')) {
        const mod10 = day % 10
        const mod100 = day % 100
        if (mod10 === 1 && mod100 !== 11) return 'st'
        if (mod10 === 2 && mod100 !== 12) return 'nd'
        if (mod10 === 3 && mod100 !== 13) return 'rd'
        return 'th'
      }
      return ''
    }
  }

  const regexp = /{{(DD|D|dd|d|MM|M|MMMM|MMM|YYYY|YY|HH|H|hh|h|mm|m|ss|s|A|a|th)}}/g
  return format.replace(regexp, (match, token) => replacements[token]?.() ?? match)
}

// [WIP] this was removed since JavaScript's Date object don't hold timezone data
// those templates would only reflect the curent client's timezone, no matter what the input Date obj was

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
