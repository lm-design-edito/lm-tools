import { randomHexChar } from '../hex-char/index.js'

/**
 * Generates a random hexadecimal string of given length.
 *
 * @param {number} [length=4] - Number of hex characters.
 * @returns {string} Random hexadecimal string.
 */
export function randomHash (length: number = 4): string {
  return new Array(length)
    .fill(null)
    .map(randomHexChar)
    .join('')
}

/**
 * Generates a random hexadecimal string following a pattern.
 *
 * @param {number[]} pattern - Array of segment lengths.
 * @param {string} [joiner='-'] - String used to join the segments.
 * @returns {string} Random hexadecimal string with segments joined by `joiner`.
 */
export function randomHashPattern (pattern: number[], joiner: string = '-'): string {
  return pattern.map(randomHash).join(joiner)
}

/**
 * Generates a random UUID-like string (version 4 style, not RFC-compliant).
 *
 * @returns {string} Random UUID-like string.
 */
export function randomUUID (): string {
  return randomHashPattern([8, 4, 4, 4, 12])
}
