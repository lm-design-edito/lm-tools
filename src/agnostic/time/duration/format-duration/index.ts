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
const tokenRegexp = /\{\{(YY|MM|ww|dd|hh|mm|ss|ms|ff|Y|M|w|d|h|m|s|f)\}\}/gv

/**
 * Which tokens read which unit, longest unit first.
 *
 * `f` and `ff` sit under `ms` rather than under a unit of their own: a frame is
 * the millisecond part counted in another base, so a template asking for frames
 * is a template asking the cascade to run down to milliseconds.
 */
const unitTokens: Array<[DurationUnit, DurationToken[]]> = [
  ['Y', ['Y', 'YY']],
  ['M', ['M', 'MM']],
  ['w', ['w', 'ww']],
  ['d', ['d', 'dd']],
  ['h', ['h', 'hh']],
  ['m', ['m', 'mm']],
  ['s', ['s', 'ss']],
  ['ms', ['ms', 'f', 'ff']]
]

function pad (value: number, length: number): string {
  return `${value}`.padStart(length, '0')
}

/**
 * How each token renders the parts it reads. This is where padding lives —
 * {@link getDurationParts} hands over plain quantities, and a doubled token is
 * the same quantity written on two digits.
 */
const renderers: Record<DurationToken, (parts: DurationParts, fps: number) => string> = {
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
  'ms': parts => pad(parts.ms, 3),
  'f': (parts, fps) => `${toFrames(parts.ms, fps)}`,
  'ff': (parts, fps) => pad(toFrames(parts.ms, fps), 2)
}

/**
 * The millisecond part counted in frames.
 *
 * Truncated rather than rounded: a frame is only reached once it has fully
 * elapsed, so 39 ms at 25 fps is frame `0`, not frame `1`. The sign is carried
 * around the truncation, so a negative part stays negative — the whole function
 * keeps a duration's parts faithful rather than tidying them.
 */
function toFrames (ms: number, fps: number): number {
  const sign = ms < 0 ? -1 : 1
  return Math.floor(Math.abs(ms) / 1000 * fps) * sign
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
 * - `f` / `ff` : The millisecond part counted in frames, at `options.fps`
 *
 * @param duration - The duration to format, as a {@link Duration} or a number of
 * milliseconds.
 * @param format - The template string containing tokens.
 * @param options - How to handle the remainder, the month/year approximation and
 * the frame rate.
 * @returns Formatted duration string. An unknown token is left untouched, braces
 * included.
 * @see {@link getDurationParts} to reach the same parts as plain values.
 * @see {@link formatDate} — the same template grammar, for a point in time rather
 * than a length of it.
 *
 * @remarks
 * This function and `formatDate` share one grammar: `{{…}}` delimiters, everything
 * outside them literal, the bare token being the plain number and the doubled one
 * that same number padded to two digits, `ms` padded to three, and an unknown token
 * left as written. No token means two different kinds of thing across the two.
 *
 * @remarks
 * **The template decides the breakdown, so nothing is ever lost for not having been
 * asked for.** `'{{w}}w {{h}}h'` counts hours up to 167 because the week is there and
 * the day is not; `'{{mm}}:{{ss}}'` on an hour-long video reads `62:05` rather than
 * dropping the hour. The single-unit case follows from the same rule: `'{{s}}s'`
 * carries the whole duration.
 *
 * @remarks
 * A negative duration yields negative parts, so every token renders a signed
 * number — `'{{m}}:{{ss}}'` gives `-1:-30`, not `-1:30`. This is deliberate: the
 * output stays faithful to the parts, and keeping a duration positive is the
 * caller's business. Format the magnitude and write the sign yourself when a
 * single leading minus is what you need.
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
    useApproximateMonthAndYear = true,
    fps = 25
  } = options
  const parts = getDurationParts(duration, {
    units: unitsInFormat(format),
    floorSmallestUnit,
    useApproximateMonthAndYear
  })
  return format.replace(
    tokenRegexp,
    (_match: string, token: DurationToken) => renderers[token](parts, fps)
  )
}
