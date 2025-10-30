import { getNodeAncestors as getNodeAncestorsFunc } from './get-node-ancestors/index.js'
import { getPositionInsideParent as getPositionInsideParentFunc } from './get-position-inside-parent/index.js'
import { HyperJson as HyperJsonNamespace } from './hyper-json/index.js'
import {
  InsertNodePosition as InsertNodePositionType,
  insertNode as insertNodeFunc } from './insert-node/index.js'
import { Placeholders as PlaceholdersNamespace } from './placeholders/index.js'
import { Sanitize as SanitizeNamespace } from './sanitize/index.js'
import { selectorToElement as selectorToElementFunc } from './selector-to-element/index.js'
import { stringToNodes as stringToNodesFunc } from './string-to-nodes/index.js'

export namespace Html {
  // Get node ancestors
  export const getNodeAncestors = getNodeAncestorsFunc
  // Get position inside parnet
  export const getPositionInsideParent = getPositionInsideParentFunc
  // HyperJson
  export import HyperJson = HyperJsonNamespace
  // Insert node
  export type InsertNodePosition = InsertNodePositionType
  export const insertNode = insertNodeFunc
  // Placeholders
  export import Placeholders = PlaceholdersNamespace
  // Sanitize
  export import Sanitize = SanitizeNamespace
  // Selector to element
  export const selectorToElement = selectorToElementFunc
  // String to nodes
  export const stringToNodes = stringToNodesFunc
}
