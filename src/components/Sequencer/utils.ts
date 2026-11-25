import type { ReactElement } from 'react'
import {
  ITEMS_ATTRIBUTE,
  LAST_ITEM_ATTRIBUTE
} from './types.js'

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
