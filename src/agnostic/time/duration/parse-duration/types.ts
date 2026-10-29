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
