import { Duration } from '../../duration/index.js'
import type { DurationType } from '../../duration/index.js'
import { monthNames, weekdayNames } from '../calendar-names/index.js'
import type { InferDateOptions } from './types.js'

/** The parts a date is made of, coarsest first — the order is the precision scale. */
const FIELDS = ['year', 'month', 'day', 'hours', 'minutes', 'seconds'] as const

type Field = typeof FIELDS[number]

/**
 * One thing a token asks of the cursor, plus the finest part it names — `null` when it
 * names none, which is what tells an offset from a date.
 */
type Op = {
  precision: Field | null
  apply: (date: Date) => void
}

/** Whether an op places the date itself, rather than the time or a mere offset. */
function placesDate (op: Op): boolean {
  return op.precision !== null && FIELDS.indexOf(op.precision) <= FIELDS.indexOf('day')
}

/** How far a seek looks: forward, backward, or forward from today included. */
type Direction = -1 | 0 | 1

/** A quantity and its unit, waiting for the sign that will make it an offset. */
type Quantity = {
  amount: number
  unit: DurationType
  atoms: string[]
}

const DAY_ANCHORS: Record<string, number> = {
  today: 0,
  yesterday: -1,
  tomorrow: 1
}

// Arbitrary, and owned as such: a time of day is a range and this is the hour it reads
// as. `tonight` is in here rather than among the day anchors because today is already
// where the cursor starts.
const NAMED_TIMES: Record<string, number> = {
  midnight: 0,
  morning: 8,
  noon: 12,
  midday: 12,
  afternoon: 14,
  evening: 20,
  night: 20,
  tonight: 20
}

const QUANTITY_WORDS: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  half: 0.5
}

/** One row per spelling, all of them valued in `Duration`'s own units. */
const UNITS: Record<string, DurationType> = {
  millisecond: 'milliseconds',
  milliseconds: 'milliseconds',
  ms: 'milliseconds',
  second: 'seconds',
  seconds: 'seconds',
  sec: 'seconds',
  secs: 'seconds',
  minute: 'minutes',
  minutes: 'minutes',
  min: 'minutes',
  mins: 'minutes',
  hour: 'hours',
  hours: 'hours',
  hr: 'hours',
  hrs: 'hours',
  h: 'hours',
  day: 'days',
  days: 'days',
  d: 'days',
  week: 'weeks',
  weeks: 'weeks',
  w: 'weeks',
  month: 'months',
  months: 'months',
  mo: 'months',
  year: 'years',
  years: 'years',
  yr: 'years',
  yrs: 'years',
  y: 'years'
}

const SEEK_WORDS: Record<string, Direction> = {
  next: 1,
  coming: 1,
  last: -1,
  previous: -1,
  this: 0
}

// A sign arms the quantities that follow it and stays armed, so one `in` carries a whole
// sentence: `in 2 days and 3 hours` is both. A postfix sign reaches the other way, over
// the quantities read before it — `2 days and 3 hours ago` is also both.
const PREFIX_SIGNS: Record<string, number> = { in: 1, plus: 1, '+': 1, minus: -1, '-': -1 }
const POSTFIX_SIGNS: Record<string, number> = { ago: -1, later: 1, from: 1, hence: 1 }

const QUALIFIERS: Record<string, 'time' | 'date'> = { at: 'time', on: 'date' }

/** Skipped while looking ahead for the unit a quantity belongs to. */
const ARTICLES = ['a', 'an', 'the']

/** What a sentence is held together with, and what is never worth reporting as ignored. */
const NOISE = [...ARTICLES, 'and', 'of', 'oclock']

const CLOCK = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/v
// `9h`, `9h30`, `9h30min`, `9h30min20`, `9h30min20sec` — the form a clock takes when the
// colon is dropped. A bare `9h` is the only ambiguous one: `in 9h` is nine hours and
// `at 9h` is nine o'clock, which the fold settles on the sign rather than here.
const COMPACT_CLOCK = /^(\d{1,2})h(?:(\d{1,2})(?:min(?:(\d{1,2})(?:sec)?)?)?)?$/v
const NUMERIC_DATE = /^(\d{4})-(\d{1,2})-(\d{1,2})$/v
const ORDINAL = /^(\d{1,2})(?:st|nd|rd|th)$/v
const DIGITS = /^\d+$/v
const MERIDIEM = /^([ap])m$/v

// Compound shapes first, so a clock, a numeric date and an ordinal survive a split that
// drops every separator. Everything else is a run of digits, a run of letters or a lone
// sign, and whatever falls between them — spaces, commas, dashes — is a separator.
const ATOM = /\d{1,2}:\d{2}(?::\d{2})?|\d{1,2}h(?:\d{1,2}(?:min(?:\d{1,2}(?:sec)?)?)?)?|\d{4}-\d{1,2}-\d{1,2}|\d{1,2}(?:st|nd|rd|th)|\d+|\p{L}+|[+\-]/gv

function lex (raw: string): string[] {
  return [...raw.toLowerCase().matchAll(ATOM)].map(match => match[0])
}

function daysInMonth (year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * Writing a month or a year can land on a day the target has not got, and the rollover
 * would then move the very field being written — a 31st asked to become February comes
 * back as March. The day is parked, the write happens, the day comes back clamped.
 */
function writeClamped (date: Date, write: (parked: Date) => void): void {
  const day = date.getDate()
  date.setDate(1)
  write(date)
  date.setDate(Math.min(day, daysInMonth(date.getFullYear(), date.getMonth() + 1)))
}

function setMonth (date: Date, month: number): void {
  writeClamped(date, parked => { parked.setMonth(month - 1) })
}

function setYear (date: Date, year: number): void {
  writeClamped(date, parked => { parked.setFullYear(year) })
}

function addMonths (date: Date, amount: number): void {
  writeClamped(date, parked => { parked.setMonth(parked.getMonth() + amount) })
}

/**
 * The weekday of the week the cursor is already in, rather than the next one — what
 * `on monday` means once another token has established a date.
 *
 * The week is the ISO one, starting on a Monday, rather than the locale's own:
 * `Intl.Locale.prototype.getWeekInfo` carries that but is not everywhere yet, and a
 * reading that changes with the runtime is worse than one that is merely British. It
 * only makes a difference for a cursor sitting on a Sunday.
 */
function seekWithinWeek (date: Date, target: number): void {
  const fromMonday = (day: number): number => (day + 6) % 7
  date.setDate(date.getDate() + fromMonday(target) - fromMonday(date.getDay()))
}

function seekWeekday (date: Date, target: number, direction: Direction): void {
  const current = date.getDay()
  if (direction === -1) {
    const back = (current - target + 7) % 7
    date.setDate(date.getDate() - (back === 0 ? 7 : back))
    return
  }
  const forward = (target - current + 7) % 7
  date.setDate(date.getDate() + (forward === 0 && direction === 1 ? 7 : forward))
}

/** `true` when the target month or day is reachable without leaving the current period. */
function withinPeriod (target: number, current: number, direction: Direction): boolean {
  if (direction === -1) return target < current
  if (direction === 1) return target > current
  return target >= current
}

function seekMonth (date: Date, target: number, direction: Direction): void {
  if (!withinPeriod(target, date.getMonth() + 1, direction)) {
    setYear(date, date.getFullYear() + (direction === -1 ? -1 : 1))
  }
  setMonth(date, target)
}

function seekDayOfMonth (date: Date, target: number, direction: Direction): void {
  if (!withinPeriod(target, date.getDate(), direction)) {
    addMonths(date, direction === -1 ? -1 : 1)
  }
  if (target <= daysInMonth(date.getFullYear(), date.getMonth() + 1)) date.setDate(target)
}

/**
 * Days, weeks, months and years are walked on the calendar rather than in milliseconds,
 * so a shift keeps the hour it started on across a daylight saving change. A fractional
 * amount has no calendar meaning, so it goes through `Duration` and its approximations.
 */
function shift (date: Date, amount: number, unit: DurationType): void {
  if (Number.isInteger(amount)) {
    if (unit === 'years') { setYear(date, date.getFullYear() + amount); return }
    if (unit === 'months') { addMonths(date, amount); return }
    if (unit === 'weeks') { date.setDate(date.getDate() + amount * 7); return }
    if (unit === 'days') { date.setDate(date.getDate() + amount); return }
  }
  date.setTime(date.getTime() + new Duration(amount, unit).toMilliseconds())
}

/** Below the finest part named, nothing was named — so nothing is kept. */
function truncate (date: Date, depth: number): void {
  if (depth < FIELDS.indexOf('seconds')) date.setSeconds(0, 0)
  else date.setMilliseconds(0)
  if (depth < FIELDS.indexOf('minutes')) date.setMinutes(0)
  if (depth < FIELDS.indexOf('hours')) date.setHours(0)
  if (depth < FIELDS.indexOf('day')) date.setDate(1)
  if (depth < FIELDS.indexOf('month')) date.setMonth(0)
}

/** A locale's names for one unit, short and long, against the number each one is. */
function nameTable (long: string[], short: string[]): Record<string, number> {
  const table: Record<string, number> = {}
  // A short name can carry a trailing dot — `janv.` — which the lexer has already
  // dropped as a separator.
  for (const [index, name] of [...long, ...short].entries()) {
    table[name.toLowerCase().replace(/\.$/v, '')] = index % long.length
  }
  return table
}

function fold (atoms: string[], locale: string): { ops: Op[], ignored: string[] } {
  const months = nameTable(monthNames(locale, 'long'), monthNames(locale, 'short'))
  const weekdays = nameTable(weekdayNames(locale, 'long'), weekdayNames(locale, 'short'))
  const ops: Op[] = []
  const ignored: string[] = []
  const waiting: Quantity[] = []
  let seek: Direction | null = null
  let sign: number | null = null
  let qualifier: 'time' | 'date' | null = null
  let index = 0

  /** The unit a quantity belongs to, past the articles between the two. */
  function unitAhead (from: number): { unit: DurationType, at: number } | null {
    let position = from
    while (ARTICLES.includes(atoms[position] ?? '')) position += 1
    const atom = atoms[position]
    if (atom === undefined) return null
    const unit = UNITS[atom]
    return unit === undefined ? null : { unit, at: position }
  }

  function pushShift (amount: number, unit: DurationType): void {
    ops.push({ precision: null, apply: date => { shift(date, amount, unit) } })
  }

  /** Signs everything read so far, and stays armed for everything after it. */
  function applySign (direction: number): void {
    for (const held of waiting) pushShift(held.amount * direction, held.unit)
    waiting.length = 0
    sign = direction
  }

  /** An offset when the quantity has a unit — signed now, or parked until a sign comes. */
  function takeQuantity (amount: number, text: string): boolean {
    const ahead = unitAhead(index)
    if (ahead === null) return false
    const unitAtom = atoms[ahead.at] ?? ''
    index = ahead.at + 1
    if (sign === null) {
      waiting.push({ amount, unit: ahead.unit, atoms: [text, unitAtom] })
      return true
    }
    pushShift(amount * sign, ahead.unit)
    return true
  }

  function takeDay (value: number): void {
    const direction = seek
    seek = null
    if (direction === null) {
      ops.push({ precision: 'day', apply: date => { date.setDate(value) } })
      return
    }
    ops.push({ precision: 'day', apply: date => { seekDayOfMonth(date, value, direction) } })
  }

  function takeHours (value: number): void {
    ops.push({ precision: 'hours', apply: date => { date.setHours(value) } })
  }

  function takeClock (hours: number, minutes: number | null, seconds: number | null): void {
    if (hours > 23 || (minutes !== null && minutes > 59) || (seconds !== null && seconds > 59)) {
      return
    }
    takeHours(hours)
    if (minutes !== null) ops.push({ precision: 'minutes', apply: date => { date.setMinutes(minutes) } })
    if (seconds !== null) ops.push({ precision: 'seconds', apply: date => { date.setSeconds(seconds) } })
  }

  /** The meridiem a number is followed by, if any, consumed on the spot. */
  function meridiemAhead (): 'a' | 'p' | null {
    const match = MERIDIEM.exec(atoms[index] ?? '')
    if (match === null) return null
    index += 1
    return match[1] === 'p' ? 'p' : 'a'
  }

  while (index < atoms.length) {
    const atom = atoms[index]
    index += 1
    if (atom === undefined) continue

    const clock = CLOCK.exec(atom)
    if (clock !== null) {
      const hours = Number.parseInt(clock[1] ?? '', 10)
      const minutes = Number.parseInt(clock[2] ?? '', 10)
      const seconds = clock[3] === undefined ? null : Number.parseInt(clock[3], 10)
      const meridiem = meridiemAhead()
      const onTheClock = meridiem === null || hours > 12
        ? hours
        : (hours % 12) + (meridiem === 'p' ? 12 : 0)
      const before = ops.length
      takeClock(onTheClock, minutes, seconds)
      if (ops.length === before) ignored.push(atom)
      continue
    }

    const compact = COMPACT_CLOCK.exec(atom)
    if (compact !== null) {
      const hours = Number.parseInt(compact[1] ?? '', 10)
      const minutes = compact[2] === undefined ? null : Number.parseInt(compact[2], 10)
      const seconds = compact[3] === undefined ? null : Number.parseInt(compact[3], 10)
      // `in 9h` is a quantity of hours; `9h` and `at 9h` are an hour of the day. Only the
      // form with no minutes is in any doubt.
      if (minutes === null && sign !== null) {
        pushShift(hours * sign, 'hours')
        continue
      }
      const before = ops.length
      takeClock(hours, minutes, seconds)
      if (ops.length === before) ignored.push(atom)
      continue
    }

    const numeric = NUMERIC_DATE.exec(atom)
    if (numeric !== null) {
      const year = Number.parseInt(numeric[1] ?? '', 10)
      const month = Number.parseInt(numeric[2] ?? '', 10)
      const day = Number.parseInt(numeric[3] ?? '', 10)
      if (month < 1 || month > 12 || day < 1 || day > 31) {
        ignored.push(atom)
        continue
      }
      ops.push({ precision: 'year', apply: date => { setYear(date, year) } })
      ops.push({ precision: 'month', apply: date => { setMonth(date, month) } })
      ops.push({ precision: 'day', apply: date => { date.setDate(day) } })
      continue
    }

    const ordinal = ORDINAL.exec(atom)
    if (ordinal !== null) {
      const value = Number.parseInt(ordinal[1] ?? '', 10)
      if (value >= 1 && value <= 31) takeDay(value)
      else ignored.push(atom)
      continue
    }

    if (DIGITS.test(atom)) {
      const value = Number.parseInt(atom, 10)
      const meridiem = meridiemAhead()
      if (meridiem !== null) {
        if (value >= 1 && value <= 12) takeHours((value % 12) + (meridiem === 'p' ? 12 : 0))
        else ignored.push(atom)
        continue
      }
      // `at` has already said what the number is, so it is not a quantity even when a
      // unit follows it: `at 9 h` is nine o'clock, and the `h` is noise.
      if (qualifier === 'time') {
        qualifier = null
        if (value <= 23) takeHours(value)
        else ignored.push(atom)
        continue
      }
      if (takeQuantity(value, atom)) continue
      if (atom.length === 4) {
        ops.push({ precision: 'year', apply: date => { setYear(date, value) } })
        continue
      }
      qualifier = null
      if (value >= 1 && value <= 31) takeDay(value)
      else ignored.push(atom)
      continue
    }

    const quantity = QUANTITY_WORDS[atom]
    if (quantity !== undefined && takeQuantity(quantity, atom)) continue

    const namedTime = NAMED_TIMES[atom]
    if (namedTime !== undefined) {
      // `last night` is yesterday evening, `next morning` tomorrow's — a direction on a
      // time of day moves the day it belongs to.
      const direction = seek
      seek = null
      if (direction !== null && direction !== 0) {
        ops.push({ precision: 'day', apply: date => { date.setDate(date.getDate() + direction) } })
      }
      takeHours(namedTime)
      continue
    }

    const anchor = DAY_ANCHORS[atom]
    if (anchor !== undefined) {
      ops.push({ precision: 'day', apply: date => { date.setDate(date.getDate() + anchor) } })
      continue
    }

    if (atom === 'now') {
      ops.push({ precision: null, apply: () => undefined })
      continue
    }

    const month = months[atom]
    if (month !== undefined) {
      const direction = seek
      seek = null
      const value = month + 1
      if (direction === null) ops.push({ precision: 'month', apply: date => { setMonth(date, value) } })
      else ops.push({ precision: 'month', apply: date => { seekMonth(date, value, direction) } })
      continue
    }

    const weekday = weekdays[atom]
    if (weekday !== undefined) {
      const direction = seek
      seek = null
      // A weekday is not a field anyone can set, so it is always a seek. With no date
      // established yet it is the coming one, today included — `monday` and `on monday`
      // both mean the Monday ahead. Once another token has established a date, the
      // cursor is somewhere we travelled to rather than now, and the weekday scopes to
      // that week: `the 6th, on monday` is the Monday of the 6th's week.
      if (direction === null && ops.some(placesDate)) {
        ops.push({ precision: 'day', apply: date => { seekWithinWeek(date, weekday) } })
        continue
      }
      ops.push({ precision: 'day', apply: date => { seekWeekday(date, weekday, direction ?? 0) } })
      continue
    }

    const unit = UNITS[atom]
    if (unit !== undefined) {
      const direction = seek
      seek = null
      // A calendar step, not an offset: `next week` moves one week and says nothing
      // about the time of day, where `in a week` had to be signed to mean anything.
      if (direction !== null && direction !== 0) pushShift(direction, unit)
      else ignored.push(atom)
      continue
    }

    const direction = SEEK_WORDS[atom]
    if (direction !== undefined) {
      seek = direction
      continue
    }

    const prefix = PREFIX_SIGNS[atom]
    if (prefix !== undefined) {
      sign = prefix
      continue
    }

    const postfix = POSTFIX_SIGNS[atom]
    if (postfix !== undefined) {
      applySign(postfix)
      continue
    }

    const asked = QUALIFIERS[atom]
    if (asked !== undefined) {
      qualifier = asked
      continue
    }

    if (!NOISE.includes(atom)) ignored.push(atom)
  }

  // A quantity nobody ever signed says nothing about which three days it means, so it
  // is dropped — and reported, since dropping it silently is how `21h30` used to read
  // as the 30th.
  for (const held of waiting) ignored.push(...held.atoms)

  return { ops, ignored }
}

/**
 * Reads a date the way it is spoken — `next thursday at 9:20pm`, `in 3 days, at
 * midnight`, `yesterday`, `next december`, `21h30` — into a `Date`.
 *
 * @param raw - The string to read. Nothing in it has to be a date, and nothing in it
 * has to be in any particular order.
 * @param locale - Optional locale code (default: `'en'`), which the month and weekday
 * names are read in. The rest of the vocabulary is English either way.
 * @param options - See {@link InferDateOptions}.
 * @returns The date, or `null` when no token named one.
 * @see {@link parseDate} when the string's shape is known in advance — a template is
 * stricter, and it is what a machine wrote.
 *
 * @remarks
 * **Naming a day gives that day at midnight; offsetting by a duration keeps the time of
 * day.** So `tomorrow` is tomorrow at 00:00 and `next december` is the 1st at 00:00,
 * while `in 3 days` is this same hour three days out — which is why `in 3 days, at
 * midnight` has something to add. More generally, every part finer than the finest one
 * named falls to its minimum, and every part left unnamed comes from the reference.
 *
 * **A weekday reads forward until something else has placed the date.** `monday` and
 * `on monday` are the Monday ahead, today included, because that is the way the language
 * leans when nothing says otherwise. But once another token has established a date, the
 * weekday scopes to that date's week instead of running off into the next one — so
 * `2026-03-14, on monday` is the Monday of that Saturday's week. An explicit `next` or
 * `last` always wins over both readings.
 *
 * **A seek never lands back on where it started**: asked on a Thursday, `next thursday`
 * is seven days out, and in October `last december` is the December before. A bare
 * `december` sets the month in the reference year, since nothing asked for a seek, but a
 * bare weekday is always a seek — the coming one, today included — because a weekday is
 * not a part a date can be told to have.
 *
 * **A sign carries across the whole string**, forwards from `in`, `plus`, `minus`, `+`
 * and `-`, and backwards from `ago`, `later`, `from` and `hence` over everything read
 * before them. So `in 2 days and 3 hours` is both, and so is `2 days and 3 hours ago`. A
 * quantity no sign ever reached is dropped, since `3 days` says nothing about which
 * three days.
 *
 * **Reading is lax by construction.** Whitespace and punctuation are separators, a token
 * no table knows is skipped rather than fatal, and nothing is positional: `9pm next
 * thursday` and `next thursday at 9pm` are the same instant. When two tokens name the
 * same part, the later one wins. Nothing here ever throws, and what the read could not
 * use reaches `onIgnored` rather than changing the answer.
 *
 * @example
 * inferDate('next thursday at 9:20pm')
 * // => the coming Thursday, 21:20:00.000
 */
export function inferDate (
  raw: string,
  locale = 'en',
  options: InferDateOptions = {}
): Date | null {
  const { ops, ignored } = fold(lex(raw), locale)
  if (ignored.length > 0) options.onIgnored?.(ignored)
  if (ops.length === 0) return null
  const date = new Date(options.reference ?? new Date())
  for (const op of ops) op.apply(date)
  const depth = ops.reduce(
    (deepest, op) => Math.max(deepest, op.precision === null ? -1 : FIELDS.indexOf(op.precision)),
    -1
  )
  if (depth !== -1) truncate(date, depth)
  return Number.isFinite(date.getTime()) ? date : null
}
