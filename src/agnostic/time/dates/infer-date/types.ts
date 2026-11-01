/** Options for {@link inferDate}. */
export type InferDateOptions = {
  /**
   * The moment everything is read against — `in 3 days` counts from it, `next
   * thursday` looks forward from it, and it fills whatever the string does not name.
   * Defaults to the moment of the call.
   */
  reference?: Date
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
