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
