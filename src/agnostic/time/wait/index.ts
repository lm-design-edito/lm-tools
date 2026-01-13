/**
 * Returns a promise that resolves after the specified duration in milliseconds.
 *
 * @param durationMs - Time to wait in milliseconds.
 * @returns A promise that resolves to `true` after the delay.
 */
export async function wait (durationMs: number) {
  return new Promise(resolve => {
    setTimeout(() => resolve(true), durationMs)
  })
}
