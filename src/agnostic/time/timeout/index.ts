/**
 * Executes a callback and rejects if it does not complete within a specified timeout.
 *
 * @template T - The type of the callback's return value.
 * @param timeoutMs - Maximum time in milliseconds to wait for the callback to complete.
 * @param callback - The function to execute. Can be synchronous or return a promise.
 * @returns A promise that resolves with the callback result if completed in time, or rejects with `false` if timed out.
 */
export async function timeout<T> (timeoutMs: number, callback: () => T): Promise<T> {
  let hasRejected = false
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
  return await new Promise(async (resolve, reject) => {
    const rejectTimeout = setTimeout(() => {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject(false)
      hasRejected = true
    }, timeoutMs)
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const callbackResult = await callback()
    if (hasRejected) return
    clearTimeout(rejectTimeout)
    return resolve(callbackResult)
  })
}
