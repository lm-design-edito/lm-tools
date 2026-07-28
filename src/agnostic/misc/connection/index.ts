/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import * as Window from '../crossenv/window/index.js'

/**
 * Represents a minimal network connection object.
 *
 * @property downlink - Estimated downlink speed in Mbps.
 * @property type - Connection type.
 * @property effectiveType - Effective connection type.
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
  return true
}

/**
 * Retrieves the current network connection information from the environment.
 *
 * Uses the `navigator.connection` API or vendor-prefixed alternatives.
 *
 * @returns A minimal connection object if available, otherwise `undefined`.
 */
export function getConnection (): MinimalConnection | undefined {
  const window = Window.get()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-type-assertion -- MinimalWindow deliberately doesn't declare `navigator`; this is browser-only feature detection, guarded by the typeof/null check below
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
 * @returns Downlink speed in Mbps, or `undefined` if not available.
 */
export function getCurrentDownlink (): number | undefined {
  return getConnection()?.downlink
}
