/** Options for {@link parseDate}. */
export type ParseDateOptions = {
  /**
   * The date the parts a template doesn't name are read from — the moment of the call
   * by default. Pass one to read a string against something other than now, and to
   * keep a test from depending on the day it runs.
   */
  reference?: Date
}
