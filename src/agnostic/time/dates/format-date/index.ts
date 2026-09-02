import { getDateParts } from './parts.js'
import type { DateTokenParts } from './types.js'

const tokenRegexp = /\{\{(DD|D|dd|d|MM|M|MMMM|MMM|YYYY|YY|HH|H|hh|h|mm|m|ss|s|A|a|th|ms)\}\}/gv

/**
 * Formats a `Date` into a string according to a custom template and locale.
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
 * **Miliseconds**
 * - `ms` : Miliseconds
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
 * @returns Formatted date string. An unknown token is left untouched, braces
 * included.
 * @see {@link getDateParts} to reach the same fragments without a template.
 *
 * @example
 * formatDate(new Date(2026, 0, 1, 15, 5), '{{YYYY}}-{{MM}}-{{DD}} {{hh}}:{{mm}} {{A}}')
 * // => "2026-01-01 03:05 PM"
 */
export function formatDate (
  date: Date,
  format: string,
  locale = 'en'
): string {
  const parts = getDateParts(date, locale)
  return format.replace(
    tokenRegexp,
    (_match: string, token: keyof DateTokenParts) => parts[token]
  )
}
