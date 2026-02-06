import { type MinimalWindow } from '../types.js'

/**
 * Checks whether a `window` object exists in the current environment.
 *
 * @returns {boolean} `true` if `window` is present, `false` otherwise.
 */
export function exists (): boolean {
  return typeof globalThis !== 'undefined'
    && 'window' in globalThis
}

let _window: MinimalWindow | null = exists()
  ? (globalThis.window ?? null)
  : null

/**
 * Sets a custom `window` object to be used internally.
 *
 * @param {MinimalWindow | null} customWindow - The window object to set, or `null` to unset.
 * @returns {MinimalWindow | null} The window object that was set.
 */
export function set (customWindow: MinimalWindow | null): MinimalWindow | null {
  _window = customWindow
  return customWindow
}

/**
 * Resets the internal window reference to the global `window` if it exists,
 * or `null` if no global `window` is available.
 *
 * @returns {MinimalWindow | null} The current internal window object after reset.
 */
export function unset (): MinimalWindow | null {
  if (exists()) { _window = globalThis.window } else { _window = null }
  return _window
}

/**
 * Retrieves the currently set `window` object.
 *
 * @returns {MinimalWindow} The internal window object.
 * @throws Will throw an error if no window has been set and none exists globally.
 */
export function get (): MinimalWindow {
  if (_window !== null) return _window
  const message = 'window is undefined. Please call Window.setWindow(windowObj) before using Window.get.'
  throw new Error(message)
}
