/** A standard Unicode character code (number). */
export type CharCode = number

/** A base-36 encoded character code (string). */
export type B36CharCode = string

// CharCode to/from B36CharCode

/**
 * Converts a Unicode character code to a base-36 string.
 * @param charCode - The character code to convert.
 * @returns Base-36 encoded character code.
 */
export function charCodeToB36 (charCode: CharCode): B36CharCode {
  if (charCode === null) return '\x00'
  return charCode.toString(36)
}

/**
 * Converts a base-36 character code string back to a Unicode character code.
 * @param b36CharCode - Base-36 encoded character code.
 * @returns Unicode character code.
 */
export function b36CharCodeToCharCode (b36CharCode: B36CharCode): CharCode {
  if (b36CharCode === null) return 0
  const charCode = parseInt(b36CharCode, 36)
  if (!Number.isInteger(charCode)) return 0
  return charCode
}

// Char to

/**
 * Converts a single character to its Unicode character code.
 * @param char - The character to convert.
 * @returns Unicode character code.
 */
export function charToCharCode (char: string): CharCode {
  const charCode = char.charCodeAt(0)
  if (!Number.isInteger(charCode)) return 0
  return charCode
}

/**
 * Converts a single character to its base-36 encoded character code.
 * @param char - The character to convert.
 * @returns Base-36 character code.
 */
export function charToB36CharCode (char: string): B36CharCode {
  const charCode = charToCharCode(char)
  return charCodeToB36(charCode)
}

// Char from

/**
 * Returns the character corresponding to a Unicode character code.
 * @param charCode - Unicode character code.
 * @returns Single-character string.
 */
export function charFromCharCode (charCode: CharCode): string {
  return String.fromCharCode(charCode)
}

/**
 * Returns the character corresponding to a base-36 encoded character code.
 * @param b36CharCode - Base-36 character code.
 * @returns Single-character string.
 */
export function charFromB36CharCode (b36CharCode: B36CharCode): string {
  const charCode = parseInt(b36CharCode, 36)
  if (!Number.isInteger(charCode)) return '\x00'
  return charFromCharCode(charCode)
}

// String to

/**
 * Converts a string into an array of Unicode character codes.
 * @param string - Input string.
 * @returns Array of character codes.
 */
export function toCharCodes (string: string): CharCode[] {
  const chars = string.split('')
  return chars.map(charToCharCode)
}

/**
 * Converts a string into an array of base-36 encoded character codes.
 * @param string - Input string.
 * @returns Array of base-36 character codes.
 */
export function toB36CharCodes (string: string): B36CharCode[] {
  const chars = string.split('')
  return chars.map(charToB36CharCode)
}

// String from

/**
 * Converts an array of Unicode character codes back to a string.
 * @param charCodes - Array of character codes.
 * @returns Reconstructed string.
 */
export function fromCharCodes (charCodes: CharCode[]): string {
  return charCodes
    .map(charFromCharCode)
    .map(char => char ?? '\x00')
    .join('')
}

/**
 * Converts an array of base-36 encoded character codes back to a string.
 * @param b36CharCodes - Array of base-36 character codes.
 * @returns Reconstructed string.
 */
export function fromB36CharCodes (b36CharCodes: B36CharCode[]): string {
  return b36CharCodes
    .map(charFromB36CharCode)
    .map(char => char ?? '\x00')
    .join('')
}

// Serialization

/**
 * Serializes an array of character codes (Unicode or base-36) into a string.
 * @param charCodes - Array of character codes to serialize.
 * @returns Serialized string representation.
 */
export function serialize (charCodes: Array<CharCode | B36CharCode>): string {
  return charCodes
    .map(c => typeof c === 'string' ? c : charCodeToB36(c))
    .join(',')
}

/**
 * Deserializes a string of base-36 character codes into an array of Unicode character codes.
 * @param serializedCharCodes - Serialized string.
 * @returns Array of Unicode character codes.
 */
export function deserialize (serializedCharCodes: string): CharCode[] {
  const b36CharCodes = serializedCharCodes.split('')
  return b36CharCodes.map(b36CharCodeToCharCode)
}

/**
 * Deserializes a string of base-36 character codes and reconstructs the original string.
 * @param serializedCharCodes - Serialized string.
 * @returns Original string.
 */
export function fromSerialized (serializedCharCodes: string): string {
  const charCodes = deserialize(serializedCharCodes)
  return fromCharCodes(charCodes)
}
