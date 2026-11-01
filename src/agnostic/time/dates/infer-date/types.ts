/** Options for {@link inferDate}. */
export type InferDateOptions = {
  /**
   * The moment everything is read against — `in 3 days` counts from it, `next
   * thursday` looks forward from it, and it fills whatever the string does not name.
   * Defaults to the moment of the call.
   */
  reference?: Date
  /**
   * The day a week starts on, Monday (`1`) through Sunday (`7`), for the one reading
   * that needs it: a weekday scoped to the week of a date already placed, as in
   * `2026-03-14, on monday`.
   *
   * Monday by default, which is ISO and most of the world. The United States, Canada
   * and Japan open the week on Sunday, so a caller reading American input passes `7`.
   * `Intl.Locale.prototype.getWeekInfo` carries this per locale, but TypeScript ships
   * no declaration for it and Node has not implemented it, so reading it here would
   * mean a global type augmentation that breaks the day TypeScript does ship one, a
   * branch no test of ours could reach, and one string resolving differently in Node
   * and in a browser. An argument says it out loud instead.
   */
  weekStartsOn?: 1 | 2 | 3 | 4 | 5 | 6 | 7
  /**
   * Called once after the read, with the pieces of the string that contributed
   * nothing — an unknown word, a part out of range, a quantity nobody signed. Not
   * called when everything landed, and never called with the connective words a
   * sentence is made of (`the`, `a`, `and`, `of`).
   *
   * Reading stays lax either way: this is how a caller warns about `the 3rd quarter`
   * being read as the 3rd, not a way of making it fail.
   */
  onIgnored?: (atoms: string[]) => void
}
