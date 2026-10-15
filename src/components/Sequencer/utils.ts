import type { ReactElement } from 'react'
import {
  LAST_STEP_ATTRIBUTE,
  STEPS_ATTRIBUTE
} from './types.js'

export function parseDataStepsAttribute (raw: unknown): number[] | null {
  if (typeof raw !== 'string') return null
  const parts = raw.split(',').map(part => part.trim()).filter(part => part !== '')
  if (parts.length === 0) return null
  const steps = parts.map(Number)
  if (steps.some(step => !Number.isInteger(step))) return null
  return steps
}

export function hasDataLastStepAttribute (child: ReactElement): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a React element's props are a record, whatever else they are
  const raw = (child.props as Record<string, unknown>)[LAST_STEP_ATTRIBUTE]
  if (raw === undefined || raw === null) return false
  return raw !== false && raw !== 'false'
}

export function getChildActiveSteps (
  child: ReactElement,
  elementIndex: number
): number[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a React element's props are a record, whatever else they are
  const props = child.props as Record<string, unknown>
  const declared = parseDataStepsAttribute(props[STEPS_ATTRIBUTE])
  return declared ?? [elementIndex]
}
