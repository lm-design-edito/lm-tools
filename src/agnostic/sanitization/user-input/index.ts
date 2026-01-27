import xss from 'xss'

/**
 * Recursively sanitizes user input to prevent XSS.
 *
 * - Strings are sanitized using `xss`.
 * - Arrays and objects are sanitized recursively.
 * - Circular references are safely handled via a `WeakMap`.
 *
 * @template T
 * @param input - Input value to sanitize (string, object, or array).
 * @param [seen] - Internal set to track circular references.
 * @returns Sanitized input with the same structure as the original.
 */
export const sanitizeUserInput = <T>(input: T, seen = new WeakMap()): T => {
  if (typeof input === 'string') return xss(input) as T
  if (Array.isArray(input)) {
    if (seen.has(input)) return seen.get(input)
    const sanitized: unknown[] = []
    seen.set(input, sanitized)
    sanitized.push(...input.map(item => sanitizeUserInput(item, seen)))
    return sanitized as T
  }
  if (input !== null && typeof input === 'object') {
    if (seen.has(input)) return seen.get(input)
    const sanitized: Record<string, unknown> = {}
    seen.set(input, sanitized)
    const entries = Object.entries(input as Record<string, unknown>)
    for (const [key, value] of entries) {
      sanitized[xss(key)] = sanitizeUserInput(value, seen)
    }
    return sanitized as T
  }
  return input
}
