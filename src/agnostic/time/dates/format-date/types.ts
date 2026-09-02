/** Every token `formatDate` substitutes in a template. */
export type DateToken =
  | 'D' | 'DD'
  | 'd' | 'dd'
  | 'M' | 'MM' | 'MMM' | 'MMMM'
  | 'YY' | 'YYYY'
  | 'H' | 'HH'
  | 'h' | 'hh'
  | 'm' | 'mm'
  | 's' | 'ss'
  | 'ms'
  | 'A' | 'a'
  | 'th'

/**
 * A date's parts, keyed by unit token.
 *
 * Quantities are **numbers** — a day of month is `1`, not `'01'`. Padding and
 * truncation are rendering concerns and belong to `formatDate`, which is why the
 * `DD`, `MM`, `YY`, `HH`, `hh`, `mm` and `ss` tokens have no entry here: they
 * render the same quantity as their unpadded twin. The parts that are localised
 * text rather than a quantity stay strings.
 */
export type DateTokenParts = {
  /** Day of month, 1–31. */
  D: number
  /** Short weekday name, localised. */
  d: string
  /** Full weekday name, localised. */
  dd: string
  /** Month number, 1–12 — January is `1`, not `0`. */
  M: number
  /** Short month name, localised. */
  MMM: string
  /** Full month name, localised. */
  MMMM: string
  /** Full year. */
  YYYY: number
  /** Hours on a 24-hour clock, 0–23. */
  H: number
  /** Hours on a 12-hour clock, 1–12. Midnight and noon are both `12`. */
  h: number
  /** Minutes, 0–59. */
  m: number
  /** Seconds, 0–59. */
  s: number
  /** Milliseconds, 0–999. */
  ms: number
  /** Upper-case meridiem, `'AM'` or `'PM'`. */
  A: string
  /** Lower-case meridiem, `'am'` or `'pm'`. */
  a: string
  /**
   * Day ordinal suffix — `'st'`, `'nd'`, `'rd'` or `'th'` in English, `'er'` for
   * the French 1st. Empty for every other locale, and for French days 2 onwards.
   */
  th: string
}

/**
 * The same parts as {@link DateTokenParts}, under names that read on their own —
 * one per token, same value.
 */
export type NamedDateParts = {
  /** {@link DateTokenParts.D} */
  dayOfMonth: number
  /** {@link DateTokenParts.d} */
  shortWeekdayName: string
  /** {@link DateTokenParts.dd} */
  fullWeekdayName: string
  /** {@link DateTokenParts.M} */
  monthNumber: number
  /** {@link DateTokenParts.MMM} */
  shortMonthName: string
  /** {@link DateTokenParts.MMMM} */
  fullMonthName: string
  /** {@link DateTokenParts.YYYY} */
  year: number
  /** {@link DateTokenParts.H} */
  hours24: number
  /** {@link DateTokenParts.h} */
  hours12: number
  /** {@link DateTokenParts.m} */
  minutes: number
  /** {@link DateTokenParts.s} */
  seconds: number
  /** {@link DateTokenParts.ms} */
  milliseconds: number
  /** {@link DateTokenParts.A} */
  upperCaseMeridiem: string
  /** {@link DateTokenParts.a} */
  lowerCaseMeridiem: string
  /** {@link DateTokenParts.th} */
  dayOrdinalSuffix: string
}

/** Every part of a date, reachable both by unit token and by name. */
export type DateParts = DateTokenParts & NamedDateParts
