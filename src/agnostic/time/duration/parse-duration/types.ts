import type { DurationTypeShort } from '../index.js'

/**
 * The short unit aliases a duration string may end with, **longest first**: the first
 * suffix that matches wins, so `ms` has to be tried before `m` and `mth` before `mo`.
 *
 * Case is load-bearing — `m` is minutes where `M` is months — so nothing is lowercased
 * on the way in.
 *
 * **A value, not just a union**: a consumer validating what an article wrote needs the
 * list at runtime, and a type has nothing to hand a validator.
 */
// [WIP] No frame unit: nothing in the DOM exposes a media's frame rate, so `456f` could
// only resolve against a rate declared by hand — 20% off on a 30fps file at the usual 25.
export const DURATION_SUFFIXES = [
  'mth',
  'sec',
  'min',
  'ms',
  'mo',
  's',
  'm',
  'h',
  'd',
  'w',
  'M',
  'y',
  'Y'
] as const satisfies readonly DurationTypeShort[]

/** One of {@link DURATION_SUFFIXES}. */
export type DurationSuffix = typeof DURATION_SUFFIXES[number]

/** Options for {@link parseDuration}. */
export type ParseDurationOptions = {
  /**
   * Months and years have no fixed length, so they are approximated. `true` (the
   * default) uses 30-day months and 365-day years, matching what `Duration` itself
   * computes. `false` uses the Gregorian mean year of 365.2425 days and a month of
   * exactly a twelfth of it — the same two readings `formatDuration` offers.
   */
  useApproximateMonthAndYear?: boolean
}
