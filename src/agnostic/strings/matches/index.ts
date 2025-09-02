export type Matcher = string | RegExp | ((input: string) => boolean)

export function matches (input: string, matcher: Matcher): boolean {
  if (typeof matcher === 'string') return input === matcher
  if (typeof matcher === 'function') return matcher(input)
  return input.match(matcher) !== null
}

export function matchesSome (input: string, matchers: Matcher | Array<Matcher>): boolean {
  if (!Array.isArray(matchers)) return matches(input, matchers)
  return matchers.some(matcher => matches(input, matcher))
}

export function matchesEvery (input: string, matchers: Matcher | Array<Matcher>): boolean {
  if (!Array.isArray(matchers)) return matches(input, matchers)
  return matchers.every(matcher => matches(input, matcher))
}
