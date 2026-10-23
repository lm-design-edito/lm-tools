import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject
} from 'react'

/** Alias for the native IntersectionObserver interface. */
export type IO = IntersectionObserver

/** Alias for the native IntersectionObserverEntry interface. */
export type IOE = IntersectionObserverEntry

/**
 * Configuration options for the underlying IntersectionObserver instance.
 *
 * @property root - The element used as the viewport for checking visibility.
 * If not provided, the browser viewport is used.
 * @property rootMargin - Margin around the root, in CSS margin format
 * (e.g. "10px 20px"). Expands or shrinks the effective root bounds.
 * @property threshold - A single number or an array of numbers indicating
 * at what percentage(s) of the target's visibility the observer callback
 * should be executed.
 */
export type ObserverOptions = {
  root?: HTMLElement
  rootMargin?: string
  threshold?: number[] | number
}

/**
 * Called on every intersection change, with the current entry and the observer
 * that reported it.
 */
export type OnIntersected = (details: {
  ioEntry?: IOE | undefined
  observer: IO
}) => void

/**
 * Observes an element a caller already renders, rather than one wrapped in a div of
 * our own.
 *
 * This is the whole of the behaviour; `IntersectionObserverComponent` is this hook
 * plus a div to hang it on. Reach for the hook when the element to watch is already
 * in the tree — a component's own root, typically — and for the component when there
 * is nothing to watch yet and a box has to be created.
 *
 * @param targetRef - The element to observe. Nothing happens until it is attached.
 * @param options - See {@link ObserverOptions}.
 * @param onIntersected - Called on every intersection change.
 * @param enabled - `false` skips the observer entirely, for a caller whose need for
 * it depends on its own props. A hook cannot be called conditionally; this is how
 * the condition is expressed.
 *
 * @returns The latest {@link IntersectionObserverEntry}, or `null` before the first.
 *
 * @remarks
 * - Automatically creates and disconnects the {@link IntersectionObserver} instance.
 * - Re-observes the element shortly after mount to handle late layout changes.
 */
export function useIntersectionObserver (
  targetRef: RefObject<Element | null>,
  { root, rootMargin, threshold }: ObserverOptions,
  onIntersected?: OnIntersected,
  enabled = true
): IOE | null {
  const [ioEntry, setIoEntry] = useState<IOE | null>(null)
  const observerRef = useRef<IO | null>(null)

  const observation = useCallback((entries: IOE[], observer: IO): void => {
    const thisEntry = entries[0]
    if (thisEntry === undefined) return setIoEntry(null)
    onIntersected?.({ ioEntry: thisEntry, observer })
    setIoEntry(thisEntry)
  }, [onIntersected])

  const forceObservation = useCallback((): void => {
    const targetEl = targetRef.current
    const observer = observerRef.current
    if (targetEl === null || observer === null) return
    observer.unobserve(targetEl)
    observer.observe(targetEl)
  }, [targetRef])

  useEffect(() => {
    if (!enabled) return
    const targetEl = targetRef.current
    if (targetEl === null) {
      // eslint-disable-next-line no-console
      console.warn('targetRef.current should not be null')
      return
    }
    const observer = new IntersectionObserver(observation, { root, rootMargin, threshold })
    observerRef.current = observer
    observer.observe(targetEl)
    return () => observer.disconnect()
  }, [enabled, targetRef, root, rootMargin, threshold, observation])

  useEffect(() => {
    if (!enabled) return
    const timeout1 = window.setTimeout(forceObservation, 100)
    const timeout2 = window.setTimeout(forceObservation, 500)
    return () => {
      window.clearTimeout(timeout1)
      window.clearTimeout(timeout2)
    }
  }, [enabled, forceObservation])

  return ioEntry
}
