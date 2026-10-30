/**
 * `'en'` when the runtime has nothing for this locale, so an unknown tag reads as
 * English rather than as whatever the machine happens to be set to.
 */
function resolveLocale (locale: string): string {
  return Intl.DateTimeFormat.supportedLocalesOf(locale).length === 0 ? 'en' : locale
}

/**
 * What a locale calls its weekdays, indexed the way `Date.prototype.getDay` numbers
 * them — Sunday at 0.
 *
 * @param locale - Locale code, falling back to `'en'` when the runtime doesn't know it.
 * @param weekday - Which of the two lengths `Intl` offers.
 * @returns The seven names, Sunday first.
 *
 * @remarks
 * January 1st 2023 was a Sunday, so the week is walked from there.
 */
export function weekdayNames (locale: string, weekday: 'short' | 'long'): string[] {
  const formatter = new Intl.DateTimeFormat(resolveLocale(locale), { weekday })
  return [...Array<string>(7)].map((_, i) => formatter.format(new Date(2023, 0, i + 1)))
}

/**
 * What a locale calls its months, indexed the way `Date.prototype.getMonth` numbers
 * them — January at 0.
 *
 * @param locale - Locale code, falling back to `'en'` when the runtime doesn't know it.
 * @param month - Which of the two lengths `Intl` offers.
 * @returns The twelve names, January first.
 */
export function monthNames (locale: string, month: 'short' | 'long'): string[] {
  const formatter = new Intl.DateTimeFormat(resolveLocale(locale), { month })
  return [...Array<string>(12)].map((_, i) => formatter.format(new Date(2023, i, 1)))
}
