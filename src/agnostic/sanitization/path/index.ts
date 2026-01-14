import { sanitizeFileName } from '../file-name/index.js'

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
