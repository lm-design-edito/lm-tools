import { Duration } from '../../duration/index.js'
import type { DurationType } from '../../duration/index.js'
import { monthNames, weekdayNames } from '../calendar-names/index.js'
import type { ReadDateOptions } from './types.js'

/** The parts a date is made of, coarsest first — the order is the precision scale. */
const FIELDS = ['year', 'month', 'day', 'hours', 'minutes', 'seconds', 'milliseconds'] as const

type Field = typeof FIELDS[number]

/**
 * One thing a token asks of the cursor, plus the finest part it names — `null` when it
 * names none, which is what tells an offset from a date.
 */
type Op = {
  precision: Field | null
  /**
   * The period this op names, when that is coarser than what it collapses — a calendar
   * step names a month without writing one, and `the end of the month` has to know.
   */
  period?: Field
  /**
   * @param scope - The period the op is being resolved inside, when it was set aside by
   * an operator — `of july` resolves its left-hand side within a month. `null` for
   * everything read straight through.
   */
  apply: (date: Date, scope: Field | null) => void
}

/** The depth of the finest part a list of ops names, `-1` when it names none. */
function finestOf (list: Op[]): number {
  return list.reduce(
    (deepest, op) => Math.max(deepest, op.precision === null ? -1 : FIELDS.indexOf(op.precision)),
    -1
  )
}

/** The depth of the finest clock part a list of ops names, `-1` when it names none. */
function finestTimeOf (list: Op[]): number {
  const depth = finestOf(list)
  return depth < FIELDS.indexOf('hours') ? -1 : depth
}

/** The narrowest period a list of ops names outright — `of july 2019` is July's. */
function finestPeriodOf (list: Op[]): Field | null {
  let found: Field | null = null
  for (const op of list) {
    if (op.period === undefined) continue
    if (found === null || FIELDS.indexOf(op.period) > FIELDS.indexOf(found)) found = op.period
  }
  return found
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

/**
 * Spelt-out days of the month. `second` is the collision: it is also a unit of time, and
 * what tells them apart is a quantity in front of it — `in a second` is consumed as a
 * quantity before this table is ever reached, where `the second of march` is not.
 */
const ORDINAL_WORDS: Record<string, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  tenth: 10,
  eleventh: 11,
  twelfth: 12,
  thirteenth: 13,
  fourteenth: 14,
  fifteenth: 15,
  sixteenth: 16,
  seventeenth: 17,
  eighteenth: 18,
  nineteenth: 19,
  twentieth: 20,
  thirtieth: 30
}

/**
 * The days of the year that have a name, as the month and day they fall on. Keys are
 * read as they come out of the lexer, so a possessive is already gone and a phrase is
 * space-joined — `new year's day` looks up `new year`.
 */
const HOLIDAYS: Record<string, [number, number]> = {
  'new year': [1, 1],
  'new years': [1, 1],
  epiphany: [1, 6],
  valentine: [2, 14],
  valentines: [2, 14],
  'april fool': [4, 1],
  'april fools': [4, 1],
  'may day': [5, 1],
  'bastille day': [7, 14],
  halloween: [10, 31],
  'all saints': [11, 1],
  'all souls': [11, 2],
  armistice: [11, 11],
  remembrance: [11, 11],
  christmas: [12, 25],
  xmas: [12, 25],
  'boxing day': [12, 26]
}

/** The named days that move with Easter, as the days between them and Easter Sunday. */
const EASTER_OFFSETS: Record<string, number> = {
  'palm sunday': -7,
  'good friday': -2,
  easter: 0,
  'easter monday': 1,
  ascension: 39,
  pentecost: 49
}

/** One end of a period, as a word in front of `of` — `the end of july`. */
const EDGE_WORDS: Record<string, boolean> = {
  end: true,
  beginning: false,
  start: false
}

/** The units that name a period something else can be counted inside. */
const UNIT_PERIODS: Partial<Record<DurationType, Field>> = {
  months: 'month',
  years: 'year'
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
const POSTFIX_SIGNS: Record<string, number> = { ago: -1, later: 1, hence: 1 }

// `after`, `before` and `from` are read right to left — what follows them places the
// date, what precedes them is applied to it. `of` does the same with no sign of its own.
const INFIX_SIGNS: Record<string, number> = { after: 1, from: 1, before: -1 }

const QUALIFIERS: Record<string, 'time' | 'date'> = { at: 'time', on: 'date' }

/** Skipped while looking ahead for the unit a quantity belongs to. */
const ARTICLES = ['a', 'an', 'the']

/** What a sentence is held together with, and what is never worth reporting as ignored. */
const NOISE = [...ARTICLES, 'and', 'oclock', 't']

const CLOCK = /^(\d{1,2}):(\d{2})(?::(\d{2})(?:[.,](\d{1,3}))?)?$/v
// `9h`, `9h30`, `9h30min`, `9h30min20`, `9h30min20sec` — the form a clock takes when the
// colon is dropped. A bare `9h` is the only ambiguous one: `in 9h` is nine hours and
// `at 9h` is nine o'clock, which the fold settles on the sign rather than here.
const COMPACT_CLOCK = /^(\d{1,2})h(?:(\d{1,2})(?:min(?:(\d{1,2})(?:sec)?)?)?)?$/v
// A date in three parts, the same separator twice — `2026-03-14`, `14/03/2026`,
// `14.03.26`. A four-digit head is a year and the order is the one it opens; anything
// else is read day first, which is the order most of the world writes and the only one
// a locale could not settle.
const NUMERIC_DATE = /^(\d{1,4})([\-\/.])(\d{1,2})\2(\d{1,4})$/v
const YEAR_MONTH = /^(\d{4})[\-\/.](\d{1,2})$/v
const MONTH_YEAR = /^(\d{1,2})[\/.](\d{4})$/v
const DAY_MONTH = /^(\d{1,2})\/(\d{1,2})$/v
const ORDINAL = /^(\d{1,2})(?:st|nd|rd|th)$/v
const DIGITS = /^\d+$/v
const DECIMAL = /^\d+\.\d+$/v
// An ISO zone offset. `Date` holds no zone of its own, so this is read to be reported
// rather than honoured — the alternative was `+02:00` landing as two o'clock.
const ZONE = /^[+\-](?:\d{2}:\d{2}|\d{4})$/v
const MERIDIEM = /^([ap])m$/v

// Compound shapes first, so a clock, a numeric date, an ordinal and a decimal survive a
// split that drops every separator. Everything else is a run of digits, a run of letters
// or a lone sign, and whatever falls between them — spaces, commas, dashes — is a
// separator. A trailing `(?!\d)` keeps a shape from biting into the digits behind it.
const ATOM = new RegExp([
  /\d{1,2}:\d{2}(?::\d{2}(?:[.,]\d{1,3})?)?/v,
  /\d{1,2}h(?:\d{1,2}(?:min(?:\d{1,2}(?:sec)?)?)?)?/v,
  /\d{1,4}[\-\/.]\d{1,2}[\-\/.]\d{1,4}(?!\d)/v,
  /\d{4}[\-\/.]\d{1,2}(?!\d)/v,
  /\d{1,2}[\/.]\d{4}(?!\d)/v,
  /\d{1,2}\/\d{1,2}(?!\d)/v,
  /[+\-](?:\d{2}:\d{2}|\d{4})(?!\d)/v,
  /\d{1,2}(?:st|nd|rd|th)/v,
  /\d+\.\d+/v,
  /\d+/v,
  /\p{L}+/v,
  /[+\-]/v
].map(shape => shape.source).join('|'), 'gv')

function lex (raw: string): string[] {
  // A lone `s` is the possessive the separators left behind — `new year's eve` is three
  // words, and nothing in the vocabulary is spelt `s`.
  return [...raw.toLowerCase().matchAll(ATOM)]
    .map(match => match[0])
    .filter(atom => atom !== 's')
}

/**
 * A year written in two digits, on the `strptime` pivot — 69 through 99 are the last
 * century, 00 through 68 this one. Three digits or four are taken as written.
 */
function fullYear (value: number, digits: number): number {
  if (digits > 2) return value
  return value >= 69 ? 1900 + value : 2000 + value
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
 * @param firstDay - Where the week opens, Monday (`1`) through Sunday (`7`). It only
 * changes the answer for a cursor sitting on a Sunday.
 */
function seekWithinWeek (date: Date, target: number, firstDay: number): void {
  // `getDay` numbers Sunday 0, where `firstDay` numbers it 7 — the modulo is the bridge.
  const start = firstDay % 7
  const fromStart = (day: number): number => (day - start + 7) % 7
  date.setDate(date.getDate() + fromStart(target) - fromStart(date.getDay()))
}

/**
 * A day the month has not got is the last one it has, rather than a roll into the next
 * month: `the 31st of next month` asked in January means February's end, not March 3rd.
 */
function setDayClamped (date: Date, day: number): void {
  date.setDate(Math.min(day, daysInMonth(date.getFullYear(), date.getMonth() + 1)))
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

/**
 * Moves the cursor onto another date's day, leaving the time of day where it was — a
 * seek inside a period lands on a day, and `the end of july at 6pm` still names an hour.
 */
function writeDate (date: Date, landing: Date): void {
  date.setFullYear(landing.getFullYear(), landing.getMonth(), landing.getDate())
}

/** The last day of the period the cursor sits in, at the given granularity. */
function periodEnd (start: Date, scope: Field): Date {
  const end = new Date(start)
  if (scope === 'year') {
    end.setMonth(11)
    end.setDate(31)
    return end
  }
  if (scope === 'month') end.setDate(daysInMonth(end.getFullYear(), end.getMonth() + 1))
  return end
}

/**
 * The nth weekday of a period, or its last one — `the last friday of july`, `the second
 * friday of july`. Walking back from the cursor would leave the period altogether, which
 * is why this starts from one of its ends rather than from where the cursor landed.
 *
 * @param nth - Which occurrence, counting from the period's start. `null` with `fromEnd`
 * means the last one.
 * @param scope - The period's granularity. Without one there is no period to count in,
 * and the seek falls back to the ordinary one.
 */
function seekInPeriod (
  date: Date,
  target: number,
  nth: number | null,
  fromEnd: boolean,
  scope: Field | null
): void {
  if (scope === null) {
    seekWeekday(date, target, fromEnd ? -1 : 0)
    return
  }
  const start = new Date(date)
  truncate(start, FIELDS.indexOf(scope))
  if (fromEnd) {
    const end = periodEnd(start, scope)
    end.setDate(end.getDate() - ((end.getDay() - target + 7) % 7))
    writeDate(date, end)
    return
  }
  start.setDate(start.getDate() + ((target - start.getDay() + 7) % 7) + ((nth ?? 1) - 1) * 7)
  writeDate(date, start)
}

/** One end of the period the cursor sits in — `the last day of july`, `the first of 2019`. */
function seekEdgeOfPeriod (date: Date, fromEnd: boolean, scope: Field | null): void {
  if (scope === null) return
  const start = new Date(date)
  truncate(start, FIELDS.indexOf(scope))
  writeDate(date, fromEnd ? periodEnd(start, scope) : start)
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

/**
 * Easter Sunday, by the anonymous Gregorian computus — the one named day of the year
 * that has to be computed rather than looked up.
 */
function easterSunday (year: number): Date {
  const metonic = year % 19
  const century = Math.floor(year / 100)
  const inCentury = year % 100
  const correction = Math.floor((century + 8) / 25)
  const epact = (19 * metonic
    + century
    - Math.floor(century / 4)
    - Math.floor((century - correction + 1) / 3)
    + 15) % 30
  const weekShift = (32
    + 2 * (century % 4)
    + 2 * Math.floor(inCentury / 4)
    - epact
    - inCentury % 4) % 7
  const fix = Math.floor((metonic + 11 * epact + 22 * weekShift) / 451)
  // Days counted from March 1st, which is how the computus comes out — past 31 it is
  // April, and the month falls out of the division.
  const march = epact + weekShift - 7 * fix + 114
  return new Date(year, Math.floor(march / 31) - 1, (march % 31) + 1)
}

/**
 * A day that comes back every year: the one ahead by default, the reference year's on
 * `this`, and the year before or after on `last` and `next`.
 *
 * @param dayOf - The month and day the occasion falls on in a given year, since Easter
 * and everything hanging off it move.
 */
function seekAnnual (date: Date, dayOf: (year: number) => [number, number], direction: Direction | null): void {
  const year = date.getFullYear()
  const [month, day] = dayOf(year)
  const here = (date.getMonth() + 1) * 100 + date.getDate()
  const there = month * 100 + day
  let landing = year
  if (direction === null && there < here) landing = year + 1
  else if (direction === 1 && there <= here) landing = year + 1
  else if (direction === -1 && there >= here) landing = year - 1
  const [landedMonth, landedDay] = dayOf(landing)
  if (landing !== year) setYear(date, landing)
  setMonth(date, landedMonth)
  setDayClamped(date, landedDay)
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
  if (depth < FIELDS.indexOf('milliseconds')) date.setMilliseconds(0)
  if (depth < FIELDS.indexOf('seconds')) date.setSeconds(0)
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

function fold (atoms: string[], locale: string, firstDay: number): { ops: Op[], deferred: Op[], ignored: string[] } {
  const months = nameTable(monthNames(locale, 'long'), monthNames(locale, 'short'))
  const weekdays = nameTable(weekdayNames(locale, 'long'), weekdayNames(locale, 'short'))
  // A weekend reads as its Saturday, so `next weekend`, `last weekend` and `the last
  // weekend of july` all come out of the weekday path below.
  weekdays.weekend = 6
  const ops: Op[] = []
  // What an operator set aside, re-appended once the right-hand side has had its say.
  const deferred: Op[] = []
  const ignored: string[] = []
  const waiting: Quantity[] = []
  let seek: Direction | null = null
  let sign: number | null = null
  let qualifier: 'time' | 'date' | null = null
  /** The unit the last quantity was counted in, for the `and a half` that follows it. */
  let lastUnit: DurationType | null = null
  let phraseStart = 0
  /** The day of the month a spelt or suffixed ordinal just asked for, and where it sits. */
  let ordinal: { value: number, at: number } | null = null
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
    // `an hour and a half`: a fraction with no unit of its own is counted in the one the
    // quantity before it used. A whole number never is, since `in 2 days 3` is not three
    // of anything.
    if (ahead === null) {
      if (amount >= 1 || lastUnit === null) return false
      const held = lastUnit
      if (sign === null) {
        waiting.push({ amount, unit: held, atoms: [text] })
        return true
      }
      pushShift(amount * sign, held)
      return true
    }
    const unitAtom = atoms[ahead.at] ?? ''
    index = ahead.at + 1
    lastUnit = ahead.unit
    if (sign === null) {
      waiting.push({ amount, unit: ahead.unit, atoms: [text, unitAtom] })
      return true
    }
    pushShift(amount * sign, ahead.unit)
    return true
  }

  /**
   * Sets aside everything read since the last operator, so that it lands on whatever the
   * right-hand side resolves to. `false` when there was nothing on the left to set aside,
   * which is how `before 2019` reports the word it could not use.
   */
  function takeInfix (direction: number | null): boolean {
    if (direction !== null) applySign(direction)
    const phrase = ops.splice(phraseStart)
    if (phrase.length === 0) return false
    deferred.unshift(...phrase)
    phraseStart = ops.length
    return true
  }

  function takeDay (value: number): void {
    const direction = seek
    seek = null
    if (direction === null) {
      ops.push({ precision: 'day', apply: date => { setDayClamped(date, value) } })
      return
    }
    ops.push({ precision: 'day', apply: date => { seekDayOfMonth(date, value, direction) } })
  }

  function takeHours (value: number): void {
    ops.push({ precision: 'hours', apply: date => { date.setHours(value) } })
  }

  function takeClock (
    hours: number,
    minutes: number | null,
    seconds: number | null,
    milliseconds: number | null = null
  ): void {
    if (hours > 23 || (minutes !== null && minutes > 59) || (seconds !== null && seconds > 59)) {
      return
    }
    takeHours(hours)
    if (minutes !== null) ops.push({ precision: 'minutes', apply: date => { date.setMinutes(minutes) } })
    if (seconds !== null) ops.push({ precision: 'seconds', apply: date => { date.setSeconds(seconds) } })
    if (milliseconds !== null) {
      ops.push({ precision: 'milliseconds', apply: date => { date.setMilliseconds(milliseconds) } })
    }
  }

  /** The year, month and day a three-part numeric date names, in the order it opens. */
  function takeNumericDate (match: RegExpExecArray): void {
    const head = match[1] ?? ''
    const tail = match[4] ?? ''
    const middle = Number.parseInt(match[3] ?? '', 10)
    const first = Number.parseInt(head, 10)
    const last = Number.parseInt(tail, 10)
    const yearFirst = head.length === 4
    const year = yearFirst ? first : fullYear(last, tail.length)
    const day = yearFirst ? last : first
    if (middle < 1 || middle > 12 || day < 1 || day > 31) {
      ignored.push(match[0])
      return
    }
    ops.push({ precision: 'year', period: 'year', apply: date => { setYear(date, year) } })
    ops.push({ precision: 'month', period: 'month', apply: date => { setMonth(date, middle) } })
    ops.push({ precision: 'day', apply: date => { setDayClamped(date, day) } })
  }

  /** A month written as a number, with or without a year beside it. */
  function takeMonthNumber (month: number, year: number | null): boolean {
    if (month < 1 || month > 12) return false
    if (year !== null) {
      ops.push({ precision: 'year', period: 'year', apply: date => { setYear(date, year) } })
    }
    ops.push({ precision: 'month', period: 'month', apply: date => { setMonth(date, month) } })
    return true
  }

  /**
   * The occasion a run of atoms names — a phrase of two words before a single one, with
   * an optional trailing `day`, and an `eve` that moves it back a day and into the
   * evening. `false` when no table knows it, so the atom goes on being read.
   */
  function takeHoliday (atom: string): boolean {
    const ahead = atoms[index]
    const pair = ahead === undefined ? '' : `${atom} ${ahead}`
    const paired = HOLIDAYS[pair] !== undefined || EASTER_OFFSETS[pair] !== undefined
    const key = paired ? pair : atom
    const fixed = HOLIDAYS[key]
    const offset = EASTER_OFFSETS[key]
    if (fixed === undefined && offset === undefined) return false
    if (paired) index += 1
    if (atoms[index] === 'day') index += 1
    const eve = atoms[index] === 'eve'
    if (eve) index += 1
    const direction = seek
    seek = null
    const dayOf = (year: number): [number, number] => {
      const landing = fixed === undefined
        ? easterSunday(year)
        : new Date(year, fixed[0] - 1, fixed[1])
      if (offset !== undefined) landing.setDate(landing.getDate() + offset)
      // The eve of a day is the day before it, which is also how `new year's eve` ends
      // up in December rather than January.
      if (eve) landing.setDate(landing.getDate() - 1)
      return [landing.getMonth() + 1, landing.getDate()]
    }
    ops.push({ precision: 'day', apply: date => { seekAnnual(date, dayOf, direction) } })
    // An eve is an evening, so it names an hour too — the one `evening` names.
    if (eve) takeHours(20)
    return true
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
      // `.5` is half a second, not five of them — the digits are padded to the right.
      const fraction = clock[4] === undefined ? null : Number.parseInt(clock[4].padEnd(3, '0'), 10)
      const meridiem = meridiemAhead()
      const onTheClock = meridiem === null || hours > 12
        ? hours
        : (hours % 12) + (meridiem === 'p' ? 12 : 0)
      const before = ops.length
      takeClock(onTheClock, minutes, seconds, fraction)
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
      const meridiem = meridiemAhead()
      const onTheClock = meridiem === null || hours > 12
        ? hours
        : (hours % 12) + (meridiem === 'p' ? 12 : 0)
      const before = ops.length
      takeClock(onTheClock, minutes, seconds)
      if (ops.length === before) ignored.push(atom)
      continue
    }

    const numeric = NUMERIC_DATE.exec(atom)
    if (numeric !== null) {
      takeNumericDate(numeric)
      continue
    }

    const yearMonth = YEAR_MONTH.exec(atom)
    if (yearMonth !== null) {
      const year = Number.parseInt(yearMonth[1] ?? '', 10)
      const month = Number.parseInt(yearMonth[2] ?? '', 10)
      if (!takeMonthNumber(month, year)) ignored.push(atom)
      continue
    }

    const monthYear = MONTH_YEAR.exec(atom)
    if (monthYear !== null) {
      const month = Number.parseInt(monthYear[1] ?? '', 10)
      const year = Number.parseInt(monthYear[2] ?? '', 10)
      if (!takeMonthNumber(month, year)) ignored.push(atom)
      continue
    }

    const dayMonth = DAY_MONTH.exec(atom)
    if (dayMonth !== null) {
      const day = Number.parseInt(dayMonth[1] ?? '', 10)
      const month = Number.parseInt(dayMonth[2] ?? '', 10)
      if (takeMonthNumber(month, null) && day >= 1 && day <= 31) {
        ops.push({ precision: 'day', apply: date => { setDayClamped(date, day) } })
        continue
      }
      ignored.push(atom)
      continue
    }

    if (ZONE.test(atom)) {
      ignored.push(atom)
      continue
    }

    const suffixed = ORDINAL.exec(atom)
    if (suffixed !== null) {
      const value = Number.parseInt(suffixed[1] ?? '', 10)
      if (value < 1 || value > 31) {
        ignored.push(atom)
        continue
      }
      takeDay(value)
      ordinal = { value, at: ops.length - 1 }
      continue
    }

    if (DECIMAL.test(atom)) {
      if (!takeQuantity(Number.parseFloat(atom), atom)) ignored.push(atom)
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
        ops.push({ precision: 'year', period: 'year', apply: date => { setYear(date, value) } })
        continue
      }
      qualifier = null
      if (value >= 1 && value <= 31) takeDay(value)
      else ignored.push(atom)
      continue
    }

    const quantity = QUANTITY_WORDS[atom]
    if (quantity !== undefined && takeQuantity(quantity, atom)) continue

    const ordinalWord = ORDINAL_WORDS[atom]
    if (ordinalWord !== undefined) {
      takeDay(ordinalWord)
      ordinal = { value: ordinalWord, at: ops.length - 1 }
      continue
    }

    if (takeHoliday(atom)) continue

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

    // `same time tomorrow`, `this time next week` — the reference's own clock, named so
    // that it survives the truncation a day on its own would impose.
    if (atom === 'same' && atoms[index] === 'time') {
      index += 1
      ops.push({ precision: 'milliseconds', apply: () => undefined })
      continue
    }
    if (atom === 'time' && seek === 0) {
      seek = null
      ops.push({ precision: 'milliseconds', apply: () => undefined })
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
      if (direction === null) {
        ops.push({ precision: 'month', period: 'month', apply: date => { setMonth(date, value) } })
        continue
      }
      ops.push({
        precision: 'month',
        period: 'month',
        apply: date => { seekMonth(date, value, direction) }
      })
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
      // `the friday before the 20th` looks back from the 20th, so an operator about to
      // set the anchor also says which way its weekday reads.
      const toward = INFIX_SIGNS[atoms[index] ?? '']
      if (direction === null && toward !== undefined) {
        const strict = toward < 0 ? -1 : 1
        ops.push({ precision: 'day', apply: date => { seekWeekday(date, weekday, strict) } })
        continue
      }
      // `the last friday of july` counts inside July, so a weekday standing in front of
      // `of` is resolved within the period that follows rather than from the cursor —
      // and an ordinal just before it says which occurrence, instead of a day number.
      if (atoms[index] === 'of') {
        let nth: number | null = null
        if (ordinal !== null && ordinal.at === ops.length - 1) {
          nth = ordinal.value
          ops.splice(ordinal.at, 1)
        }
        ordinal = null
        const fromEnd = direction === -1
        ops.push({
          precision: 'day',
          apply: (date, scope) => { seekInPeriod(date, weekday, nth, fromEnd, scope) }
        })
        continue
      }
      if (direction === null && ops.some(placesDate)) {
        ops.push({ precision: 'day', apply: date => { seekWithinWeek(date, weekday, firstDay) } })
        continue
      }
      ops.push({ precision: 'day', apply: date => { seekWeekday(date, weekday, direction ?? 0) } })
      continue
    }

    const unit = UNITS[atom]
    if (unit !== undefined) {
      const direction = seek
      seek = null
      const period = UNIT_PERIODS[unit]
      // `the last day of july` is July's end, not a day off its start — a direction on a
      // bare `day` in front of `of` names one end of the period. Coarser units have no
      // such reading here, and keep the calendar step below.
      if (direction !== null && atoms[index] === 'of' && unit === 'days') {
        const fromEnd = direction === -1
        ops.push({
          precision: 'day',
          apply: (date, scope) => { seekEdgeOfPeriod(date, fromEnd, scope) }
        })
        continue
      }
      // A calendar step, not an offset: `next week` moves one week and says nothing
      // about the time of day, where `in a week` had to be signed to mean anything.
      if (direction !== null && direction !== 0) {
        ops.push({ precision: null, period, apply: date => { shift(date, direction, unit) } })
        continue
      }
      // `the day after tomorrow`: a bare unit in front of an operator is one of it.
      if (INFIX_SIGNS[atoms[index] ?? ''] !== undefined || atoms[index] === 'of') {
        waiting.push({ amount: 1, unit, atoms: [atom] })
        continue
      }
      // `the end of the month`, `the end of this year`: on the right of an operator, a
      // unit no number reached names the period the cursor already sits in.
      if (period !== undefined && deferred.length > 0) {
        ops.push({ precision: null, period, apply: () => undefined })
        continue
      }
      ignored.push(atom)
      continue
    }

    // `the end of july`, `the beginning of next month` — a word for one end of a period,
    // on the mechanism `the last day of july` already uses.
    const edge = EDGE_WORDS[atom]
    if (edge !== undefined && atoms[index] === 'of') {
      ops.push({
        precision: 'day',
        apply: (date, scope) => { seekEdgeOfPeriod(date, edge, scope) }
      })
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

    if (atom === 'of') {
      if (!takeInfix(null)) ignored.push(atom)
      continue
    }

    const infix = INFIX_SIGNS[atom]
    if (infix !== undefined) {
      if (!takeInfix(infix)) ignored.push(atom)
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

  return { ops, deferred, ignored }
}

/**
 * Reads a date the way it is spoken — `next thursday at 9:20pm`, `in 3 days, at
 * midnight`, `yesterday`, `next december`, `21h30` — into a `Date`.
 *
 * @param raw - The string to read. Nothing in it has to be a date, and nothing in it
 * has to be in any particular order.
 * @param locale - Optional locale code (default: `'en'`), which the month and weekday
 * names are read in. The rest of the vocabulary is English either way.
 * @param options - See {@link ReadDateOptions}.
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
 * `last` always wins over both readings, and where that week opens is
 * {@link ReadDateOptions.weekStartsOn} — Monday unless the caller says otherwise.
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
 * **`after`, `before`, `from` and `of` read right to left.** What follows them places the
 * date and what precedes them is applied to it, so `2 days after next friday` finds the
 * Friday first, and `the 1st of next month` moves to the month before writing the day. A
 * day the month has not got is clamped to its last — `the 31st of next month` asked in
 * January is the end of February, not the 3rd of March. An operator with nothing on its
 * left reaches `onIgnored` instead, which is what `before 2019` does.
 *
 * **What `of` names is a period, and its left-hand side counts inside it.** A weekday
 * counts from the period's start, or from its end when asked for the last one, so `the
 * last friday of july` is the 31st and `the second friday of july` the 10th — where a
 * plain seek would have walked out of July altogether. A bare `day` names one of the two
 * ends: `the last day of july`, `the first day of 2019`. Without a period to count in —
 * `the last friday` on its own — it is an ordinary seek again.
 *
 * **`end`, `beginning` and `start` name those ends in a word**: `the end of july` is the
 * 31st and `the beginning of next month` is its 1st. On the right of an operator a unit
 * no number reached is the period the cursor already sits in — `the end of the month`,
 * `the end of this year`. A clock named anywhere in the string survives the move, so
 * `the end of the month at 6pm` keeps its hour.
 *
 * **The named days of the year are read as days**: `christmas`, `new year`, `halloween`,
 * `all saints`, `all souls`, `valentine's day`, `epiphany`, `april fools`, `may day`,
 * `bastille day`, `armistice day`, `boxing day`, and `easter` with `palm sunday`, `good
 * friday`, `easter monday`, `ascension` and `pentecost` moving with it. One of them on
 * its own is the next occurrence, today included; `this` is the reference year's and
 * `next` and `last` step a year. They are days like any other, so everything above
 * composes with them — `the friday before christmas`, `christmas + one week, on monday`,
 * `2 days after easter`, `the end of easter month`. An `eve` is the evening before, 8pm
 * on the 24th for `christmas eve` and on the 31st for `new year's eve`.
 *
 * **A weekend reads as its saturday**, so every weekday rule above holds of `this
 * weekend`, `next weekend` and `the last weekend of july`.
 *
 * **A date in digits is read in three parts, with `-`, `/` or `.` between them.** A
 * four-digit head is a year and the order is the one it opens — `2026-03-14`, `2026/3/4`.
 * Anything else is read day first — `14/03/2026`, `14.03.26` — which is the order most of
 * the world writes and the only one a locale tag could not settle, so `03/14/2026` is
 * impossible as a day-first date and reaches `onIgnored` whole rather than being quietly
 * re-read in the American order. A year in two digits takes the `strptime` pivot, 69
 * through 99 being the last century. Two parts read too: `2026-03` and `3/2026` are a
 * month, `14/03` the 14th of this year's March.
 *
 * **A clock reads down to the millisecond** — `09:20`, `09:20:05`, `09:20:05.123` — so a
 * whole ISO instant goes through, its `T` included. Its zone does not: a `Date` holds no
 * zone of its own, so `Z` and `+02:00` are recognised in order to be reported rather than
 * honoured, and the clock is taken as a wall clock.
 *
 * **A decimal is a quantity** (`in 1.5 hours`), and a fraction with no unit of its own is
 * counted in the one before it, which is what `in an hour and a half` means. A whole
 * number never is, since `in 2 days 3` is not three of anything.
 *
 * **`same time` names the reference's own clock**, down to the millisecond, so that it
 * survives the midnight a named day would otherwise impose: `same time tomorrow`, `this
 * time next week`.
 *
 * **Reading is lax by construction.** Whitespace and punctuation are separators, a token
 * no table knows is skipped rather than fatal, and nothing is positional: `9pm next
 * thursday` and `next thursday at 9pm` are the same instant. When two tokens name the
 * same part, the later one wins. Nothing here ever throws, and what the read could not
 * use reaches `onIgnored` rather than changing the answer.
 *
 * @example
 * readDate('next thursday at 9:20pm')
 * // => the coming Thursday, 21:20:00.000
 */
export function readDate (
  raw: string,
  locale = 'en',
  options: ReadDateOptions = {}
): Date | null {
  const { ops, deferred, ignored } = fold(lex(raw), locale, options.weekStartsOn ?? 1)
  if (ignored.length > 0) options.onIgnored?.(ignored)
  if (ops.length === 0 && deferred.length === 0) return null
  const date = new Date(options.reference ?? new Date())
  for (const op of ops) op.apply(date, null)
  // What the right-hand side named is the period the left-hand side counts in, so it is
  // collapsed first — `of july` means July from its first instant. Truncating again at
  // the end would undo what the left-hand side then did, so the second pass only reaches
  // as deep as that side itself named.
  const scopeDepth = finestOf(ops)
  // A period named outright wins over the one a precision implies: `of next month` is a
  // month even though a calendar step collapses nothing, and `of july at 6pm` is July.
  const scope = finestPeriodOf(ops) ?? (scopeDepth === -1 ? null : FIELDS[scopeDepth] ?? null)
  if (scopeDepth !== -1) truncate(date, scopeDepth)
  if (deferred.length > 0) {
    for (const op of deferred) op.apply(date, scope)
    // Truncating to the whole string's depth would undo what the deferred side did on a
    // coarser field — `2 days after july` is not July 1st again. A clock the other side
    // named still has to survive, and collapsing below an hour never moves a day.
    const depth = Math.max(finestOf(deferred), finestTimeOf(ops))
    if (depth !== -1) truncate(date, depth)
  }
  return Number.isFinite(date.getTime()) ? date : null
}
