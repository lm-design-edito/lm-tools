import { knownDateFields, toPartialDate } from '../partial-date/index.js'
import type { DateField, PartialDate } from '../partial-date/types.js'
import { getDateParts } from './parts.js'
import type {
  DateParts,
  DateToken
} from './types.js'

/**
 * Formats a `Date` into a string according to a custom template and locale.
 *
 * Supported tokens (placeholders must be wrapped in `{{...}}`):
 *
 * **Day**
 * - `D` / `d` : Day of month (1–31)
 * - `DD` / `dd` : Day of month, padded (01–31)
 * - `ddd` : Short weekday name (Mon, Tue, ...)
 * - `dddd` : Full weekday name (Monday, Tuesday, ...)
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
 * **Optional group**
 * - `[[…]]` : a stretch of template dropped whole when a token inside it has
 *   nothing to render — `'[[{{DD}} ]]{{MMMM}} {{YYYY}}'` gives `14 March 2026`
 *   or `March 2026`. Groups don't nest.
 *
 * @param date - The `Date` to format, or a {@link PartialDate} some of whose parts
 * are unknown.
 * @param format - The template string containing tokens.
 * @param locale - Optional locale code (default: `'en'`).
 * @returns Formatted date string. An unknown token is left untouched, braces
 * included; a known token whose parts a {@link PartialDate} doesn't hold renders
 * as nothing, and takes its group with it when it sits in one.
 * @see {@link getDateParts} to reach the same parts as plain values, unpadded.
 * @see {@link parseDate} — the same template grammar, read back into a `Date`.
 * @see {@link formatDuration} — the same template grammar, for a length of time
 * rather than a point in it.
 *
 * @remarks
 * This function and `formatDuration` share one grammar, so a reader who has learnt
 * either knows the other: tokens are delimited by `{{…}}` and everything outside
 * them is literal; the bare token is the plain number and the doubled one is that
 * same number padded to two digits; `ms` is padded to three; and an unknown token
 * is left as written rather than blanked, so a typo shows.
 *
 * The optional group is this function's own, since a duration has no unknown parts
 * to drop a group over, and so is reading a {@link PartialDate} at all.
 *
 * No token means two different kinds of thing across the two. What differs is only
 * what each domain has to offer: a date has a meridiem, an ordinal suffix and a
 * 12-hour clock (`h`/`hh`, against `H`/`HH` for the 24-hour one), while a duration
 * has weeks and frames. The weekday names are `ddd`/`dddd`, mirroring `MMM`/`MMMM`
 * — `d`/`dd` are the day number, as they are in a duration.
 *
 * A partial date renders the parts it knows and drops the groups it cannot fill,
 * which is how one template serves every shape a record comes in. A part is
 * unknown when it is absent, `null` or `undefined`, and a hole is allowed
 * anywhere — `{ year: 2026, day: 14 }` renders its day and its year and nothing
 * in between. The template is the only place the wording lives, so a consumer
 * phrases its own `'courant {{YYYY}}'` rather than asking for a sentence here.
 *
 * @example
 * formatDate(new Date(2026, 0, 1, 15, 5), '{{YYYY}}-{{MM}}-{{DD}} {{hh}}:{{mm}} {{A}}')
 * // => "2026-01-01 03:05 PM"
 *
 * @example
 * const template = '[[{{DD}} ]][[{{MMMM}} ]]{{YYYY}}'
 * formatDate({ year: 2026, month: 3, day: 14 }, template)  // => "14 March 2026"
 * formatDate({ year: 2026, month: 3 }, template)           // => "March 2026"
 * formatDate({ year: 2026 }, template)                     // => "2026"
 */
export function formatDate (
  date: Date | PartialDate,
  format: string,
  locale = 'en'
): string {
  const partial = date instanceof Date ? toPartialDate(date) : date
  const known = new Set(knownDateFields(partial))
  const parts = getDateParts(standInFor(partial), locale)
  const ungrouped = format.replace(groupRegexp, (_match: string, group: string) => {
    const substituted = substitute(group, parts, known)
    return substituted.missing ? '' : substituted.text
  })
  return substitute(ungrouped, parts, known).text
}

// Everything below is internal. The functions are hoisted and the tables are only ever
// read from inside a call, so the entry point reads first and the machinery after it.

// Alternation is ordered, and the first branch that fits wins — so the longest
// tokens come first. `MM` ahead of `MMMM` would only work by backtracking off the
// closing braces, which is true but not something a reader should have to derive.
const tokenRegexp = /\{\{(MMMM|YYYY|dddd|MMM|ddd|DD|dd|MM|YY|HH|hh|mm|ss|th|ms|D|d|M|H|h|m|s|A|a)\}\}/gv

// An optional group, dropped whole when a token inside it has nothing to render. Not
// greedy and not nested: the first `]]` closes, and a second `[[` inside is literal text.
const groupRegexp = /\[\[([\s\S]*?)\]\]/gv

function pad (value: number, length: number): string {
  return `${value}`.padStart(length, '0')
}

/**
 * The parts each token reads, which is what says whether a partial date can render it.
 * A token asks for the fields it needs, not the one it is named after — a weekday name
 * takes a whole date to work out, and a meridiem reads the hours.
 */
const tokenFields: Record<DateToken, DateField[]> = {
  'D': ['day'],
  'DD': ['day'],
  'd': ['day'],
  'dd': ['day'],
  'ddd': ['year', 'month', 'day'],
  'dddd': ['year', 'month', 'day'],
  'M': ['month'],
  'MM': ['month'],
  'MMM': ['month'],
  'MMMM': ['month'],
  'YY': ['year'],
  'YYYY': ['year'],
  'H': ['hours'],
  'HH': ['hours'],
  'h': ['hours'],
  'hh': ['hours'],
  'm': ['minutes'],
  'mm': ['minutes'],
  's': ['seconds'],
  'ss': ['seconds'],
  'ms': ['milliseconds'],
  'A': ['hours'],
  'a': ['hours'],
  'th': ['day']
}

/**
 * How each token renders the parts it reads. This is where padding and
 * truncation live — {@link getDateParts} hands over plain quantities, and the
 * padded tokens are the same quantity written differently.
 */
const renderers: Record<DateToken, (parts: DateParts) => string> = {
  'D': parts => `${parts.D}`,
  'DD': parts => pad(parts.D, 2),
  'd': parts => `${parts.D}`,
  'dd': parts => pad(parts.D, 2),
  'ddd': parts => parts.ddd,
  'dddd': parts => parts.dddd,
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
 * Substitutes the tokens a stretch of template holds, and says whether one of them had
 * nothing to render — which is what a group needs to know before deciding to exist.
 */
function substitute (
  template: string,
  parts: DateParts,
  known: Set<DateField>
): { text: string, missing: boolean } {
  let missing = false
  const text = template.replace(tokenRegexp, (_match: string, token: DateToken) => {
    if (tokenFields[token].every(field => known.has(field))) return renderers[token](parts)
    missing = true
    return ''
  })
  return { text, missing }
}

/**
 * A `Date` standing in for a partial one, holding an arbitrary filler wherever a part is
 * unknown. Safe only because {@link tokenFields} stops every token that would read a
 * filled part from rendering at all.
 */
function standInFor (partial: PartialDate): Date {
  const month = partial.month ?? null
  const date = new Date(2000, 0, 1)
  // A year under 100 lands in the 1900s through the constructor, never through this.
  date.setFullYear(partial.year ?? 2000)
  if (month !== null) date.setMonth(month - 1)
  date.setDate(partial.day ?? 1)
  // A 30th of February rolls over into March, where the rest of the family clamps —
  // `setDate(0)` walks back to the last day of the month that was asked for.
  if (month !== null && date.getMonth() !== month - 1) date.setDate(0)
  date.setHours(
    partial.hours ?? 0,
    partial.minutes ?? 0,
    partial.seconds ?? 0,
    partial.milliseconds ?? 0
  )
  return date
}
