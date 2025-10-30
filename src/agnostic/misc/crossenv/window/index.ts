import { Types } from '../types/index.js'

export namespace Window {
  export function exists () {
    return typeof globalThis !== 'undefined' && 'window' in globalThis
  }

  let _window: Types.MinimalWindow | null = exists() ? (globalThis['window'] ?? null) : null 
  
  export function set (customWindow: Types.MinimalWindow | null): Types.MinimalWindow | null {
    _window = customWindow
    return customWindow
  }
  
  export function unset (): Types.MinimalWindow | null {
    if (exists()) { _window = globalThis['window'] }
    else { _window = null }
    return _window
  }
  
  export function get (): Types.MinimalWindow {
    if (_window !== null) return _window
    const message = 'Window is undefined. Please call Window.setWindow(windowObj) before using Window.get.'
    throw new Error(message)
  }
}
