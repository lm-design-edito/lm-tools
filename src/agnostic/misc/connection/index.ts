import * as Window from '../crossenv/window/index.js'

/**
 * Represents a minimal network connection object.
 *
 * @property {number} downlink - Estimated downlink speed in Mbps.
 * @property {'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown'} type - Connection type.
 * @property {'slow-2g' | '2g' | '3g' | '4g'} effectiveType - Effective connection type.
 */
export type MinimalConnection = {
  downlink: number
  type: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown'
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g'
}

function isType (unk: unknown): unk is MinimalConnection['type'] {
  return unk === 'bluetooth'
    || unk === 'cellular'
    || unk === 'ethernet'
    || unk === 'none'
    || unk === 'wifi'
    || unk === 'wimax'
    || unk === 'other'
    || unk === 'unknown'
}

function isEffectiveType (unk: unknown): unk is MinimalConnection['effectiveType'] {
  return unk === 'slow-2g'
    || unk === '2g'
    || unk === '3g'
    || unk === '4g'
}

function isConnection (unk: unknown): unk is MinimalConnection {
  if (typeof unk !== 'object') return false
  if (unk === null) return false
  if (!('downlink' in unk)) return false
  if (typeof unk.downlink !== 'number') return false
  if (!('type' in unk)) return false
  if (!isType(unk.type)) return false
  if (!('effectiveType' in unk)) return false
  if (!isEffectiveType(unk.effectiveType)) return false
  unk
  return true
}

/**
 * Retrieves the current network connection information from the environment.
 *
 * Uses the `navigator.connection` API or vendor-prefixed alternatives.
 *
 * @returns {MinimalConnection | undefined} A minimal connection object if available, otherwise `undefined`.
 */
export function getConnection (): MinimalConnection | undefined  {
  const window = Window.get()
  const navigator = (window as any).navigator
  if (typeof navigator !== 'object' || navigator === null) return undefined
  const connection = navigator.connection
    ?? navigator.mozConnection
    ?? navigator.webkitConnection
  if (!isConnection(connection)) return undefined
  return connection
}

/**
 * Retrieves the estimated downlink speed of the current network connection.
 *
 * @returns {number | undefined} Downlink speed in Mbps, or `undefined` if not available.
 */
export function getCurrentDownlink (): number | undefined {
  return getConnection()?.downlink
}
