/** Options for {@link inferDate}. */
export type InferDateOptions = {
  /**
   * The moment everything is read against — `in 3 days` counts from it, `next
   * thursday` looks forward from it, and it fills whatever the string does not name.
   * Defaults to the moment of the call.
   */
  reference?: Date
}
