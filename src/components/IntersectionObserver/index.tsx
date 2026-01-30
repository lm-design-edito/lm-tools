import {
  type ReactNode,
  useState,
  useRef,
  useEffect,
  useCallback
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { isNotFalsy } from '../../agnostic/booleans/is-falsy/index.js'
import { intersectionObserver } from '../public-classnames.js'
import cssModule from './styles.module.css'

export type IO = IntersectionObserver
export type IOE = IntersectionObserverEntry

type ObserverOptions = {
  root?: HTMLElement
  rootMargin?: string
  threshold?: number[] | number
}

export type Props = {
  className?: string
  render?: ReactNode
  onIntersection?: (details: { ioEntry?: IOE | undefined, observer: IO }) => void
  content?: ReactNode
  children?: ReactNode
} & ObserverOptions

export const IntersectionObserverComponent = ({
  className,
  render,
  content,
  onIntersection,
  root,
  rootMargin,
  threshold,
  children
}: Props) => {
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

  // Main observer effect
  useEffect(() => {
    const rootEl = rootRef.current
    if (rootEl === null) return console.warn('rootRef.current should not be null')
    const observer = new IntersectionObserver(observation, { root, rootMargin, threshold })
    observerRef.current = observer
    observer.observe(rootEl)
    return () => observer.disconnect()
  }, [root, rootMargin, threshold, observation])

  // Force observation timeouts
  useEffect(() => {
    const timeout1 = window.setTimeout(forceObservation, 100)
    const timeout2 = window.setTimeout(forceObservation, 500)
    return () => {
      window.clearTimeout(timeout1)
      window.clearTimeout(timeout2)
    }
  }, [forceObservation])

  // Class names & rendering
  const c = clss(intersectionObserver, { cssModule })
  const isIntersecting = ioEntry?.isIntersecting ?? false
  const wrapperClassName = [
    c(null, { 'is-intersecting': isIntersecting }),
    className
  ].filter(isNotFalsy).join(' ')

  return <div
    ref={rootRef}
    className={wrapperClassName}>
    {render ?? null}
    {children}
    {content}
  </div>
}
