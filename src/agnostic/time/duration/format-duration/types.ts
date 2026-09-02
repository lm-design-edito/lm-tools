/**
 * The units a duration can be broken down into, keyed the way `format-date`
 * tokens are — `'m'` is minutes, `'M'` is months.
 */
export type DurationUnit = 'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'M' | 'Y'

/** Options for `getDurationParts`. */
export type GetDurationPartsOptions = {
  /**
   * The units to break the duration down into, in any order. Omitted or empty,
   * a single unit is picked: the largest one the duration reaches.
   */
  units?: DurationUnit[]
  /**
   * Truncates the duration to a whole number of the smallest requested unit, so
   * no part comes out fractional. Defaults to `false`, which leaves the
   * remainder on the smallest unit.
   */
  floorSmallestUnit?: boolean
  /**
   * Months and years have no fixed length, so they are approximated. `true`
   * (the default) uses 30-day months and 365-day years, matching what
   * `Duration` itself computes. `false` uses the Gregorian mean year of
   * 365.2425 days and a month of exactly a twelfth of it.
   */
  useApproximateMonthAndYear?: boolean
}

/**
 * A duration's parts, keyed by unit token.
 *
 * Every unit is present: those left out of the breakdown are `0`. All parts
 * carry the sign of the input duration.
 */
export type DurationTokenParts = {
  /** Milliseconds. */
  ms: number
  /** Seconds. */
  s: number
  /** Minutes. */
  m: number
  /** Hours. */
  h: number
  /** Days. */
  d: number
  /** Weeks. */
  w: number
  /** Months. */
  M: number
  /** Years. */
  Y: number
}

/**
 * The same parts as {@link DurationTokenParts}, under names that read on their
 * own — one per token, same value.
 */
export type NamedDurationParts = {
  /** {@link DurationTokenParts.ms} */
  milliseconds: number
  /** {@link DurationTokenParts.s} */
  seconds: number
  /** {@link DurationTokenParts.m} */
  minutes: number
  /** {@link DurationTokenParts.h} */
  hours: number
  /** {@link DurationTokenParts.d} */
  days: number
  /** {@link DurationTokenParts.w} */
  weeks: number
  /** {@link DurationTokenParts.M} */
  months: number
  /** {@link DurationTokenParts.Y} */
  years: number
}

/** Every part of a duration, reachable both by unit token and by name. */
export type DurationParts = DurationTokenParts & NamedDurationParts
