import { getDateParts } from './parts.js'
import type {
  DateParts,
  DateToken
} from './types.js'

// Alternation is ordered, and the first branch that fits wins — so the longest
// tokens come first. `MM` ahead of `MMMM` would only work by backtracking off the
// closing braces, which is true but not something a reader should have to derive.
const tokenRegexp = /\{\{(MMMM|YYYY|MMM|DD|dd|MM|YY|HH|hh|mm|ss|th|ms|D|d|M|H|h|m|s|A|a)\}\}/gv

function pad (value: number, length: number): string {
  return `${value}`.padStart(length, '0')
}

/**
 * How each token renders the parts it reads. This is where padding and
 * truncation live — {@link getDateParts} hands over plain quantities, and the
 * padded tokens are the same quantity written differently.
 */
const renderers: Record<DateToken, (parts: DateParts) => string> = {
  'D': parts => `${parts.D}`,
  'DD': parts => pad(parts.D, 2),
  'd': parts => parts.d,
  'dd': parts => parts.dd,
  'M': parts => `${parts.M}`,
  'MM': parts => pad(parts.M, 2),
  'MMM': parts => parts.MMM,
  'MMMM': parts => parts.MMMM,
  'YY': parts => `${parts.YYYY}`.slice(-2),
  'YYYY': parts => `${parts.YYYY}`,
  'H': parts => `${parts.H}`,
  'HH': parts => pad(parts.H, 2),
  'h': parts => `${parts.h}`,
  'hh': parts => pad(parts.h, 2),
  'm': parts => `${parts.m}`,
  'mm': parts => pad(parts.m, 2),
  's': parts => `${parts.s}`,
  'ss': parts => pad(parts.s, 2),
  'ms': parts => pad(parts.ms, 3),
  'A': parts => parts.A,
  'a': parts => parts.a,
  'th': parts => parts.th
}

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
 * @see {@link getDateParts} to reach the same parts as plain values, unpadded.
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
    (_match: string, token: DateToken) => renderers[token](parts)
  )
}
