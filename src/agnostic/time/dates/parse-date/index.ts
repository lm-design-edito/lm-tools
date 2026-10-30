import { monthNames, weekdayNames } from '../calendar-names/index.js'
import type { DateToken } from '../format-date/types.js'
import type { ParseDateOptions } from './types.js'

/** The parts a token fills, under the names `DateTokenParts` keys them with. */
type DateField = 'YYYY' | 'M' | 'D' | 'H' | 'h' | 'm' | 's' | 'ms' | 'A'

type TokenReader = {
  /** What `formatDate` can have written for this token, as a regexp source. */
  pattern: (locale: string) => string
  /** The part it fills, or `null` when it carries nothing a date is made of. */
  field: DateField | null
  /**
   * What the captured text is worth, `null` when it turns out not to be a value.
   * Missing means a base-ten integer.
   */
  read?: (captured: string, locale: string) => number | null
}

// Only what a regexp reads as syntax: under the `v` flag a backslash in front of
// anything else is an error, so escaping every non-alphanumeric is not an option.
function escapeLiteral (literal: string): string {
  return literal.replace(/[\\^$.*+?\(\)\[\]\{\}\|\/]/gv, '\\$&')
}

/** A run of whitespace in the template matches any run of it in the string. */
function literalPattern (literal: string): string {
  return literal
    .split(/\s+/v)
    .map(escapeLiteral)
    .join('\\s+')
}

/** Longest first, in case a locale has a month name that prefixes another. */
function namesPattern (names: string[]): string {
  return [...names]
    .sort((one, other) => other.length - one.length)
    .map(escapeLiteral)
    .join('|')
}

function nameIndex (names: string[], captured: string): number | null {
  const needle = captured.toLowerCase()
  const index = names.findIndex(name => name.toLowerCase() === needle)
  return index === -1 ? null : index
}

const readers = {
  'D': { pattern: () => '\\d{1,2}', field: 'D' },
  'DD': { pattern: () => '\\d{2}', field: 'D' },
  'd': { pattern: () => '\\d{1,2}', field: 'D' },
  'dd': { pattern: () => '\\d{2}', field: 'D' },
  'ddd': { pattern: locale => namesPattern(weekdayNames(locale, 'short')), field: null },
  'dddd': { pattern: locale => namesPattern(weekdayNames(locale, 'long')), field: null },
  'M': { pattern: () => '\\d{1,2}', field: 'M' },
  'MM': { pattern: () => '\\d{2}', field: 'M' },
  'MMM': {
    pattern: locale => namesPattern(monthNames(locale, 'short')),
    field: 'M',
    read: (captured, locale) => {
      const index = nameIndex(monthNames(locale, 'short'), captured)
      return index === null ? null : index + 1
    }
  },
  'MMMM': {
    pattern: locale => namesPattern(monthNames(locale, 'long')),
    field: 'M',
    read: (captured, locale) => {
      const index = nameIndex(monthNames(locale, 'long'), captured)
      return index === null ? null : index + 1
    }
  },
  'YY': {
    pattern: () => '\\d{2}',
    field: 'YYYY',
    // The pivot `strptime` uses, and the one every other reader of two-digit years
    // settled on: a date file written in 1998 means 1998, a form filled today means
    // this century.
    read: captured => {
      const value = Number.parseInt(captured, 10)
      return value > 68 ? 1900 + value : 2000 + value
    }
  },
  // One to four digits, because `formatDate` writes the year unpadded: the three of
  // `999` are as much a year as the four of `2026`.
  'YYYY': { pattern: () => '\\d{1,4}', field: 'YYYY' },
  'H': { pattern: () => '\\d{1,2}', field: 'H' },
  'HH': { pattern: () => '\\d{2}', field: 'H' },
  'h': { pattern: () => '\\d{1,2}', field: 'h' },
  'hh': { pattern: () => '\\d{2}', field: 'h' },
  'm': { pattern: () => '\\d{1,2}', field: 'm' },
  'mm': { pattern: () => '\\d{2}', field: 'm' },
  's': { pattern: () => '\\d{1,2}', field: 's' },
  'ss': { pattern: () => '\\d{2}', field: 's' },
  'ms': { pattern: () => '\\d{1,3}', field: 'ms' },
  'A': { pattern: () => '[ap]m', field: 'A', read: captured => captured.toLowerCase() === 'pm' ? 1 : 0 },
  'a': { pattern: () => '[ap]m', field: 'A', read: captured => captured.toLowerCase() === 'pm' ? 1 : 0 },
  // The suffixes `getDateParts` can produce, and the empty string for the locales and
  // the days that have none.
  'th': { pattern: () => '(?:st|nd|rd|th|er)?', field: null }
} satisfies Record<DateToken, TokenReader>

// Alternation is ordered and the first branch that fits wins, so the longest tokens
// come first — the same reason `formatDate` spells its own alternation that way, built
// off the table above rather than written out a second time.
const tokenPattern = Object.keys(readers)
  .sort((one, other) => other.length - one.length)
  .join('|')
const tokenRegexp = new RegExp(`\\{\\{(${tokenPattern})\\}\\}`, 'gv')
const readersByToken = new Map<string, TokenReader>(Object.entries(readers))

/**
 * The template as a regexp matching the whole string, plus the reader behind each of
 * its capture groups.
 */
function compile (format: string, locale: string): { regexp: RegExp, captures: TokenReader[] } {
  const captures: TokenReader[] = []
  const sources: string[] = ['^\\s*']
  // `split` on a pattern that captures interleaves the two: a literal at every even
  // position, a token at every odd one.
  format.split(tokenRegexp).forEach((part, index) => {
    const reader = index % 2 === 0 ? undefined : readersByToken.get(part)
    if (reader === undefined) {
      sources.push(literalPattern(part))
      return
    }
    captures.push(reader)
    sources.push(`(${reader.pattern(locale)})`)
  })
  sources.push('\\s*$')
  return {
    regexp: new RegExp(sources.join(''), 'iv'),
    captures
  }
}

/**
 * Reads a date written in one of `formatDate`'s templates back into a `Date`.
 *
 * The grammar is the same one, token for token — see {@link formatDate} for the list
 * — so whatever that function writes, this one reads.
 *
 * @param raw - The string to read.
 * @param format - The template it was written with.
 * @param locale - Optional locale code (default: `'en'`), which has to be the one any
 * month or weekday name in the string is written in.
 * @param options - See {@link ParseDateOptions}.
 * @returns The date, or `null` when the string does not fit the template, when a part
 * is out of range, or when the moment it names does not exist — a 31st of February, or
 * an hour daylight saving skips.
 * @see {@link formatDate} — the same grammar, the other way round.
 *
 * @remarks
 * **What the template does not name comes from the reference date**, except below the
 * finest part it does name, which is that part's own minimum: `'{{YYYY}}'` reads as the
 * first instant of a year, where `'{{HH}}:{{mm}}'` reads as a time today. A template
 * naming no part of a date at all — a bare `'{{dddd}}'` — reads as `null`.
 *
 * **Reading is lenient about what writing had to settle**: case is ignored, a bare
 * token accepts the padded form of what it asked for, and a run of whitespace matches
 * any run of it, leading and trailing included. An unknown token stays literal here
 * too, so a string written through a typo is still read back by it.
 *
 * **The parts that say nothing are matched and dropped** — a weekday name, an ordinal
 * suffix. Whether they agree with the rest is not checked, so `'Monday 1 January 2026'`
 * reads as the Thursday it actually was. A part named twice has to agree with itself,
 * though: `'{{D}}/{{DD}}'` reads `'1/01'` and refuses `'1/02'`.
 *
 * **A two-digit year takes the `strptime` pivot** — 69 to 99 are 1969–1999, 00 to 68
 * are 2000–2068 — and **a 12-hour clock with no meridiem reads as the morning**, so
 * `'{{h}}'` alone turns 12 into midnight.
 *
 * @example
 * parseDate('2026-01-01 03:05 PM', '{{YYYY}}-{{MM}}-{{DD}} {{hh}}:{{mm}} {{A}}')
 * // => Thursday, January 1st 2026 at 15:05, local time
 */
export function parseDate (
  raw: string,
  format: string,
  locale = 'en',
  options: ParseDateOptions = {}
): Date | null {
  const { regexp, captures } = compile(format, locale)
  const match = regexp.exec(raw)
  if (match === null) return null
  const parts: Partial<Record<DateField, number>> = {}
  for (const [position, reader] of captures.entries()) {
    const captured = match[position + 1]
    if (captured === undefined) return null
    if (reader.field === null) continue
    const value = reader.read === undefined
      ? Number.parseInt(captured, 10)
      : reader.read(captured, locale)
    if (value === null || !Number.isFinite(value)) return null
    const already = parts[reader.field]
    if (already !== undefined && already !== value) return null
    parts[reader.field] = value
  }

  let hours = parts.H
  const hours12 = parts.h
  if (hours12 !== undefined) {
    if (hours12 < 1 || hours12 > 12) return null
    const asHours24 = (hours12 % 12) + (parts.A === 1 ? 12 : 0)
    if (hours !== undefined && hours !== asHours24) return null
    hours = asHours24
  }

  // The parts, finest first, so that the index of the first one named says where the
  // template stops: anything finer than that is a minimum, anything coarser is the
  // reference's.
  const reference = options.reference ?? new Date()
  const finest = [parts.ms, parts.s, parts.m, hours, parts.D, parts.M, parts.YYYY]
    .findIndex(part => part !== undefined)
  if (finest === -1) return null
  const milliseconds = parts.ms ?? 0
  const seconds = parts.s ?? (finest < 1 ? reference.getSeconds() : 0)
  const minutes = parts.m ?? (finest < 2 ? reference.getMinutes() : 0)
  const hoursOfDay = hours ?? (finest < 3 ? reference.getHours() : 0)
  const day = parts.D ?? (finest < 4 ? reference.getDate() : 1)
  const month = parts.M ?? (finest < 5 ? reference.getMonth() + 1 : 1)
  const year = parts.YYYY ?? reference.getFullYear()

  // A year under 100 would land in the 1900s through the constructor, so it is set
  // afterwards. Everything else is built in one go on purpose: an hour daylight saving
  // skips has to be weighed in the year actually asked for, not in a stand-in one.
  const date = new Date(year, month - 1, day, hoursOfDay, minutes, seconds, milliseconds)
  if (year >= 0 && year < 100) date.setFullYear(year)
  const exists = date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
    && date.getHours() === hoursOfDay
    && date.getMinutes() === minutes
    && date.getSeconds() === seconds
    && date.getMilliseconds() === milliseconds
  return exists ? date : null
}
