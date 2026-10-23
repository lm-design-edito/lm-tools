import {
  useEffect,
  useState,
  type RefObject
} from 'react'
import {
  useIntersectionObserver,
  type ObserverOptions
} from '../intersection/index.js'

/** The intersection settings, plus how long a change has to hold before it counts. */
export type VisibilityOptions = ObserverOptions & {
  onAfterMs?: number
  offAfterMs?: number
}

/** Whether the element is visible, once the intersection has held for its delay. */
export function useVisibility (
  targetRef: RefObject<Element | null>,
  { onAfterMs, offAfterMs, ...observerOptions }: VisibilityOptions = {}
): boolean {
  const ioEntry = useIntersectionObserver(targetRef, observerOptions)
  const isIntersecting = ioEntry?.isIntersecting ?? false
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
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
