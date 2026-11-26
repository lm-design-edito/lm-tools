/** The shape {@link looksLikeEmail} tests. */
export const laxEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/v

/**
 * Whether a string has the shape of an email address — one `@`, no whitespace, a dot in
 * the domain. A shape check and nothing more: it says nothing about deliverability, so
 * use it to tell a reader they mistyped, never to decide an address is valid.
 *
 * @param candidate - The string to test.
 * @returns `true` when the shape holds.
 *
 * @example
 * looksLikeEmail('reader@example')
 * // => false
 */
export function looksLikeEmail (candidate: string): boolean {
  return laxEmailPattern.test(candidate)
}
