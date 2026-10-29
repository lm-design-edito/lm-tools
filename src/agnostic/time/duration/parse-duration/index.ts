import { Duration } from '../index.js'
import { DURATION_SUFFIXES } from './types.js'

// A decimal, with an optional minus. Deliberately not `Number`, which would also take
// `1e3` and `0x10` — forms nobody means to write in an article.
const VALUE_PATTERN = /^-?\d+(?:\.\d+)?$/v

/**
 * Reads a suffixed duration — `'1.2min'`, `'500ms'`, `'12s'`, `'3h'` — into
 * milliseconds. A bare number is milliseconds, so `'500'` is 500.
 *
 * A negative value is returned as such: what it means is the caller's business, and a
 * video reads it as counting back from the end.
 *
 * @param raw - The string to read, surrounding whitespace aside.
 * @returns The duration in milliseconds, or `null` when the string is not one —
 * which is how a caller tells a typo from a value and warns about it.
 *
 * @remarks
 * `mo`, `mth`, `M` and the years are converted by {@link Duration}, where a month is
 * a flat 30 days and a year a flat 365 — see the `[WIP]` on its `toMilliseconds`.
 */
export function parseDuration (raw: string): number | null {
  const trimmed = raw.trim()
  const suffix = DURATION_SUFFIXES.find(candidate => trimmed.endsWith(candidate))
  const value = suffix === undefined ? trimmed : trimmed.slice(0, -suffix.length)
  if (!VALUE_PATTERN.test(value)) return null
  return new Duration(Number(value), suffix ?? 'ms').toMilliseconds()
}
