import {
  type FunctionComponent,
  type PointerEvent,
  type ReactNode,
  type WheelEvent,
  Children,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { useStateChangeDispatch } from '../../agnostic/@react/effects/use-state-change-dispatch/index.js'
import type {
  ChildrenProps,
  ClassNameProps
} from '../../agnostic/@react/types/index.js'
import { clss } from '../../agnostic/css/clss/index.js'
import { mergeClassNames } from '../../agnostic/css/merge-class-names/index.js'
import {
  compIdAttribute,
  useCompId
} from '../utils/comp-id/index.js'
import type { CompIdProps } from '../utils/comp-id/types.js'
import {
  useCommandSurrender,
  useCommands
} from '../utils/commands/index.js'
import { useVisibilityTriggers } from '../utils/visibility/index.js'
import type { VisibilityProps } from '../utils/visibility/types.js'
import { gallery as publicClassName } from '../public-classnames.js'
import {
  GALLERY_ACTION_VERB_ARGUMENTS,
  GALLERY_ACTION_VERB_DOMAINS,
  type GalleryActionDomain,
  type GalleryActionVerb
} from './types.js'
import {
  EMPTY_GEOMETRY,
  measureGeometry,
  readActiveIndex,
  readReach,
  type Geometry
} from './utils.js'
import cssModule from './styles.module.css'

// Enough to clear the sideways jitter at the start of a vertical swipe, short of a
// deliberate nudge: under it, a horizontal movement is not read as an intent.
const HORIZONTAL_INTENT_PX = 8

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
 * @property onCanGoPrevChanged - Fires after the ability to go back a slot changed.
 * Never on mount.
 * @property onCanGoNextChanged - Same, forward.
 * @property className - Added to the root element.
 * @property children - One slot per child.
 */
export type Props = {
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
  onCanGoPrevChanged?: (canGoPrev: boolean) => void
  onCanGoNextChanged?: (canGoNext: boolean) => void
}
  & ChildrenProps
  & ClassNameProps
  & CompIdProps
  & VisibilityProps

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
 * `can-go-prev`, `can-go-next`, `visible`.
 *
 * ### Commands
 * - `jump-to:<n>`, `jump-start`, `jump-end`, `jump-by:<n>` — a whole number, negative
 *   counting back from the end, so `jump-to:-1` is the last slot and `jump-by:1` is what
 *   the next button does. A position outside the strip lands on the nearest slot, and an
 *   absolute verb says so in the console where `jump-by` stays quiet.
 *
 * **A verb never contradicts a prop**: all four are inert while `active` arrived as one,
 * which is also when hand scrolling is disabled. **And a command yields to the reader** —
 * a click on either control or on a pagination item hands the `position` domain over for
 * the rest of the mount, and so does the reader's own hand on the strip. `:force` opts
 * out.
 *
 * Telling that hand from a vertical scroll is the one subtlety: a programmatic scroll
 * fires the same `scroll` events a reader does, so neither is read. What counts is a
 * **horizontal intent** — a wheel or a drag whose sideways movement dominates and clears
 * {@link HORIZONTAL_INTENT_PX} — or **a slot change this component did not ask for**,
 * which is what catches arrow keys and a browser scrolling a focused link into view.
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
  compId: givenCompId,
  whenVisible,
  whenHidden,
  onVisibilityChanged,
  visibilityThreshold,
  visibilityRoot,
  visibilityRootMargin,
  visibilityOnAfterMs,
  visibilityOffAfterMs,
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
  onCanGoPrevChanged,
  onCanGoNextChanged,
  children,
  className
}) => {
  const compId = useCompId(givenCompId)

  // State & refs
  const scrollerRef = useRef<HTMLDivElement>(null)
  const geometryRef = useRef<Geometry>(EMPTY_GEOMETRY)
  const [scrolledIndex, setScrolledIndex] = useState(0)
  const [isMeasured, setIsMeasured] = useState(false)
  const [canGoPrev, setCanGoPrev] = useState(false)
  const [canGoNext, setCanGoNext] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  // The slot a programmatic scroll is on its way to. Every index crossed before it
  // belongs to that scroll; an index change with none pending is the reader's.
  const pendingTargetRef = useRef<number | null>(null)
  const lastIndexRef = useRef(0)
  // Where a pointer went down on the strip, until its movement says what it meant.
  const dragOriginRef = useRef<{ x: number, y: number } | null>(null)
  const childrenCount = Children.count(children)
  const isControlled = active !== undefined
  // Controlled, the prop is the answer: the class names and `data-active` say where the
  // gallery was told to be, rather than where a smooth scroll has got to so far.
  const activeIndex = active ?? scrolledIndex

  // State dispatch
  useStateChangeDispatch(activeIndex, onActiveSlotChanged)
  useStateChangeDispatch(canGoPrev, onCanGoPrevChanged)
  useStateChangeDispatch(canGoNext, onCanGoNextChanged)

  const isVisible = useVisibilityTriggers(compId, rootRef, {
    whenVisible,
    whenHidden,
    onVisibilityChanged,
    visibilityThreshold,
    visibilityRoot,
    visibilityRootMargin,
    visibilityOnAfterMs,
    visibilityOffAfterMs
  })

  // Annotated with this component's vocabulary: the layer takes any name, so the
  // annotation is what keeps a misspelled domain from compiling.
  const surrender: (domain: GalleryActionDomain) => void = useCommandSurrender(
    compId,
    GALLERY_ACTION_VERB_DOMAINS
  )

  const readScroll = useCallback((): void => {
    const scrollerElt = scrollerRef.current
    if (scrollerElt === null) return
    const { scrollLeft } = scrollerElt
    const geometry = geometryRef.current
    const index = readActiveIndex(geometry, scrollLeft)
    if (index !== lastIndexRef.current) {
      lastIndexRef.current = index
      const pendingTarget = pendingTargetRef.current
      if (pendingTarget === null) surrender('position')
      else if (pendingTarget === index) pendingTargetRef.current = null
    }
    setScrolledIndex(index)
    const { canGoPrev, canGoNext } = readReach(geometry, scrollLeft)
    setCanGoPrev(canGoPrev)
    setCanGoNext(canGoNext)
  }, [surrender])

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
    pendingTargetRef.current = pos
    scrollerElt.scrollTo({ left: scrollPosition, behavior: smooth ? 'smooth' : 'instant' })
  }, [])

  // Commands
  const readArgument = (
    verb: keyof typeof GALLERY_ACTION_VERB_ARGUMENTS,
    args: string[]
  ): string | null => {
    const arg = args[0]
    if (arg !== undefined && GALLERY_ACTION_VERB_ARGUMENTS[verb](arg)) return arg
    // eslint-disable-next-line no-console
    console.warn(`"${verb}" was sent an argument it cannot read: "${arg ?? ''}"`)
    return null
  }

  // A position outside the strip lands on the nearest slot. An absolute verb says so —
  // `jump-to:7` on three slots is a written mistake — where `jump-by` stays quiet, a
  // next at the last slot being an ordinary end and not a typo.
  const jumpToSlot = (targetSlot: number, verb: GalleryActionVerb): void => {
    if (isControlled) return
    const resolved = targetSlot < 0 ? childrenCount + targetSlot : targetSlot
    const clamped = Math.min(Math.max(resolved, 0), childrenCount - 1)
    // eslint-disable-next-line no-console
    if (clamped !== resolved && verb !== 'jump-by') console.warn(`"${verb}" was sent a slot this gallery has not got: ${targetSlot}`)
    scrollToSlot(clamped)
  }

  useCommands(compId, {
    'jump-to': ({ args }) => {
      const arg = readArgument('jump-to', args)
      if (arg === null) return
      jumpToSlot(Number(arg), 'jump-to')
    },
    'jump-start': () => { jumpToSlot(0, 'jump-start') },
    'jump-end': () => { jumpToSlot(childrenCount - 1, 'jump-end') },
    'jump-by': ({ args }) => {
      const arg = readArgument('jump-by', args)
      if (arg === null) return
      jumpToSlot(activeIndex + Number(arg), 'jump-by')
    }
  })

  // User actions handlers
  const handlePrevClick = (): void => {
    onPrevClicked?.(activeIndex)
    surrender('position')
    if (isControlled) return
    scrollToSlot(activeIndex - 1)
  }
  const handleNextClick = (): void => {
    onNextClicked?.(activeIndex)
    surrender('position')
    if (isControlled) return
    scrollToSlot(activeIndex + 1)
  }
  const handlePaginationClick = (pos: number): void => {
    onPaginationClicked?.({ activePos: activeIndex, targetPos: pos })
    surrender('position')
    if (isControlled) return
    scrollToSlot(pos)
  }

  // A horizontal intent, and not a scroll: a programmatic scroll fires the same events
  // the reader does. Dominance is what tells a swipe along the strip from the jitter of
  // one down the article.
  const takeOverPosition = (): void => {
    pendingTargetRef.current = null
    surrender('position')
  }
  const handleScrollerWheel = (event: WheelEvent<HTMLDivElement>): void => {
    const { deltaX, deltaY } = event
    if (Math.abs(deltaX) <= Math.abs(deltaY)) return
    if (Math.abs(deltaX) < HORIZONTAL_INTENT_PX) return
    takeOverPosition()
  }
  const handleScrollerPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    dragOriginRef.current = { x: event.clientX, y: event.clientY }
  }
  const handleScrollerPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    const origin = dragOriginRef.current
    if (origin === null) return
    const movedX = event.clientX - origin.x
    const movedY = event.clientY - origin.y
    if (Math.abs(movedX) <= Math.abs(movedY)) return
    if (Math.abs(movedX) < HORIZONTAL_INTENT_PX) return
    dragOriginRef.current = null
    takeOverPosition()
  }
  const handleScrollerPointerUp = (): void => { dragOriginRef.current = null }

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
    const handleScroll = (): void => {
      if (animationFrame !== null) return
      animationFrame = requestAnimationFrame(() => {
        animationFrame = null
        readScroll()
      })
    }
    scrollerElt.addEventListener('scroll', handleScroll, { passive: true })
    return (): void => {
      scrollerElt.removeEventListener('scroll', handleScroll)
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
      'can-go-prev': canGoPrev,
      'can-go-next': canGoNext,
      'visible': isVisible === true
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
    {...compIdAttribute(compId)}
    ref={rootRef}
    className={rootClss}
    {...dataAttributes}>

    {/* Scroller */}
    <div
      className={scrollerClss}
      ref={scrollerRef}
      onWheel={handleScrollerWheel}
      onPointerDown={handleScrollerPointerDown}
      onPointerMove={handleScrollerPointerMove}
      onPointerUp={handleScrollerPointerUp}
      onPointerCancel={handleScrollerPointerUp}>
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
