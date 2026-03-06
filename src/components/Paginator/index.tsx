import {
  type PropsWithChildren,
  type FunctionComponent,
  useEffect,
  useRef,
  Children,
  useState
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { paginator as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * State associated with a single page slot.
 *
 * @property position - The current position of the page relative to the viewport:
 * - `'prev'` — the page has been scrolled past.
 * - `'curr'` — the page is currently visible in the viewport.
 * - `'next'` — the page has not yet been reached.
 * @property currCount - The number of times this page has entered the `'curr'` position.
 */
type PageState = {
  position: 'prev' | 'curr' | 'next'
  currCount: number
}

type PagesState = Map<number, PageState>

/**
 * Represents the scroll direction state of the paginator.
 * - `'forwards'` — the user is scrolling down.
 * - `'backwards'` — the user is scrolling up.
 * - `null` — no scroll has been detected yet.
 */
type DirectionState = 'forwards' | 'backwards' | null

/**
 * Props for the {@link Paginator} component.
 *
 * @property thresholdOffsetPercent - Optional percentage offset used to compute
 * the {@link IntersectionObserver} root margin. Determines how far into the viewport
 * a page must be before it is considered `'curr'`. Defaults to `0`.
 *
 * @property onDirectionChange - Callback invoked when the scroll direction changes.
 * Receives the new {@link DirectionState}. Only fires when the direction actually
 * changes — repeated scrolls in the same direction do not trigger it again.
 *
 * @property onPageChange - Callback invoked whenever any page's {@link PageState}
 * changes. Receives a flat array of all pages' states, ordered by position.
 *
 * @property dispatchedDirectionChangeEventType - Optional name of a global DOM event
 * to dispatch on {@link Window} when the scroll direction changes. When defined, the
 * component emits a {@link CustomEvent} with this name via `window.dispatchEvent`.
 * The new {@link DirectionState} is available in `event.detail`.
 *
 * Example:
 * ```js
 * window.addEventListener('my-paginator:direction', (event) => {
 *   console.log(event.detail) // 'forwards' | 'backwards'
 * })
 * ```
 *
 * @property dispatchedPageChangeEventType - Optional name of a global DOM event
 * to dispatch on {@link Window} when any page state changes. The event `detail`
 * contains a flat array of all current {@link PageState} values.
 *
 * Example:
 * ```js
 * window.addEventListener('my-paginator:page', (event) => {
 *   console.log(event.detail) // PageState[]
 * })
 * ```
 *
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - Each direct child is treated as an individual page slot.
 */
export type Props = PropsWithChildren<WithClassName<{
  thresholdOffsetPercent?: number
  onDirectionChange?: (direction: DirectionState) => void
  onPageChange?: (pages: PageState[]) => void
  dispatchedDirectionChangeEventType?: string
  dispatchedPageChangeEventType?: string
}>>

/**
 * A scroll-driven pagination component that tracks which child page is currently
 * visible in the viewport and the direction of scroll.
 *
 * Each direct child is wrapped in a page slot and observed via
 * {@link IntersectionObserver}. Page slots receive `'prev'`, `'curr'`, or `'next'`
 * positional modifier classes based on their visibility.
 *
 * @param props - Component properties.
 * @see {@link Props}
 *
 * @returns A root div containing a pages wrapper, with each child isolated in
 * its own observed page slot div.
 *
 * @remarks
 * - Scroll direction is throttled to one update per 100ms and only dispatched
 *   when the direction actually changes, using an internal ref to avoid stale
 *   closure comparisons.
 * - Page visibility is tracked via a single {@link IntersectionObserver} instance
 *   that is recreated when `thresholdOffsetPercent` or `children` change.
 * - `currCount` on each {@link PageState} increments each time a page transitions
 *   into the `'curr'` position, making it useful as a re-entry counter.
 * - Can optionally dispatch global {@link CustomEvent}s on {@link Window} for both
 *   direction and page changes when the corresponding event type props are provided.
 */
export const Paginator: FunctionComponent<Props> = ({
  thresholdOffsetPercent,
  onDirectionChange,
  onPageChange,
  dispatchedDirectionChangeEventType: dirChgEvtType,
  dispatchedPageChangeEventType: pgChgEvtType,
  className,
  children
}) => {
  // State, refs, effects
  const [pagesState, setPagesState] = useState<PagesState>(new Map())
  const [directionState, setDirectionState] = useState<DirectionState>(null)
  const pagesRef = useRef<HTMLDivElement>(null)
  const directionRef = useRef<DirectionState>(null)

  // Catch scroll direction listening on scroll events
  useEffect(() => {
    let lastCall = 0
    let lastScrollY = window.scrollY
    const handleScroll = (e: Event): void => {
      const now = Date.now()
      if (now - lastCall < 100) return
      lastCall = now
      const currentScrollY = window.scrollY
      const direction = currentScrollY > lastScrollY ? 'forwards' : 'backwards'
      lastScrollY = currentScrollY
      if (direction !== directionRef.current) {
        directionRef.current = direction
        setDirectionState(direction)
        if (onDirectionChange !== undefined) onDirectionChange(direction)
        if (dirChgEvtType !== undefined) window.dispatchEvent(new CustomEvent(
          dirChgEvtType,
          { detail: direction }
        ))
      }
    }
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  // Detect active pages with Intersection Observer
  useEffect(() => {
    if (pagesRef.current === null) return
    const pages = Array.from(pagesRef.current.children)
    const observerRootMargin = `-${thresholdOffsetPercent ?? 0}%`
      + ' 0px'
      + ` -${100 - (thresholdOffsetPercent ?? 0)}%`
      + ' 0px'
    const observer = new IntersectionObserver(entries => {
      setPagesState(prevState => {
        const nextState = new Map(prevState)
        entries.forEach(entry => {
          const index = pageIndexMap.get(entry.target)
          if (index === undefined) return
          const prev = prevState.get(index)
          const position: PageState['position'] = entry.isIntersecting
            ? 'curr'
            : entry.boundingClientRect.bottom < (entry.rootBounds?.top ?? 0)
              ? 'prev'
              : 'next'
          const currCount = position === 'curr'
            && prev?.position !== 'curr'
            ? (prev?.currCount ?? 0) + 1
            : (prev?.currCount ?? 0)
          nextState.set(index, { position, currCount })
        })
        const dispatchedState = Array.from(nextState).map(([, state]) => state)
        if (onPageChange !== undefined) onPageChange(dispatchedState)
        if (pgChgEvtType !== undefined) window.dispatchEvent(new CustomEvent(pgChgEvtType, { detail: dispatchedState }))
        return nextState
      })
    }, { rootMargin: observerRootMargin })
    const pageIndexMap = new Map<Element, number>()
    pages.forEach((page, index) => {
      pageIndexMap.set(page, index)
      observer.observe(page)
    })
    return () => observer.disconnect()
  }, [thresholdOffsetPercent, children])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(
    c(null, {
      forwards: directionState === 'forwards',
      backwards: directionState === 'backwards'
    }),
    className
  )
  const pagesClss = c('pages')
  const childrenArr = Children.toArray(children)
  return <div className={rootClss}>
    <div
      className={pagesClss}
      ref={pagesRef}>
      {childrenArr.map((child, pos) => {
        const state = pagesState.get(pos)
        const pageClss = c('page', {
          first: pos === 0,
          last: pos === childrenArr.length - 1,
          prev: state?.position === 'prev',
          curr: state?.position === 'curr',
          next: state?.position === 'next'
        })
        return <div
          className={pageClss}
          data-page={pos}
          data-curr-count={state?.currCount ?? 0}
          key={pos}>
          {child}
        </div>
      })}
    </div>
  </div>
}
