import {
  DATE_FIELDS,
  type DateField,
  type PartialDate
} from './types.js'

/**
 * The parts a {@link PartialDate} actually knows, coarsest first.
 *
 * @param partial - The record to read.
 * @returns The known fields, in precision order — `['year', 'day']` for the 14th of an
 * unwritten month of 2026, and `[]` for a record that knows nothing.
 * @see {@link partialDatePrecision} for the finest of them.
 */
export function knownDateFields (partial: PartialDate): DateField[] {
  return DATE_FIELDS.filter(field => isKnown(partial[field]))
}

/**
 * The finest part a {@link PartialDate} knows, which is as precise as it can claim to be.
 *
 * @param partial - The record to read.
 * @returns The finest known field, or `null` when none is known. A hole above it is not
 * an obstacle: `{ year: 2026, day: 14 }` is day-precise, with its month missing.
 */
export function partialDatePrecision (partial: PartialDate): DateField | null {
  const known = knownDateFields(partial)
  return known[known.length - 1] ?? null
}

/**
 * Whether a {@link PartialDate} knows every part from the year down to its precision,
 * with no hole in between.
 *
 * @param partial - The record to read.
 * @returns `true` for `{ year, month }` and for a record that knows nothing, `false` for
 * `{ year, day }`, whose month is a hole. This is the question to ask before treating a
 * partial date as a stretch of time, since a hole makes it a set of candidates rather
 * than one.
 */
export function isContiguousPartialDate (partial: PartialDate): boolean {
  const known = knownDateFields(partial)
  return known.every((field, position) => field === DATE_FIELDS[position])
}

/**
 * The {@link PartialDate} a `Date` makes — every part known, since a `Date` has no holes.
 *
 * @param date - The date to break down.
 * @returns Its seven parts, read in the runtime's local timezone as the rest of the
 * family reads them.
 */
export function toPartialDate (date: Date): PartialDate {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
    milliseconds: date.getMilliseconds()
  }
}

// Absent, `null` and `undefined` all mean the same unknown, so that a record out of JSON
// reads like one written by hand.
function isKnown (value: number | null | undefined): value is number {
  return value !== null && value !== undefined
}
