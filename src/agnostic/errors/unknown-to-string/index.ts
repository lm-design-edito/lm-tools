/**
 * Converts an unknown object into a string
 *
 * @param unk - the unknown object to stringify
 * @returns The stringified object
 */
export function unknownToString (unk: unknown, encoding?: BufferEncoding): string {
  if (unk instanceof Error) return unk.message
  if (unk instanceof Buffer) return unk.toString(encoding ?? 'utf-8')
  if (typeof unk === 'string') return unk
  if (typeof unk === 'object' && unk !== null) return JSON.stringify(unk)
  return `${unk}`
}
