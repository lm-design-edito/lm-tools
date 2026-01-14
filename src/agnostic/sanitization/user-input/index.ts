import xss from 'xss'

/**
 * Recursively sanitizes user input to prevent XSS.
 *
 * - Strings are sanitized using `xss`.
 * - Arrays and objects are sanitized recursively.
 * - Circular references are safely handled via a `WeakSet`.
 *
 * @template T
 * @param input - Input value to sanitize (string, object, or array).
 * @param [seen] - Internal set to track circular references.
 * @returns Sanitized input with the same structure as the original.
 */
export const sanitizeUserInput = <T>(input: T, seen = new WeakSet()): T => {
  if (typeof input === 'string') return xss(input) as T
  if (Array.isArray(input)) {
    if (seen.has(input)) return input
    seen.add(input)
    return input.map(item => sanitizeUserInput(item, seen)) as T
  }
  if (input !== null && typeof input === 'object') {
    if (seen.has(input)) return input
    seen.add(input)
    const entries = Object.entries(input as Record<string, unknown>)
    const sanitizedEntries = entries.map(([key, value]) => [xss(key), sanitizeUserInput(value, seen)])
    return Object.fromEntries(sanitizedEntries) as T
  }
  return input
}
