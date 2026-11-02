/** The parts a date is made of, coarsest first — the order is the precision scale. */
export const DATE_FIELDS = ['year', 'month', 'day', 'hours', 'minutes', 'seconds', 'milliseconds'] as const

/** One part of a date, named as {@link PartialDate} keys it. */
export type DateField = typeof DATE_FIELDS[number]

/**
 * A date only some of whose parts are known — what one has when the information is
 * partial rather than wrong: a live announced for March 2026 with no day, a photograph
 * dated by its year alone.
 *
 * A part is **unknown when it is absent, `null` or `undefined`**, all three meaning the
 * same thing, so a record that came back from JSON with its holes spelt `null` needs no
 * conversion. Holes are allowed **anywhere**, not just at the end: `{ year: 2026, day:
 * 14 }` is the 14th of a month nobody wrote down. The precision is therefore derived and
 * never stored — see {@link partialDatePrecision}.
 *
 * Nothing validates the parts against each other: a 30th of February can be written
 * here, and it is the consumer of the record that decides what to do about it.
 * {@link formatDate} clamps, as the rest of the family does.
 */
export type PartialDate = {
  /** Full year, as written — `2026`, never `26`. */
  year?: number | null
  /** Month number, 1–12 — January is `1`, not `0`. */
  month?: number | null
  /** Day of month, 1–31. */
  day?: number | null
  /** Hours on a 24-hour clock, 0–23. */
  hours?: number | null
  /** Minutes, 0–59. */
  minutes?: number | null
  /** Seconds, 0–59. */
  seconds?: number | null
  /** Milliseconds, 0–999. */
  milliseconds?: number | null
}
