import { Duration } from '../index.js'
import type {
  DurationParts,
  DurationUnit,
  GetDurationPartsOptions
} from './types.js'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const APPROXIMATE_YEAR = 365 * DAY
const APPROXIMATE_MONTH = 30 * DAY
/** The Gregorian mean year — 365.2425 days, the calendar's actual average. */
const EXACT_YEAR = 365.2425 * DAY
const EXACT_MONTH = EXACT_YEAR / 12

/** Units from the longest to the shortest, in both approximation modes. */
const unitsLongestFirst: DurationUnit[] = ['Y', 'M', 'w', 'd', 'h', 'm', 's', 'ms']

/** How many milliseconds each unit is worth, under the chosen approximation. */
function unitLengths (useApproximateMonthAndYear: boolean): Record<DurationUnit, number> {
  return {
    ms: 1,
    s: SECOND,
    m: MINUTE,
    h: HOUR,
    d: DAY,
    w: WEEK,
    M: useApproximateMonthAndYear ? APPROXIMATE_MONTH : EXACT_MONTH,
    Y: useApproximateMonthAndYear ? APPROXIMATE_YEAR : EXACT_YEAR
  }
}

/**
 * The requested units, deduplicated and ordered longest first. Falls back to the
 * single largest unit the duration reaches, and to `'ms'` for a duration shorter
 * than a millisecond.
 */
function resolveUnits (
  units: DurationUnit[] | undefined,
  absoluteMs: number,
  lengths: Record<DurationUnit, number>
): DurationUnit[] {
  if (units !== undefined && units.length > 0) {
    return unitsLongestFirst.filter(unit => units.includes(unit))
  }
  return [unitsLongestFirst.find(unit => absoluteMs >= lengths[unit]) ?? 'ms']
}

/**
 * Breaks a duration down into its parts, cascading the remainder from each unit
 * to the next.
 *
 * With several units, each one takes its whole part and hands the rest down, so
 * `['M', 'd', 's']` reads as *X months and Y days and Z.mmm seconds*. With a
 * single unit — including the one picked when `units` is omitted — that unit
 * carries the whole duration, fraction included.
 *
 * @param duration - The duration to break down, as a {@link Duration} or a
 * number of milliseconds.
 * @param options - Which units to use, and how to handle the remainder.
 * @returns The parts, each one reachable under its unit token and under its
 * readable name. Units left out of the breakdown are `0`.
 * @see {@link DurationParts}
 *
 * @remarks
 * A negative duration is broken down by magnitude, then every part is negated.
 * `floorSmallestUnit` truncates the duration *before* the cascade, so the whole
 * breakdown describes the truncated duration rather than the original one —
 * `1m 59.6s` gives `1m 59s`, and the missing `.6s` is gone from every part.
 *
 * @example
 * getDurationParts(days(400), { units: ['Y', 'd'] })
 * // => { Y: 1, years: 1, d: 35, days: 35, … every other unit at 0 }
 *
 * getDurationParts(days(400))
 * // => { Y: 1.0958…, years: 1.0958…, … } — the largest unit it reaches
 */
export function getDurationParts (
  duration: Duration | number,
  options: GetDurationPartsOptions = {}
): DurationParts {
  const {
    units,
    floorSmallestUnit = false,
    useApproximateMonthAndYear = true
  } = options
  const totalMs = duration instanceof Duration ? duration.toMs() : duration
  const sign = totalMs < 0 ? -1 : 1
  const lengths = unitLengths(useApproximateMonthAndYear)
  const usedUnits = resolveUnits(units, Math.abs(totalMs), lengths)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const smallestUnit = usedUnits[usedUnits.length - 1]!
  const smallestLength = lengths[smallestUnit]
  let remaining = Math.abs(totalMs)
  if (floorSmallestUnit) { remaining = Math.floor(remaining / smallestLength) * smallestLength }
  const values: Record<DurationUnit, number> = {
    ms: 0, s: 0, m: 0, h: 0, d: 0, w: 0, M: 0, Y: 0
  }
  usedUnits.forEach((unit, pos) => {
    const isSmallest = pos === usedUnits.length - 1
    const exact = remaining / lengths[unit]
    // Math.round, not Math.floor, and deliberately so: the truncation already
    // happened above, on the whole duration, so this value is a whole one by
    // now. Rounding only clears the floating-point dust the divisions leave —
    // flooring here would turn a 29.999999999 that means 30 into a 29.
    const value = isSmallest
      ? (floorSmallestUnit ? Math.round(exact) : exact)
      : Math.floor(exact)
    values[unit] = value === 0 ? 0 : value * sign
    remaining -= value * lengths[unit]
  })
  return {
    ...values,
    milliseconds: values.ms,
    seconds: values.s,
    minutes: values.m,
    hours: values.h,
    days: values.d,
    weeks: values.w,
    months: values.M,
    years: values.Y
  }
}

// [WIP] formatDuration, the string side, is still to write — same shape as
// formatDate: an index.ts holding a template substitution over these parts.
