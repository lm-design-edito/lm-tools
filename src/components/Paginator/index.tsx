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
import {
  mergeClassNames,
  useChangeDispatch
} from '../utils/index.js'
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
 * Brings `thresholdOffsetPercent` back into the 0–100 range `rootMargin` accepts.
 *
 * Outside it the margin comes out as `--20%`, which the `IntersectionObserver`
 * constructor rejects by throwing — taking the whole component down with it over a
 * single setting. A non-finite value falls back to `0` for the same reason.
 */
function toThresholdPercent (percent?: number): number {
  if (percent === undefined || !Number.isFinite(percent)) return 0
  return Math.min(100, Math.max(0, percent))
}

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
 * a page must be before it is considered `'curr'`. Defaults to `0`. Clamped to
 * 0–100, with a `console.warn` naming the value received — outside that range the
 * root margin is invalid and the observer would throw.
 *
 * @property onDirectionChanged - Called after the scroll direction changed, with
 * the new {@link DirectionState}. Repeated scrolls in the same direction do not
 * trigger it again.
 * @property onPagesChanged - Called after any page's {@link PageState} changed,
 * with a flat array of every page's state, ordered by position.
 * @property onPageElementsChanged - Called with the page slot elements, in order,
 * whenever the observed set changes. Unlike the other handlers it *does* fire on
 * mount: the elements don't exist before it, so their appearance is the change.
 * Lets a parent measure the pages without reaching into this component's DOM.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - Each direct child is treated as an individual page slot.
 */
export type Props = PropsWithChildren<WithClassName<{
  thresholdOffsetPercent?: number
  onDirectionChanged?: (direction: DirectionState) => void
  onPagesChanged?: (pages: PageState[]) => void
  onPageElementsChanged?: (pageElements: HTMLElement[]) => void
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
 *   that is recreated when `thresholdOffsetPercent` or the **number** of children
 *   changes. Not on `children` itself: a parent building its child list inline hands
 *   over a new array on every render, which would tear down and rebuild one observer
 *   per page each time, for nothing.
 * - `currCount` on each {@link PageState} increments each time a page transitions
 *   into the `'curr'` position, making it useful as a re-entry counter.
 */
export const Paginator: FunctionComponent<Props> = ({
  thresholdOffsetPercent,
  onDirectionChanged,
  onPagesChanged,
  onPageElementsChanged,
  className,
  children
}) => {
  // State, refs, effects
  const [pagesState, setPagesState] = useState<PagesState>(new Map())
  const [directionState, setDirectionState] = useState<DirectionState>(null)
  const pagesRef = useRef<HTMLDivElement>(null)
  const directionRef = useRef<DirectionState>(null)
  const childrenArr = Children.toArray(children)
  const pagesCount = childrenArr.length
  const thresholdPercent = toThresholdPercent(thresholdOffsetPercent)

  // Fx. dep. thresholdOffsetPercent, thresholdPercent - Says it once per offending
  // value rather than on every render. Clamping without a word would turn a caller's
  // bug into a scrolling glitch, hunted for somewhere else entirely.
  useEffect(() => {
    if (thresholdOffsetPercent === undefined) return
    if (thresholdPercent === thresholdOffsetPercent) return
    // eslint-disable-next-line no-console
    console.warn(
      'Paginator: thresholdOffsetPercent must be a number between 0 and 100, received',
      thresholdOffsetPercent,
      `— clamped to ${thresholdPercent}.`
    )
  }, [thresholdOffsetPercent, thresholdPercent])

  // State dispatch
  useChangeDispatch(pagesState, pages => onPagesChanged?.(Array
    .from(pages)
    .map(([, pageState]) => pageState)))
  useChangeDispatch(directionState, onDirectionChanged)

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
      }
    }
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  // Fx. dep. pagesCount - The page slots are this component's own divs, reused as
  // long as their number holds, so the set only changes when the count does.
  useEffect(() => {
    if (pagesRef.current === null) return
    const pages = Array.from(pagesRef.current.children)
    onPageElementsChanged?.(pages.filter(page => page instanceof HTMLElement))
  }, [pagesCount])

  // Detect active pages with Intersection Observer
  // Fx. dep. thresholdPercent, pagesCount - Same reasoning: rebuilding one observer
  // per page on every render would cost a full measurement pass for an unchanged set.
  useEffect(() => {
    if (pagesRef.current === null) return
    const pages = Array.from(pagesRef.current.children)
    const observerRootMargin = `-${thresholdPercent}%`
      + ' 0px'
      + ` -${100 - thresholdPercent}%`
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
        return nextState
      })
    }, { rootMargin: observerRootMargin })
    const pageIndexMap = new Map<Element, number>()
    pages.forEach((page, index) => {
      pageIndexMap.set(page, index)
      observer.observe(page)
    })
    return () => observer.disconnect()
  }, [thresholdPercent, pagesCount])

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
