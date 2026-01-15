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
 * Minimal subset of the `window` object, sufficient to work with DOM-like APIs.
 *
 * Provides access to the basic constructors and the document object:
 * - `Node`
 * - `Element`
 * - `Text`
 * - `NodeList`
 * - `Attr`
 * - `document`
 */
export interface MinimalWindow {
  Node: typeof Node
  Element: typeof Element
  Text: typeof Text
  NodeList: typeof NodeList
  Attr: typeof Attr
  document: Document
}