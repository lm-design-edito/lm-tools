/**
 * Enum representing the possible runtime environments.
 *
 * - `NODE`         : Node.js
 * - `BROWSER`      : Web browser
 * - `DENO`         : Deno runtime
 * - `REACT_NATIVE` : React Native
 * - `ELECTRON`     : Electron
 * - `CLOUDFLARE`   : Cloudflare Workers
 * - `AWS_LAMBDA`   : AWS Lambda
 */
export enum RuntimeName {
  NODE = 'Node.js',
  BROWSER = 'Browser',
  DENO = 'Deno',
  REACT_NATIVE = 'React Native',
  ELECTRON = 'Electron',
  CLOUDFLARE = 'Cloudflare Workers',
  AWS_LAMBDA = 'AWS Lambda'
}

/**
 * Minimal subset of the `navigator` object, limited to the fields that identify
 * the client. Vendor-prefixed and experimental APIs are deliberately absent: a
 * consumer that needs one narrows this type itself.
 *
 * @property userAgent - The client's self-declaration. Spoofable, never a proof.
 * @property vendor - Deprecated, but still the cheapest engine signal.
 * @property maxTouchPoints - Tells an iPad from a Mac, both of which claim macOS.
 */
export interface MinimalNavigator {
  userAgent: string
  vendor: string
  maxTouchPoints: number
}

/**
 * Minimal subset of the `window` object, sufficient to work with DOM-like APIs.
 *
 * Provides access to the basic constructors and the document object:
 * - `Node`
 * - `Element`
 * - `Text`
 * - `NodeList`
 * - `Attr`
 * - `document`
 * - `navigator`, optional, since an injected window may legitimately omit it
 */
export interface MinimalWindow {
  Node: typeof Node
  Element: typeof Element
  Text: typeof Text
  NodeList: typeof NodeList
  Attr: typeof Attr
  ShadowRoot: typeof ShadowRoot
  document: Document
  navigator?: MinimalNavigator
}
