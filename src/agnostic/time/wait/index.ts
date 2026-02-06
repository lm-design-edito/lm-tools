/**
 * Returns a promise that resolves after the specified duration in milliseconds.
 *
 * @param durationMs - Time to wait in milliseconds.
 * @returns A promise that resolves to `void` after the delay.
 */
export async function wait (durationMs: number): Promise<void> {
  await new Promise(resolve => {
    setTimeout(() => resolve(true), durationMs)
  })
}
