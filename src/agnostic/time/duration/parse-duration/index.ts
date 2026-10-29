import { Duration } from '../index.js'
import { DURATION_SUFFIXES } from './types.js'
import type { ParseDurationOptions } from './types.js'

// A decimal, with an optional minus. Deliberately not `Number`, which would also take
// `1e3` and `0x10` — forms nobody means to write in an article.
const VALUE_PATTERN = /^-?\d+(?:\.\d+)?$/v

// The Gregorian mean year, spelled exactly as `format-duration`'s `EXACT_YEAR` so the
// two agree bit for bit — the float is four millionths of a millisecond short.
const GREGORIAN_YEAR_MS = 365.2425 * 24 * 60 * 60 * 1000

const MONTH_SUFFIXES = ['mo', 'mth', 'M']
const YEAR_SUFFIXES = ['y', 'Y']

/**
 * Reads a suffixed duration — `'1.2min'`, `'500ms'`, `'12s'`, `'3h'` — into
 * milliseconds. A bare number is milliseconds, so `'500'` is 500.
 *
 * A negative value is returned as such: what it means is the caller's business, and a
 * video reads it as counting back from the end.
 *
 * **Whitespace is ignored wherever it falls** and **a comma reads as a decimal point**,
 * so `'1 , 3 ms'` is `1.3`. This is a lexer for what a human typed, and both forms are
 * what a human types; the strictness that matters is elsewhere — an unknown unit or a
 * number JavaScript would accept and nobody writes.
 *
 * @param raw - The string to read.
 * @param options - See {@link ParseDurationOptions}.
 * @returns The duration in milliseconds, or `null` when the string is not one —
 * which is how a caller tells a typo from a value and warns about it.
 *
 * @remarks
 * **A comma is never a thousands separator**, so `'1,200'` is `1.2` and not `1200`.
 * There is no notation for grouping digits, and a string carrying both separators is
 * refused rather than guessed at.
 *
 * A comma also cannot survive the command grammar, which splits an argument list on
 * it — `'jump-to:1,2min'` arrives as two arguments. That is the caller's problem, not
 * this function's.
 */
export function parseDuration (
  raw: string,
  options: ParseDurationOptions = {}
): number | null {
  const { useApproximateMonthAndYear = true } = options
  const compact = raw.replace(/\s+/gv, '').replace(',', '.')
  const suffix = DURATION_SUFFIXES.find(candidate => compact.endsWith(candidate))
  const value = suffix === undefined ? compact : compact.slice(0, -suffix.length)
  if (!VALUE_PATTERN.test(value)) return null
  const numericValue = Number(value)
  if (suffix !== undefined && !useApproximateMonthAndYear) {
    if (MONTH_SUFFIXES.includes(suffix)) return numericValue * GREGORIAN_YEAR_MS / 12
    if (YEAR_SUFFIXES.includes(suffix)) return numericValue * GREGORIAN_YEAR_MS
  }
  return new Duration(numericValue, suffix ?? 'ms').toMilliseconds()
}
