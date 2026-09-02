/**
 * A date's parts, keyed by the `formatDate` token that renders them.
 *
 * Every value is a string, because these *are* the rendered fragments: `DD` is
 * `'01'`, not `1`. Read an integer back with `Number(parts.D)`.
 */
export type DateTokenParts = {
  /** Day of month, `'1'`–`'31'`. */
  D: string
  /** Day of month, zero-padded, `'01'`–`'31'`. */
  DD: string
  /** Short weekday name, localised. */
  d: string
  /** Full weekday name, localised. */
  dd: string
  /** Month number, `'1'`–`'12'`. */
  M: string
  /** Month number, zero-padded, `'01'`–`'12'`. */
  MM: string
  /** Short month name, localised. */
  MMM: string
  /** Full month name, localised. */
  MMMM: string
  /** Last two digits of the year. */
  YY: string
  /** Four-digit year. */
  YYYY: string
  /** Hours on a 24-hour clock, `'0'`–`'23'`. */
  H: string
  /** Hours on a 24-hour clock, zero-padded. */
  HH: string
  /** Hours on a 12-hour clock, `'1'`–`'12'`. Midnight and noon both read `'12'`. */
  h: string
  /** Hours on a 12-hour clock, zero-padded. */
  hh: string
  /** Minutes, `'0'`–`'59'`. */
  m: string
  /** Minutes, zero-padded. */
  mm: string
  /** Seconds, `'0'`–`'59'`. */
  s: string
  /** Seconds, zero-padded. */
  ss: string
  /** Milliseconds, zero-padded to three digits. */
  ms: string
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
 * one per token, same string value.
 */
export type NamedDateParts = {
  /** {@link DateTokenParts.D} */
  dayOfMonth: string
  /** {@link DateTokenParts.DD} */
  paddedDayOfMonth: string
  /** {@link DateTokenParts.d} */
  shortWeekdayName: string
  /** {@link DateTokenParts.dd} */
  fullWeekdayName: string
  /** {@link DateTokenParts.M} */
  monthNumber: string
  /** {@link DateTokenParts.MM} */
  paddedMonthNumber: string
  /** {@link DateTokenParts.MMM} */
  shortMonthName: string
  /** {@link DateTokenParts.MMMM} */
  fullMonthName: string
  /** {@link DateTokenParts.YY} */
  twoDigitYear: string
  /** {@link DateTokenParts.YYYY} */
  fourDigitYear: string
  /** {@link DateTokenParts.H} */
  hours24: string
  /** {@link DateTokenParts.HH} */
  paddedHours24: string
  /** {@link DateTokenParts.h} */
  hours12: string
  /** {@link DateTokenParts.hh} */
  paddedHours12: string
  /** {@link DateTokenParts.m} */
  minutes: string
  /** {@link DateTokenParts.mm} */
  paddedMinutes: string
  /** {@link DateTokenParts.s} */
  seconds: string
  /** {@link DateTokenParts.ss} */
  paddedSeconds: string
  /** {@link DateTokenParts.ms} */
  paddedMilliseconds: string
  /** {@link DateTokenParts.A} */
  upperCaseMeridiem: string
  /** {@link DateTokenParts.a} */
  lowerCaseMeridiem: string
  /** {@link DateTokenParts.th} */
  dayOrdinalSuffix: string
}

/** Every part of a date, reachable both by format token and by name. */
export type DateParts = DateTokenParts & NamedDateParts
