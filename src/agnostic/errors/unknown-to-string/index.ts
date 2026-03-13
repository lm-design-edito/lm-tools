/**
 * Converts an unknown object into a string
 *
 * @param {unknown} unk - the unknown object to stringify
 * @returns {string} The stringified object
 */
export function unknownToString (unk: unknown, encoding?: BufferEncoding): string {
  if (unk instanceof Error) return unk.message
  if (unk instanceof Buffer) return unk.toString(encoding ?? 'utf-8')
  if (typeof unk === 'string') return unk
  if (typeof unk === 'object' && unk !== null) return JSON.stringify(unk)
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return `${unk}`
}
