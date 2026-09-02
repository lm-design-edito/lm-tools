import type { Duration } from '../index.js'
import { getDurationParts } from './parts.js'
import type {
  DurationParts,
  DurationToken,
  DurationUnit,
  FormatDurationOptions
} from './types.js'

// Alternation is ordered, and the first branch that fits wins — so the longest
// tokens come first. `m` ahead of `ms` or `mm` would swallow them.
const tokenRegexp = /\{\{(YY|MM|ww|dd|hh|mm|ss|ms|Y|M|w|d|h|m|s)\}\}/gv

/** Which tokens read which unit, longest unit first. */
const unitTokens: Array<[DurationUnit, DurationToken[]]> = [
  ['Y', ['Y', 'YY']],
  ['M', ['M', 'MM']],
  ['w', ['w', 'ww']],
  ['d', ['d', 'dd']],
  ['h', ['h', 'hh']],
  ['m', ['m', 'mm']],
  ['s', ['s', 'ss']],
  ['ms', ['ms']]
]

function pad (value: number, length: number): string {
  return `${value}`.padStart(length, '0')
}

/**
 * How each token renders the parts it reads. This is where padding lives —
 * {@link getDurationParts} hands over plain quantities, and a doubled token is
 * the same quantity written on two digits.
 */
const renderers: Record<DurationToken, (parts: DurationParts) => string> = {
  'Y': parts => `${parts.Y}`,
  'YY': parts => pad(parts.Y, 2),
  'M': parts => `${parts.M}`,
  'MM': parts => pad(parts.M, 2),
  'w': parts => `${parts.w}`,
  'ww': parts => pad(parts.w, 2),
  'd': parts => `${parts.d}`,
  'dd': parts => pad(parts.d, 2),
  'h': parts => `${parts.h}`,
  'hh': parts => pad(parts.h, 2),
  'm': parts => `${parts.m}`,
  'mm': parts => pad(parts.m, 2),
  's': parts => `${parts.s}`,
  'ss': parts => pad(parts.s, 2),
  'ms': parts => pad(parts.ms, 3)
}

/** The units a template asks for, read off the tokens it actually uses. */
function unitsInFormat (format: string): DurationUnit[] {
  return unitTokens
    .filter(([, tokens]) => tokens.some(token => format.includes(`{{${token}}}`)))
    .map(([unit]) => unit)
}

/**
 * Formats a duration into a string according to a custom template.
 *
 * The breakdown follows the template: the units it mentions are the units the
 * duration is split across, each taking its whole part and handing the rest
 * down. `'{{h}}:{{mm}}:{{ss}}'` therefore reads a duration as hours, minutes and
 * seconds, while `'{{s}}s'` puts the whole duration on seconds.
 *
 * Supported tokens (placeholders must be wrapped in `{{...}}`). The bare form is
 * the plain number, the doubled form the same number padded to two digits:
 *
 * - `Y` / `YY` : Years
 * - `M` / `MM` : Months
 * - `w` / `ww` : Weeks
 * - `d` / `dd` : Days
 * - `h` / `hh` : Hours
 * - `m` / `mm` : Minutes
 * - `s` / `ss` : Seconds
 * - `ms` : Milliseconds, padded to three digits
 *
 * @param duration - The duration to format, as a {@link Duration} or a number of
 * milliseconds.
 * @param format - The template string containing tokens.
 * @param options - How to handle the remainder and the month/year approximation.
 * @returns Formatted duration string. An unknown token is left untouched, braces
 * included.
 * @see {@link getDurationParts} to reach the same parts as plain values.
 *
 * @remarks
 * A negative duration yields negative parts, so every token renders a signed
 * number — `'{{m}}:{{ss}}'` gives `-1:-30`, not `-1:30`. Format the magnitude
 * and write the sign yourself when that matters.
 *
 * @example
 * formatDuration(seconds(3725), '{{h}}:{{mm}}:{{ss}}')
 * // => "1:02:05"
 */
export function formatDuration (
  duration: Duration | number,
  format: string,
  options: FormatDurationOptions = {}
): string {
  const {
    floorSmallestUnit = true,
    useApproximateMonthAndYear = true
  } = options
  const parts = getDurationParts(duration, {
    units: unitsInFormat(format),
    floorSmallestUnit,
    useApproximateMonthAndYear
  })
  return format.replace(
    tokenRegexp,
    (_match: string, token: DurationToken) => renderers[token](parts)
  )
}
