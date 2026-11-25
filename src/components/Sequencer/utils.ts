import type { ReactElement } from 'react'
import {
  easings,
  type EasingFunction
} from '../../agnostic/time/transitions/index.js'
import {
  ITEMS_ATTRIBUTE,
  LAST_ITEM_ATTRIBUTE,
  type SequencerEasing
} from './types.js'

export function resolveEasing (easing: SequencerEasing | undefined): EasingFunction {
  if (easing === undefined) return LINEAR
  if (typeof easing === 'function') return easing
  return easings[easing] ?? LINEAR
}

const LINEAR: EasingFunction = ratio => ratio

export function parseDataItemsAttribute (raw: unknown): number[] | null {
  if (typeof raw !== 'string') return null
  const parts = raw.split(',').map(part => part.trim()).filter(part => part !== '')
  if (parts.length === 0) return null
  const items = parts.map(Number)
  if (items.some(item => !Number.isInteger(item))) return null
  return items
}

export function hasDataLastItemAttribute (child: ReactElement): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a React element's props are a record, whatever else they are
  const raw = (child.props as Record<string, unknown>)[LAST_ITEM_ATTRIBUTE]
  if (raw === undefined || raw === null) return false
  return raw !== false && raw !== 'false'
}

export function getChildActiveItems (
  child: ReactElement,
  elementIndex: number
): number[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a React element's props are a record, whatever else they are
  const props = child.props as Record<string, unknown>
  const declared = parseDataItemsAttribute(props[ITEMS_ATTRIBUTE])
  return declared ?? [elementIndex]
}
