/**
 * Sanitizes a single file name by removing invalid characters and normalizing Unicode.
 *
 * - Removes characters forbidden in Windows and Unix file systems.
 * - Replaces multiple spaces with a single space.
 * - Replaces multiple dots with a single dot and removes leading/trailing dots.
 * - Normalizes Unicode to NFKC form to prevent homoglyph attacks.
 *
 * @param input - The file name to sanitize.
 * @param [maxLength=255] - Maximum allowed length of the sanitized file name.
 * @returns Sanitized file name, or null if empty or exceeds maxLength.
 */
export function sanitizeFileName (
  input: string,
  maxLength = 255
): string | null {
  const _input = input
    .normalize('NFKC') // Normalize Unicode to avoid homoglyph attacks
    // eslint-disable-next-line no-control-regex
    .replace(/[<>:"\/\\\|?*\x00-\x1F]/gv, '') // Remove invalid characters (e.g., Windows and Unix forbidden characters)
    .trim() // Trim whitespace
    .replace(/\s+/gv, ' ') // Replace multiple spaces with a single space
    .replace(/\.+/gv, '.') // Replace multiple dots with a single dot
    .replace(/^\.+|\.+$/gv, '') // Remove leading/trailing dots
  if (_input.length > maxLength) return null
  return _input.length > 0 ? _input : null
}
