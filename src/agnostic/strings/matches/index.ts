/**
 * A matcher can be a string, a regular expression, or a function that returns a boolean for a given input.
 */
export type Matcher = string | RegExp | ((input: string) => boolean)

/**
 * Checks whether a string matches a single matcher.
 *
 * @param input - The string to test.
 * @param matcher - The matcher to test against.
 * @returns `true` if the input matches, otherwise `false`.
 */
export function matches (input: string, matcher: Matcher): boolean {
  if (typeof matcher === 'string') return input === matcher
  if (typeof matcher === 'function') return matcher(input)
  return input.match(matcher) !== null
}

/**
 * Checks whether a string matches at least one matcher in a list (or a single matcher).
 *
 * @param input - The string to test.
 * @param matchers - A matcher or array of matchers.
 * @returns `true` if the input matches at least one matcher, otherwise `false`.
 */
export function matchesSome (input: string, matchers: Matcher | Array<Matcher>): boolean {
  if (!Array.isArray(matchers)) return matches(input, matchers)
  return matchers.some(matcher => matches(input, matcher))
}

/**
 * Checks whether a string matches every matcher in a list (or a single matcher).
 *
 * @param input - The string to test.
 * @param matchers - A matcher or array of matchers.
 * @returns `true` if the input matches all matchers, otherwise `false`.
 */
export function matchesEvery (input: string, matchers: Matcher | Array<Matcher>): boolean {
  if (!Array.isArray(matchers)) return matches(input, matchers)
  return matchers.every(matcher => matches(input, matcher))
}
