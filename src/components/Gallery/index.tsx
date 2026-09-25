import {
  type FunctionComponent,
  type PropsWithChildren,
  type ReactNode,
  Children,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import type { WithClassName } from '../utils/types.js'
import {
  mergeClassNames,
  useChangeDispatch
} from '../utils/index.js'
import { gallery as publicClassName } from '../public-classnames.js'
import {
  EMPTY_GEOMETRY,
  measureGeometry,
  readActiveIndex,
  readReach,
  type Geometry
} from './utils.js'
import cssModule from './styles.module.css'

/** Resolves one side's offset to a CSS length, falling back to the shorthand then to `0px`. */
function resolveOffset (
  side: string | number | undefined,
  shorthand: string | number | undefined
): string {
  const value = side ?? shorthand ?? 0
  return typeof value === 'number' ? `${value}px` : value
}

/**
 * Props for the Gallery component.
 *
 * @property offsetLeft - Room kept before the first slot, so it can reach the middle
 * like any other. A number is pixels. Falls back to `offset`, then `0px`.
 * @property offsetRight - Room kept after the last slot. Same rules.
 * @property offset - Shorthand for both ends, used when a side is not set.
 * @property prevButtonContent - Content of the "previous" control. Defaults to `"prev"`.
 * @property nextButtonContent - Content of the "next" control. Defaults to `"next"`.
 * @property paginationContent - Content of each pagination item: a node used for all of
 * them, a function of the page index, or undefined to show the index.
 * @property defaultActive - Slot to scroll to at mount, in uncontrolled mode.
 * @property active - Controlled index. When set, the active slot is this one and hand
 * scrolling is disabled.
 * @property noSnap - Frees the scroll from snapping to a slot.
 * @property onPrevClicked - Fires before the gallery reacts, with the index as it was.
 * @property onNextClicked - Fires before the gallery reacts, with the index as it was.
 * @property onPaginationClicked - Fires before the gallery reacts, with `activePos`
 * as it was and `targetPos`, the one aimed at.
 * @property onActiveSlotChanged - Fires after the active slot changed, with the new index.
 * @property onCanGoLeftChanged - Fires after the ability to scroll further left changed.
 * Never on mount.
 * @property onCanGoRightChanged - Same, to the right.
 * @property className - Added to the root element.
 * @property children - One slot per child.
 */
export type Props = PropsWithChildren<WithClassName<{
  offsetLeft?: string | number
  offsetRight?: string | number
  offset?: string | number
  prevButtonContent?: ReactNode
  nextButtonContent?: ReactNode
  paginationContent?: ReactNode | ((page: number) => ReactNode)
  defaultActive?: number
  active?: number
  noSnap?: boolean
  onPrevClicked?: (activePos: number) => void
  onNextClicked?: (activePos: number) => void
  onPaginationClicked?: (payload: { activePos: number, targetPos: number }) => void
  onActiveSlotChanged?: (activePos: number) => void
  onCanGoLeftChanged?: (canGoLeft: boolean) => void
  onCanGoRightChanged?: (canGoRight: boolean) => void
}>>

/**
 * Horizontally scrollable gallery, with navigation controls and pagination.
 *
 * Geometry is measured **once per layout change** into a table of scroll positions, one
 * per slot, and the boundaries between them. A scroll event then only has to place a
 * number between two others — no element is measured while the reader scrolls.
 *
 * The same table is what the controls scroll to, so reading the active slot and moving
 * to one cannot disagree, with or without snapping.
 *
 * ### CSS elements
 * - `scroller`
 * - `slot`, `slot--active`
 * - `actions`, `prev`, `next`
 * - `pagination`, `page`, `page--active`
 *
 * Root modifiers: `controlled`, `no-snap`, `measured`, `at-first`, `at-last`,
 * `can-go-left`, `can-go-right`.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A container wrapping the scroller, the two controls and the pagination.
 *
 * @remarks
 * Nothing is measured while the reader scrolls: the table is rebuilt only when a box
 * changes size or a slot is added, watched through a `ResizeObserver`. Until the first
 * measurement lands, the root carries no `measured` modifier and every slot position
 * reads as `0`.
 */
export const Gallery: FunctionComponent<Props> = ({
  offsetLeft,
  offsetRight,
  offset,
  prevButtonContent,
  nextButtonContent,
  paginationContent,
  defaultActive,
  active,
  noSnap,
  onPrevClicked,
  onNextClicked,
  onPaginationClicked,
  onActiveSlotChanged,
  onCanGoLeftChanged,
  onCanGoRightChanged,
  children,
  className
}) => {
  // State & refs
  const scrollerRef = useRef<HTMLDivElement>(null)
  const geometryRef = useRef<Geometry>(EMPTY_GEOMETRY)
  const [scrolledIndex, setScrolledIndex] = useState(0)
  const [isMeasured, setIsMeasured] = useState(false)
  const [canGoLeft, setCanGoLeft] = useState(false)
  const [canGoRight, setCanGoRight] = useState(false)
  const childrenCount = Children.count(children)
  const isControlled = active !== undefined
  // Controlled, the prop is the answer: the class names and `data-active` say where the
  // gallery was told to be, rather than where a smooth scroll has got to so far.
  const activeIndex = active ?? scrolledIndex

  // State dispatch
  useChangeDispatch(activeIndex, onActiveSlotChanged)
  useChangeDispatch(canGoLeft, onCanGoLeftChanged)
  useChangeDispatch(canGoRight, onCanGoRightChanged)

  const readScroll = useCallback((): void => {
    const scrollerElt = scrollerRef.current
    if (scrollerElt === null) return
    const { scrollLeft } = scrollerElt
    const geometry = geometryRef.current
    setScrolledIndex(readActiveIndex(geometry, scrollLeft))
    const { canGoLeft, canGoRight } = readReach(geometry, scrollLeft)
    setCanGoLeft(canGoLeft)
    setCanGoRight(canGoRight)
  }, [])

  const measure = useCallback((): void => {
    const scrollerElt = scrollerRef.current
    if (scrollerElt === null) return
    geometryRef.current = measureGeometry(scrollerElt)
    setIsMeasured(true)
    readScroll()
  }, [readScroll])

  const scrollToSlot = useCallback((pos: number, smooth = true): void => {
    const scrollerElt = scrollerRef.current
    const scrollPosition = geometryRef.current.scrollPositions[pos]
    if (scrollerElt === null || scrollPosition === undefined) return
    scrollerElt.scrollTo({ left: scrollPosition, behavior: smooth ? 'smooth' : 'instant' })
  }, [])

  // User actions handlers
  const handlePrevClick = (): void => {
    onPrevClicked?.(activeIndex)
    if (isControlled) return
    scrollToSlot(activeIndex - 1)
  }
  const handleNextClick = (): void => {
    onNextClicked?.(activeIndex)
    if (isControlled) return
    scrollToSlot(activeIndex + 1)
  }
  const handlePaginationClick = (pos: number): void => {
    onPaginationClicked?.({ activePos: activeIndex, targetPos: pos })
    if (isControlled) return
    scrollToSlot(pos)
  }

  // Fx. dep. childrenCount - Measure, and measure again whenever a box changes size.
  // Watching the slots and not only the scroller is what makes a late image or font
  // land correctly, where a delay after mount could only guess.
  useEffect(() => {
    const scrollerElt = scrollerRef.current
    if (scrollerElt === null) return
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(scrollerElt)
    Array.from(scrollerElt.children).forEach(child => observer.observe(child))
    return (): void => observer.disconnect()
  }, [childrenCount, measure])

  // Fx. no dep. - One read per frame while scrolling, and it touches no element.
  useEffect(() => {
    const scrollerElt = scrollerRef.current
    if (scrollerElt === null) return
    let animationFrame: number | null = null
    const onScroll = (): void => {
      if (animationFrame !== null) return
      animationFrame = requestAnimationFrame(() => {
        animationFrame = null
        readScroll()
      })
    }
    scrollerElt.addEventListener('scroll', onScroll, { passive: true })
    return (): void => {
      scrollerElt.removeEventListener('scroll', onScroll)
      if (animationFrame !== null) cancelAnimationFrame(animationFrame)
    }
  }, [readScroll])

  // Fx. no dep. - Place the gallery where it starts, once the table exists.
  useEffect(() => {
    const toActivate = active ?? defaultActive
    if (toActivate === undefined) return
    scrollToSlot(toActivate, false)
  }, [])

  // Fx. dep. active - Follow the controlled index.
  useEffect(() => {
    if (active === undefined) return
    scrollToSlot(active)
  }, [active])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(
    c(null, {
      'controlled': isControlled,
      'no-snap': noSnap === true,
      'measured': isMeasured,
      'at-first': activeIndex === 0,
      'at-last': activeIndex === childrenCount - 1,
      'can-go-left': canGoLeft,
      'can-go-right': canGoRight
    }),
    className
  )
  const scrollerClss = c('scroller')
  const actionsClss = c('actions')
  const prevBtnClss = c('prev')
  const nextBtnClss = c('next')
  const paginationClss = c('pagination')
  const dataAttributes: Record<string, string> = { 'data-active': `${activeIndex}` }
  const actualOffsetLeft = resolveOffset(offsetLeft, offset)
  const actualOffsetRight = resolveOffset(offsetRight, offset)
  return <div
    className={rootClss}
    {...dataAttributes}>

    {/* Scroller */}
    <div className={scrollerClss} ref={scrollerRef}>
      {Children.map(children, (child, pos) => {
        const slotClss = c('slot', { active: pos === activeIndex })
        const style: Record<string, string | undefined> = {
          'margin-left': pos === 0
            ? actualOffsetLeft
            : undefined,
          'margin-right': pos === childrenCount - 1
            ? actualOffsetRight
            : undefined
        }
        return <div
          key={pos}
          className={slotClss}
          style={{ ...style }}
          data-slot={pos}>
          {child}
        </div>
      })}
    </div>

    {/* Actions */}
    <div className={actionsClss}>
      <div
        className={prevBtnClss}
        onClick={handlePrevClick}>
        {prevButtonContent ?? 'prev'}
      </div>
      <div
        className={nextBtnClss}
        onClick={handleNextClick}>
        {nextButtonContent ?? 'next'}
      </div>
    </div>

    {/* Pagination */}
    <div className={paginationClss}>
      {Children.map(children, (_, pos) => {
        const pageClss = c('page', { active: pos === activeIndex })
        return <div
          className={pageClss}
          data-page={pos}
          onClick={() => handlePaginationClick(pos)}>
          {typeof paginationContent === 'function'
            ? paginationContent(pos)
            : paginationContent ?? pos}
        </div>
      })}
    </div>
  </div>
}
