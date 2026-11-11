/* The ambient types promise globals that a given runtime may not actually
 * carry, so every access below stays optional on purpose. */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { RuntimeName } from '../types.js'

declare const Deno: unknown

/**
 * Detects the current JavaScript runtime environment.
 *
 * Checks for Electron, AWS Lambda, Deno, React Native, Cloudflare Workers,
 * Node.js and the browser, in that order.
 *
 * @returns
 * - The detected runtime as a `RuntimeName` enum value.
 * - `null` if the runtime cannot be determined.
 *
 * @remarks
 * Candidates are tested from the most specific to the most general, because
 * several runtimes are supersets of others: Electron and AWS Lambda both run on
 * Node, Deno ships a `process` shim for Node compatibility, and an Electron
 * renderer owns a `window` too. Every marker is read behind `typeof`, since an
 * undeclared identifier throws on access where `?.` would not catch it.
 */
export function detectRuntime (): RuntimeName | null {
  const hasProcess = typeof process !== 'undefined'
  const hasNavigator = typeof navigator !== 'undefined'
  if (hasProcess && process.versions?.electron !== undefined) return RuntimeName.ELECTRON
  if (hasProcess && process.env?.AWS_LAMBDA_FUNCTION_NAME !== undefined) return RuntimeName.AWS_LAMBDA
  if (typeof Deno !== 'undefined') return RuntimeName.DENO
  if (hasNavigator && isReactNativeNavigator(navigator)) return RuntimeName.REACT_NATIVE
  if (hasNavigator && navigator.userAgent === 'Cloudflare-Workers') return RuntimeName.CLOUDFLARE
  if (hasProcess && typeof process.versions?.node === 'string') return RuntimeName.NODE
  if (typeof window !== 'undefined' && window.document !== undefined) return RuntimeName.BROWSER
  return null
}

// `product` is deprecated, but it stays the marker React Native sets on itself.
function isReactNativeNavigator (candidate: Navigator): boolean {
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  if (candidate.product === 'ReactNative') return true
  return candidate.userAgent?.includes('ReactNative') ?? false
}
