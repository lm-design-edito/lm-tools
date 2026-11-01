import {
  useEffect,
  useState,
  type RefObject
} from 'react'
import { useStateChangeDispatch } from '../../../agnostic/@react/effects/use-state-change-dispatch/index.js'
import { sendCommands } from '../commands/index.js'
import { useDisclosure } from '../disclosure/index.js'
import {
  useIntersectionObserver,
  type ObserverOptions
} from '../intersection/index.js'
import type { VisibilityProps } from './types.js'

/** The intersection settings, plus how long a change has to hold before it counts. */
export type VisibilityOptions = ObserverOptions & {
  onAfterMs?: number
  offAfterMs?: number
}

/**
 * Whether the element is visible, once the intersection has held for its delay.
 * `undefined` until the first observation lands, so a first answer is a change.
 */
export function useVisibility (
  targetRef: RefObject<Element | null>,
  { onAfterMs, offAfterMs, ...observerOptions }: VisibilityOptions = {},
  enabled = true
): boolean | undefined {
  const ioEntry = useIntersectionObserver(targetRef, observerOptions, undefined, enabled)
  const isIntersecting = ioEntry?.isIntersecting
  const [isVisible, setIsVisible] = useState<boolean>()

  useEffect(() => {
    if (isIntersecting === undefined) return
    const delay = isIntersecting ? onAfterMs : offAfterMs
    if (delay === undefined) {
      setIsVisible(isIntersecting)
      return
    }
    // Cleared by the next change, so an intersection that does not hold never counts.
    const timeout = window.setTimeout(() => setIsVisible(isIntersecting), delay)
    return () => { window.clearTimeout(timeout) }
  }, [isIntersecting, onAfterMs, offAfterMs])

  return isVisible
}

/**
 * Sends a trigger's commands on each settled change, and hands the state back.
 *
 * **A component withheld by a disclaimer sends nothing**: it is behind a panel the reader
 * has not accepted, and driving the rest of the page from there is the same overreach as
 * answering a verb. `onVisibilityChanged` still fires — it informs a parent, it does not
 * act.
 */
export function useVisibilityTriggers (
  compId: string,
  targetRef: RefObject<Element | null>,
  {
    whenVisible,
    whenHidden,
    onVisibilityChanged,
    visibilityThreshold,
    visibilityRoot,
    visibilityRootMargin,
    visibilityOnAfterMs,
    visibilityOffAfterMs
  }: VisibilityProps
): boolean | undefined {
  const isAsked = whenVisible !== undefined
    || whenHidden !== undefined
    || onVisibilityChanged !== undefined
  const { isDisclosed } = useDisclosure()

  const isVisible = useVisibility(
    targetRef,
    {
      threshold: visibilityThreshold,
      root: visibilityRoot,
      rootMargin: visibilityRootMargin,
      onAfterMs: visibilityOnAfterMs,
      offAfterMs: visibilityOffAfterMs
    },
    isAsked
  )

  useStateChangeDispatch(isVisible, visible => {
    if (visible === undefined) return
    onVisibilityChanged?.(visible)
    if (!isDisclosed) return
    const commands = visible ? whenVisible : whenHidden
    if (commands === undefined) return
    sendCommands(commands, compId)
  })

  return isVisible
}
