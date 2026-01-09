/** Events that trigger a forced exit of the process. */
export const forceExitEvents = ['SIGINT', 'SIGTERM', 'uncaughtException']

/**
 * Registers a callback to run before forced exit events (SIGINT, SIGTERM, uncaughtException).
 *
 * @param callback - Function to execute before forced exit. Can be async.
 */
export function beforeForcedExit (callback: () => void | Promise<void>) {
  forceExitEvents.forEach(ev => process.on(ev, callback))
}

/**
 * Registers a callback to run before the process exits normally.
 *
 * @param callback - Function to execute before exit. Can be async.
 */
export function beforeExit (callback: () => void | Promise<void>) {
  process.on('beforeExit', callback)
}

/**
 * Registers a callback to run when the process exits.
 *
 * @param callback - Function to execute on exit. Can be async.
 */
export function onExit (callback: () => void | Promise<void>) {
  process.on('exit', callback)
}

/**
 * Registers a callback to run on all exit scenarios (forced exit, before exit, and exit).
 *
 * The callback is guaranteed to be called only once, even if multiple exit events occur.
 *
 * @param callback - Function to execute on any exit. Can be async.
 */
export function onAllExits (callback: () => void | Promise<void>) {
  let alreadyCalled = false
  const actualCallback = () => {
    if (!alreadyCalled) {
      alreadyCalled = true
      callback()
    }
  }
  beforeForcedExit(actualCallback)
  beforeExit(actualCallback)
  onExit(actualCallback)
}
