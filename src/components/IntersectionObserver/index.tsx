import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type JSX,
  type PropsWithChildren,
  type FunctionComponent
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { mergeClassNames } from '../utils/index.js'
import type { WithClassName } from '../utils/types.js'
import { intersectionObserver as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

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
 * Props for the IntersectionObserverComponent.
 *
 * @property onIntersection - Callback invoked whenever an intersection change
 * is reported. Receives an object containing the current IntersectionObserverEntry
 * (if available) and the active IntersectionObserver instance.
 * @property root - See {@link ObserverOptions.root}.
 * @property rootMargin - See {@link ObserverOptions.rootMargin}.
 * @property threshold - See {@link ObserverOptions.threshold}.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - React children rendered inside the observed element.
 */
export type Props = PropsWithChildren<WithClassName<{
  onIntersection?: (details: {
    ioEntry?: IOE | undefined
    observer: IO
  }) => void
} & ObserverOptions>>

/**
 * Component that observes its root element using the IntersectionObserver API
 * and notifies consumers about visibility changes.
 *
 * @param props - Component properties.
 * @see {@link Props}
 *
 * @returns A div element wrapping `children`, observed for intersection changes.
 *
 * @remarks
 * - Automatically creates and disconnects the IntersectionObserver instance.
 * - Re-observes the element shortly after mount to handle late layout changes.
 * - Adds an `is-intersecting` modifier class when the element is intersecting.
 */
export const IntersectionObserverComponent: FunctionComponent<Props> = ({
  onIntersection,
  root,
  rootMargin,
  threshold,
  className,
  children
}): JSX.Element => {
  // Refs, handlers and effects
  const [ioEntry, setIoEntry] = useState<IOE | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IO | null>(null)

  const observation = useCallback((entries: IOE[], observer: IO): void => {
    const thisEntry = entries[0]
    if (thisEntry === undefined) return setIoEntry(null)
    if (onIntersection !== undefined) onIntersection({
      ioEntry: thisEntry,
      observer
    })
    setIoEntry(thisEntry)
  }, [onIntersection])

  const forceObservation = useCallback((): void => {
    const rootEl = rootRef.current
    const observer = observerRef.current
    if (rootEl === null || observer === null) return
    observer.unobserve(rootEl)
    observer.observe(rootEl)
  }, [])

  useEffect(() => {
    const rootEl = rootRef.current
    if (rootEl === null) return console.warn('rootRef.current should not be null')
    const observer = new IntersectionObserver(observation, { root, rootMargin, threshold })
    observerRef.current = observer
    observer.observe(rootEl)
    return () => observer.disconnect()
  }, [root, rootMargin, threshold, observation])

  useEffect(() => {
    const timeout1 = window.setTimeout(forceObservation, 100)
    const timeout2 = window.setTimeout(forceObservation, 500)
    return () => {
      window.clearTimeout(timeout1)
      window.clearTimeout(timeout2)
    }
  }, [forceObservation])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const isIntersecting = ioEntry?.isIntersecting ?? false
  const rootClss = mergeClassNames(
    c(null, { 'is-intersecting': isIntersecting }),
    className
  )
  return <div
    className={rootClss}
    ref={rootRef}>
    {children}
  </div>
}
