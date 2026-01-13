import xss from 'xss'

// [WIP] maybe take all agnostic/html/sanitize stuff here

/**
 * Sanitizes a single file name by removing invalid characters and normalizing Unicode.
 *
 * - Removes characters forbidden in Windows and Unix file systems.
 * - Replaces multiple spaces with a single space.
 * - Replaces multiple dots with a single dot and removes leading/trailing dots.
 * - Normalizes Unicode to NFKC form to prevent homoglyph attacks.
 *
 * @param {string} input - The file name to sanitize.
 * @param {number} [maxLength=255] - Maximum allowed length of the sanitized file name.
 * @returns {string | null} Sanitized file name, or null if empty or exceeds maxLength.
 */
export function sanitizeFileName (input: string, maxLength: number = 255): string | null {
  input = input
    .normalize('NFKC') // Normalize Unicode to avoid homoglyph attacks
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Remove invalid characters (e.g., Windows and Unix forbidden characters)
    .trim() // Trim whitespace
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .replace(/\.+/g, '.') // Replace multiple dots with a single dot
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
  if (input.length > maxLength) return null
  return input.length > 0 ? input : null
}

/**
 * Sanitizes a path string by sanitizing each path segment.
 *
 * - Removes empty segments and `..` segments to prevent path traversal.
 * - Sanitizes each segment using `sanitizeFileName`.
 * - Ensures the returned path starts with a `/`.
 *
 * @param {string} targetPath - The path to sanitize.
 * @returns {string | null} Sanitized absolute path, or null if invalid/empty.
 */
export function sanitizePath (targetPath: string): string | null {
  const sanitized = targetPath
    .split('/')
    .filter(chunk => chunk !== '')
    .map(chunk => sanitizeFileName(chunk) ?? '')
    .filter(chunk => chunk !== '' && chunk !== '..')
    .join('/')
  if (sanitized === '') return null
  return sanitized.startsWith('/')
    ? sanitized
    : `/${sanitized}`
}

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
