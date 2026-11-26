/** Matches one `@` between two runs of non-whitespace, the second carrying a dot. */
export const laxEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/v

/**
 * Whether a string has the shape of an email address.
 *
 * Deliberately lax: it rules out what is obviously not an address — no `@`, several of
 * them, whitespace, no dot in the domain — and says nothing about whether the address
 * exists or is deliverable. Use it to tell a reader they mistyped, never to decide that
 * an address is valid; the only authority on that is sending a mail to it.
 *
 * @param candidate - The string to test.
 * @returns `true` when the shape holds.
 *
 * @example
 * looksLikeEmail('reader@example.com')
 * // => true
 *
 * @example
 * looksLikeEmail('reader@example')
 * // => false
 */
export function looksLikeEmail (candidate: string): boolean {
  return laxEmailPattern.test(candidate)
}
