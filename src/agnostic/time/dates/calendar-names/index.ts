/**
 * `'en'` when the runtime has nothing for this locale, so an unknown tag reads as
 * English rather than as whatever the machine happens to be set to.
 */
function resolveLocale (locale: string): string {
  return Intl.DateTimeFormat.supportedLocalesOf(locale).length === 0 ? 'en' : locale
}

// What a locale calls its months does not change, and building the formatter is the
// expensive part — a formatter and a dozen `format` calls, which `readDate` and
// `parseDate` would otherwise pay on every string they read.
const tables = new Map<string, string[]>()

function cached (key: string, build: () => string[]): string[] {
  const held = tables.get(key)
  if (held !== undefined) return [...held]
  const built = build()
  tables.set(key, built)
  return [...built]
}

/**
 * What a locale calls its weekdays, indexed the way `Date.prototype.getDay` numbers
 * them — Sunday at 0.
 *
 * @param locale - Locale code, falling back to `'en'` when the runtime doesn't know it.
 * @param weekday - Which of the two lengths `Intl` offers.
 * @returns The seven names, Sunday first, as an array of the caller's own.
 *
 * @remarks
 * January 1st 2023 was a Sunday, so the week is walked from there. A locale and a length
 * are read from `Intl` once per process and held after that, so calling this in a loop
 * costs an array copy rather than a formatter.
 */
export function weekdayNames (locale: string, weekday: 'short' | 'long'): string[] {
  return cached(`weekday:${locale}:${weekday}`, () => {
    const formatter = new Intl.DateTimeFormat(resolveLocale(locale), { weekday })
    return [...Array<string>(7)].map((_, i) => formatter.format(new Date(2023, 0, i + 1)))
  })
}

/**
 * What a locale calls its months, indexed the way `Date.prototype.getMonth` numbers
 * them — January at 0.
 *
 * @param locale - Locale code, falling back to `'en'` when the runtime doesn't know it.
 * @param month - Which of the two lengths `Intl` offers.
 * @returns The twelve names, January first, as an array of the caller's own.
 *
 * @remarks
 * Read from `Intl` once per locale and length, then held — see {@link weekdayNames}.
 */
export function monthNames (locale: string, month: 'short' | 'long'): string[] {
  return cached(`month:${locale}:${month}`, () => {
    const formatter = new Intl.DateTimeFormat(resolveLocale(locale), { month })
    return [...Array<string>(12)].map((_, i) => formatter.format(new Date(2023, i, 1)))
  })
}
