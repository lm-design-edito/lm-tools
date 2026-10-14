import type { ReactElement } from 'react'
import {
  LAST_STEP_ATTRIBUTE,
  STEPS_ATTRIBUTE
} from './types.js'

/**
 * `data-steps="2, 6"` into the steps it names.
 *
 * Anything unreadable gives back `null`, which the caller reads as « the attribute was
 * not written » and falls back to the child's position. That is lm-link's rule applied
 * here — a typo costs the default behaviour, never a broken one.
 */
export function parseDataStepsAttribute (raw: unknown): number[] | null {
  if (typeof raw !== 'string') return null
  const parts = raw.split(',').map(part => part.trim()).filter(part => part !== '')
  if (parts.length === 0) return null
  const steps = parts.map(Number)
  if (steps.some(step => !Number.isInteger(step))) return null
  return steps
}

/**
 * Whether a child carries {@link LAST_STEP_ATTRIBUTE}.
 *
 * Present is enough — `data-last-step` alone gives `''` through lm-html, and `true`
 * written in JSX. Only an explicit denial is read as one, so that a consumer computing
 * the attribute can write `false` without having to leave it out.
 */
export function hasDataLastStepAttribute (child: ReactElement): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a React element's props are a record, whatever else they are
  const raw = (child.props as Record<string, unknown>)[LAST_STEP_ATTRIBUTE]
  if (raw === undefined || raw === null) return false
  return raw !== false && raw !== 'false'
}

/** The steps a child answers to: what it declares, or where it sits. */
export function getChildActiveSteps (
  child: ReactElement,
  elementIndex: number
): number[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a React element's props are a record, whatever else they are
  const props = child.props as Record<string, unknown>
  const declared = parseDataStepsAttribute(props[STEPS_ATTRIBUTE])
  return declared ?? [elementIndex]
}
