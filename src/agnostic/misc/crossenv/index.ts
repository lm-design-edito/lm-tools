import { getWindow as getWindowFunction } from './get-window'
import { getDocument as getDocumentFunction } from './get-document'

declare var Deno: any
declare var AWS: any

export namespace Crossenv {
  export enum RuntimeName {
    NODE = 'Node.js',
    BROWSER = 'Browser',
    DENO = 'Deno',
    REACT_NATIVE = 'React Native',
    ELECTRON = 'Electron',
    CLOUDFLARE = 'Cloudflare Workers',
    AWS_LAMBDA = 'AWS Lambda'
  }

  export function detectRuntime (): RuntimeName | null {
    /* Node.js */
    if (typeof process !== 'undefined'
      && typeof process.versions !== 'undefined'
      && typeof process.versions.node !== 'undefined') return RuntimeName.NODE
    /* Browser */
    if (typeof window !== 'undefined'
      && typeof window.document !== 'undefined') return RuntimeName.BROWSER
    /* Deno */
    if (typeof Deno !== 'undefined') return RuntimeName.DENO
    /* React Native */
    if (typeof process !== 'undefined' &&
      typeof navigator.userAgent === 'string'
      && /ReactNative/.test(navigator.userAgent)) return RuntimeName.REACT_NATIVE
    /* Electron */
    if (typeof process !== 'undefined'
      && typeof process.versions !== 'undefined'
      && typeof (process.version as any).electron !== 'undefined') return RuntimeName.ELECTRON
    /* Cloudflare Workers */
    if (typeof self !== 'undefined'
      && typeof self.addEventListener === 'function'
      && typeof Headers !== 'undefined') return RuntimeName.CLOUDFLARE
    /* AWS Lambda */ 
    if (typeof AWS !== 'undefined'
      && typeof AWS.Lambda !== 'undefined') return RuntimeName.AWS_LAMBDA
    /* Other */
    return null
  }

  export const getWindow = getWindowFunction
  export const getDocument = getDocumentFunction
}
