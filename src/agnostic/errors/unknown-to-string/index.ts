/**
 * Converts an unknown object into a string
 *
 * @param {unknown} err - the unknown object to stringify
 * @returns {string} The stringified object
 */
export function unknownToString (err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  if (typeof err === 'object' && err !== null) return JSON.stringify(err)
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return `${err}`
}
