import {
  type PropsWithChildren,
  type FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { randomHash } from '../../agnostic/random/uuid/index.js'
import {
  IntersectionObserverComponent,
  type Props as IOCompProps
} from '../IntersectionObserver/index.js'
import {
  Paginator,
  type Props as PaginatorProps
} from '../Paginator/index.js'
import {
  ResizeObserverComponent,
  type Props as RSOCompProps
} from '../ResizeObserver/index.js'
import {
  subscribe,
  unsubscribe
} from '../ScrollListener/utils.js'
import type { WithClassName } from '../utils/types.js'
import {
  mergeClassNames,
  useChangeDispatch
} from '../utils/index.js'
import { scrllgngn as publicClassName } from '../public-classnames.js'
import {
  blockDisplayZones,
  consolidateStickyBlocks,
  contextsAreEqual,
  lazyLoadedBlocks,
  measurePages,
  sameDiscretePart,
  scrollBlocksOf,
  scrollKey,
  stickyKey,
  toPaginatorThresholdPercent,
  toScreenCssProps,
  toThresholdY,
  toTrackedBlockContext,
  toTrackedBlockCssProps,
  toTrackedBlockDataAttributes,
  toViewportOffsetCssProps,
  toVisibleZoneRect,
  toVisibleZoneRootMargin,
  visibleZonePollInterval,
  visibleZonesAreEqual,
  type ConsolidatedStickyBlock,
  type ScreenRect,
  type TrackedBlock,
  type TrackedBlockContext,
  type ViewportOffset,
  type VisibleZoneRect
} from './utils.js'
import cssModule from './styles.module.css'

/**
 * Common properties shared by all block types.
 *
 * @property id - Optional stable identifier for the block. Used to consolidate
 * blocks with the same id across multiple pages into a single sticky block
 * displayed across those pages.
 * @property onScrolled - Called with this block's {@link TrackedBlockContext} on
 * every frame the scroll moved it, while it is displayed. Declaring it is what
 * turns tracking on for the block — nothing is measured for a block without it.
 * @property children - Content rendered inside the block.
 */
export type PropsCommonBlock = PropsWithChildren<{
  id?: string
  // [WIP] `onScrolled` doubles as the tracking switch, so a block that only wants
  // the custom properties and `data-` attributes, without a handler, has no way to
  // ask for them. Reopen a boolean here if that case ever shows up.
  onScrolled?: (context: TrackedBlockContext) => void
}>

/**
 * A block that scrolls with the page content.
 *
 * @property depth - When set to `'scroll'` or omitted, the block is rendered
 * inline in the scrolling content layer.
 */
export type PropsScrollBlock = PropsCommonBlock & {
  depth?: 'scroll'
}

/**
 * A block that sticks to the viewport, rendered outside the scroll flow.
 *
 * @property depth - `'back'` renders the block behind the scrolling content;
 * `'front'` renders it in front.
 * @property zIndex - Optional explicit z-index. Sticky blocks are otherwise
 * stacked in the order they appear across pages (ascending).
 */
export type PropsStickyBlock = PropsCommonBlock & {
  depth: 'back' | 'front'
  zIndex?: number
}

/**
 * Union of all block variants accepted by a {@link PropsPage}.
 *
 * @see {@link PropsScrollBlock}
 * @see {@link PropsStickyBlock}
 */
export type PropsBlock = PropsScrollBlock | PropsStickyBlock

/**
 * Describes a single page in the scrollytelling sequence.
 *
 * @property id - Optional identifier for the page.
 * @property blocks - Ordered list of blocks belonging to this page.
 * Scroll blocks are rendered inline; sticky blocks (`'back'` / `'front'`) are
 * lifted into their respective layer and consolidated with same-id blocks from
 * other pages.
 */
export type PropsPage = {
  id?: string
  blocks?: PropsBlock[]
}

/**
 * Props for the {@link Scrllgngn} component.
 *
 * @property pages - Ordered list of pages that compose the scrollytelling
 * sequence. Each page may contain any mix of {@link PropsBlock} variants.
 * @property thresholdOffsetPercent - Where the threshold line sits, as a
 * percentage of the **visible zone** — not of the viewport, so a threshold stays
 * put under a sticky nav. It decides which page counts as current, and anchors
 * every progression handed to a tracked block.
 * @property viewportOffsetTop - How much of the top of the screen is covered by
 * something else — a sticky nav, say — and should be kept out of the visible zone.
 * A number means pixels; a string is any CSS length, `var()` and `clamp()`
 * included, so the value can follow a breakpoint without JavaScript.
 * @property viewportOffsetRight - Same, on the right edge.
 * @property viewportOffsetBottom - Same, on the bottom edge.
 * @property viewportOffsetLeft - Same, on the left edge.
 * @property stickyBlocksLazyLoadDistance - Number of pages around the current
 * page within which sticky blocks are mounted. Blocks outside this window are
 * unmounted to save resources. Defaults to `2`.
 * @property forceStickBlocks - Controls which out-of-range sticky blocks are
 * forced into a stuck state regardless of the current page:
 * - `'before'` — forces blocks from pages before the current one.
 * - `'after'`  — forces blocks from pages after the current one.
 * - `'both'`   — forces blocks on both sides.
 * - `'none'`   — no forcing (default behaviour).
 * @property onPageChanged - Called once the current page has changed, never on
 * mount. Receives `currentPagePos`, the zero-based index of the new current page,
 * and `pageData`, its definition when there is one.
 * @property onContentVisibilityChanged - Called after the scrolling content
 * area entered or left the viewport, with the new value. Never on mount.
 * @property className - Optional additional class name(s) applied to the root
 * element.
 */
export type Props = WithClassName<{
  pages?: PropsPage[]
  thresholdOffsetPercent?: number
  viewportOffsetTop?: ViewportOffset
  viewportOffsetRight?: ViewportOffset
  viewportOffsetBottom?: ViewportOffset
  viewportOffsetLeft?: ViewportOffset
  stickyBlocksLazyLoadDistance?: number
  forceStickBlocks?: 'before' | 'after' | 'both' | 'none'
  onPageChanged?: (payload: { currentPagePos: number, pageData?: PropsPage }) => void
  onContentVisibilityChanged?: (isVisible: boolean) => void
}>

/**
 * Scrollytelling engine component. Orchestrates layered sticky blocks (`back`
 * and `front`) over a paginated scrolling content area, with lazy loading,
 * viewport bound detection, and dimension tracking.
 *
 * ### Root element modifiers
 * The root `<div>` receives the public class name defined by `scrllgngn` and
 * the following BEM-style modifier classes when active:
 * - `--top-visible` — the top boundary sentinel is intersecting the viewport.
 * - `--content-visible` — the scrolling content area is intersecting the viewport.
 * - `--bottom-visible` — the bottom boundary sentinel is intersecting the viewport.
 * - `--force-stick-blocks-before` — when `forceStickBlocks === 'before'`.
 * - `--force-stick-blocks-after` — when `forceStickBlocks === 'after'`.
 * - `--force-stick-blocks-both` — when `forceStickBlocks === 'both'`.
 *
 * ### Data attributes
 * Both are updated on every page change reported by the internal
 * {@link Paginator}.
 * - `data-current-page-pos` — zero-based index of the page currently in view.
 * - `data-current-page-id` — that page's {@link PropsPage.id}. Absent while the
 * current page carries no id, since the id is optional.
 *
 * ### CSS custom properties
 * Exposed on the root element and updated on resize via the internal
 * {@link ResizeObserverComponent}:
 * - `--lm-scrllgngn-screen-left` / `--lm-scrllgngn-screen-left-raw` — left edge
 * of the bounding rect.
 * - `--lm-scrllgngn-screen-right` / `--lm-scrllgngn-screen-right-raw` — right edge.
 * - `--lm-scrllgngn-screen-width` / `--lm-scrllgngn-screen-width-raw` — total width.
 * - `--lm-scrllgngn-screen-height` / `--lm-scrllgngn-screen-height-raw` — total height.
 *
 * The same four measurements are also exposed as `--PRIVATE-left`, `-right`,
 * `-width` and `-height` for the component's own stylesheet. They are internal:
 * do not read or override them.
 *
 * ### Visible zone
 * Set any of the `viewportOffset*` props and the component stops treating the whole
 * screen as available: the fixed layers are inset by those edges, the top / content
 * / bottom detection observes the reduced box, and `thresholdOffsetPercent` reads as
 * a percentage of it. With none of them set, everything behaves exactly as before.
 *
 * The four edges are echoed as `--lm-scrllgngn-viewport-offset-top`, `-right`,
 * `-bottom` and `-left`, carrying the length as authored — pixels for a number, the
 * string untouched otherwise.
 *
 * ### Sticky block elements
 * Each lazy-loaded sticky block receives:
 * - `--active` modifier when the block's page range includes the current page.
 * - `--lazy-loaded` modifier when the block is mounted but not on the current page.
 * - An inline `z-index` derived from the block's position in the sorted stack
 * (overridden by {@link PropsStickyBlock.zIndex} if provided).
 *
 * ### Scroll block elements
 * Each scroll block sits in its own wrapper, whatever it does — a block that isn't
 * tracked still gets one, so the DOM keeps the same shape either way.
 *
 * ### Tracked block elements
 * A block declaring {@link PropsCommonBlock.onScrolled} also carries its
 * {@link TrackedBlockContext} on its wrapper, for scrollytelling driven in CSS
 * alone. Written straight to the element on the frames they change, so they never
 * re-render the sequence.
 *
 * Progressions, as unitless `0`–`1` ratios:
 * - `--lm-scrllgngn-block-current-page-progression-ratio`
 * - `--lm-scrllgngn-block-display-zone-progression-ratio`
 * - `--lm-scrllgngn-block-contiguous-display-zone-progression-ratio`
 *
 * Position, which only moves with the page:
 * - `data-current-page`
 * - `data-display-zone` — comma-separated page positions.
 * - `data-index-of-current-page-in-display-zone`
 * - `data-contiguous-display-zone`
 * - `data-index-of-current-page-in-contiguous-display-zone`
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A div wrapping the full scrollytelling structure: visible zone probe,
 * top-bound sentinel, back-blocks layer, front-blocks layer, paginated scrolling
 * content, and bottom-bound sentinel.
 *
 * @remarks
 * A `viewportOffset*` given as a CSS length is resolved by CSS, not parsed: a hidden
 * probe is inset by the four of them and observed, so `var()`, `clamp()` and
 * breakpoint-dependent values all work, and any restyling that changes them is
 * picked up as a resize. A change that moves the zone without altering its size —
 * a top offset traded for an equal bottom one — is caught instead by a re-read every
 * 100ms, which runs only while the component is on screen and only reaches state
 * when the zone really moved.
 *
 * Tracking costs nothing until a block asks for it: with no `onScrolled` anywhere,
 * the component never joins the shared scroll listener. Once it does, each frame
 * measures only the pages the displayed tracked blocks span, not the whole sequence.
 */
export const Scrllgngn: FunctionComponent<Props> = ({
  pages,
  thresholdOffsetPercent,
  viewportOffsetTop,
  viewportOffsetRight,
  viewportOffsetBottom,
  viewportOffsetLeft,
  stickyBlocksLazyLoadDistance = 2,
  forceStickBlocks,
  onPageChanged,
  onContentVisibilityChanged,
  className
}) => {
  // State
  const [topVisible, setTopVis] = useState(false)
  const [contentVisible, setCntVis] = useState(false)
  const [bottomVisible, setBtmVis] = useState(false)
  const [currentPagePos, setCurrentPagePos] = useState<number>(0)
  const [stickyBlocks, setStickyBlocks] = useState(new Map<string, ConsolidatedStickyBlock>())
  const [partialBoundingRect, setPartialBoundingRect] = useState<ScreenRect>()
  const [visibleZone, setVisibleZone] = useState<VisibleZoneRect>()

  // Scroll tracking. Everything the per-frame pass reads lives in a ref: it is
  // registered once with the shared scroll listener, and writes straight to the DOM
  // rather than through state, which would re-render the whole sequence per frame.
  const rootRef = useRef<HTMLDivElement>(null)
  const subscriptionIdRef = useRef(randomHash(8))
  const pageElementsRef = useRef<HTMLElement[]>([])
  const trackedBlocksRef = useRef(new Map<string, TrackedBlock>())
  const trackedWrappersRef = useRef(new Map<string, HTMLElement>())
  const lastContextsRef = useRef(new Map<string, TrackedBlockContext>())
  const currentPagePosRef = useRef(currentPagePos)
  const visibleZoneRef = useRef(visibleZone)
  const probeRef = useRef<Element | null>(null)

  // Sticky blocks calculations
  useEffect(() => {
    setStickyBlocks(consolidateStickyBlocks(pages))
  }, [pages])

  const lazyLoadedBackBlocks = lazyLoadedBlocks(stickyBlocks, 'back', currentPagePos, stickyBlocksLazyLoadDistance)
  const lazyLoadedFrontBlocks = lazyLoadedBlocks(stickyBlocks, 'front', currentPagePos, stickyBlocksLazyLoadDistance)

  // Tracked blocks, keyed the same way their wrappers are
  const displayZones = blockDisplayZones(pages)
  const trackedBlocks = new Map<string, TrackedBlock>()
  for (const [blockId, block] of stickyBlocks) {
    if (block.onScrolled === undefined) continue
    trackedBlocks.set(stickyKey(blockId), {
      displayZone: block.id === undefined
        ? block.displayOnPages
        : displayZones.get(block.id) ?? block.displayOnPages,
      onScrolled: block.onScrolled
    })
  }
  pages?.forEach((page, pagePos) => {
    scrollBlocksOf(page).forEach((block, blockPos) => {
      if (block.onScrolled === undefined) return
      trackedBlocks.set(scrollKey(pagePos, blockPos), {
        displayZone: block.id === undefined
          ? [pagePos]
          : displayZones.get(block.id) ?? [pagePos],
        onScrolled: block.onScrolled
      })
    })
  })
  const hasTrackedBlocks = trackedBlocks.size > 0

  // Fx. no dep. - Keep what the per-frame pass reads in sync with the last render
  useEffect(() => {
    trackedBlocksRef.current = trackedBlocks
    currentPagePosRef.current = currentPagePos
    visibleZoneRef.current = visibleZone
  })

  // Re-reads the probe, and only disturbs the render if the zone actually moved.
  const readVisibleZone = useCallback((): void => {
    const probe = probeRef.current
    if (probe === null) return
    const zone = toVisibleZoneRect(probe.getBoundingClientRect())
    if (visibleZonesAreEqual(zone, visibleZoneRef.current)) return
    setVisibleZone(zone)
  }, [])

  // The per-frame pass: measure only the pages the displayed tracked blocks span,
  // then hand each block its context — once, and only when something moved.
  const handleScrolled = useCallback((): void => {
    const trackedBlocks = trackedBlocksRef.current
    const lastContexts = lastContextsRef.current
    const currentPage = currentPagePosRef.current
    const pending: Array<[string, TrackedBlock, number]> = []
    for (const [key, block] of trackedBlocks) {
      if (block.displayZone.includes(currentPage)) pending.push([key, block, currentPage])
    }
    // A block that just left the current page gets one last pass, on the page it was
    // on: its progressions are clamped, so it lands on the edge it crossed instead of
    // freezing part-way.
    for (const [key, lastContext] of lastContexts) {
      const block = trackedBlocks.get(key)
      if (block === undefined) { lastContexts.delete(key); continue }
      if (block.displayZone.includes(currentPage)) continue
      pending.push([key, block, lastContext.currentPage])
    }
    if (pending.length === 0) return
    const pagesToMeasure = new Set<number>()
    for (const [, block, page] of pending) {
      pagesToMeasure.add(page)
      for (const pagePos of block.displayZone) pagesToMeasure.add(pagePos)
    }
    const thresholdY = toThresholdY(visibleZoneRef.current, thresholdOffsetPercent)
    const metrics = measurePages(pageElementsRef.current, pagesToMeasure, thresholdY)
    for (const [key, block, page] of pending) {
      const context = toTrackedBlockContext(block.displayZone, page, metrics)
      const lastContext = lastContexts.get(key)
      if (contextsAreEqual(context, lastContext)) continue
      const wrapper = trackedWrappersRef.current.get(key)
      if (wrapper !== undefined) {
        for (const [name, value] of Object.entries(toTrackedBlockCssProps(context))) {
          wrapper.style.setProperty(name, value)
        }
        // Discrete values only move with the page, so they don't need a write per frame
        if (!sameDiscretePart(context, lastContext)) {
          for (const [name, value] of Object.entries(toTrackedBlockDataAttributes(context))) {
            wrapper.setAttribute(name, value)
          }
        }
      }
      block.onScrolled(context)
      if (page === currentPage) lastContexts.set(key, context)
      else lastContexts.delete(key)
    }
  }, [thresholdOffsetPercent])

  // Fx. dep. hasTrackedBlocks, handleScrolled - Join the shared scroll listener, and
  // only then: no tracked block, no measurement pass at all.
  useEffect(() => {
    if (!hasTrackedBlocks) return
    const subscriptionId = subscriptionIdRef.current
    subscribe(subscriptionId, {
      rootRef,
      onScrollStateChange: handleScrolled
    })
    return () => unsubscribe(subscriptionId)
  }, [hasTrackedBlocks, handleScrolled])

  // Fx. dep. isOnScreen, readVisibleZone - Catch what the probe's ResizeObserver
  // cannot: a restyle that moves the visible zone without resizing it, say a top
  // offset traded for an equal bottom one. Only runs while the component is on
  // screen, and only touches state when the zone actually moved.
  const isOnScreen = topVisible || contentVisible || bottomVisible
  useEffect(() => {
    if (!isOnScreen) return
    const interval = window.setInterval(readVisibleZone, visibleZonePollInterval)
    return () => window.clearInterval(interval)
  }, [isOnScreen, readVisibleZone])

  // Handlers
  useChangeDispatch(currentPagePos, pagePos => onPageChanged?.({
    currentPagePos: pagePos,
    pageData: pages?.[pagePos]
  }))
  useChangeDispatch(contentVisible, onContentVisibilityChanged)
  const handleTopBoundDetect: IOCompProps['onIntersected'] = e => setTopVis(e.ioEntry?.isIntersecting ?? false)
  const handleCntDetect: IOCompProps['onIntersected'] = e => setCntVis(e.ioEntry?.isIntersecting ?? false)
  const handleBtmBoundDetect: IOCompProps['onIntersected'] = e => setBtmVis(e.ioEntry?.isIntersecting ?? false)
  const handlePagesChanged: NonNullable<PaginatorProps['onPagesChanged']> = statePages => {
    const curPagePos = statePages.findIndex(page => page.position === 'curr')
    if (curPagePos === -1) return
    setCurrentPagePos(curPagePos)
  }
  const handlePageElementsChanged: NonNullable<PaginatorProps['onPageElementsChanged']> = elements => {
    pageElementsRef.current = elements
  }
  // Registers a block wrapper under the key its context is tracked by. Blocks come
  // and go with lazy loading, so the map is kept clean on unmount rather than grown.
  const registerWrapper = (key: string) => (element: HTMLElement | null): void => {
    if (element === null) trackedWrappersRef.current.delete(key)
    else trackedWrappersRef.current.set(key, element)
  }
  const handleProbeResized: RSOCompProps['onResized'] = ({ entry, boundingClientRect }) => {
    probeRef.current = entry.target
    setVisibleZone(toVisibleZoneRect(boundingClientRect))
  }
  const handleResize: RSOCompProps['onResized'] = ({ boundingClientRect }) => {
    if (partialBoundingRect === undefined
      || boundingClientRect.left !== partialBoundingRect.left
      || boundingClientRect.right !== partialBoundingRect.right
      || boundingClientRect.height !== partialBoundingRect.height
      || boundingClientRect.width !== partialBoundingRect.width
    ) setPartialBoundingRect(boundingClientRect)
  }

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(
    c(null, {
      'top-visible': topVisible,
      'content-visible': contentVisible,
      'bottom-visible': bottomVisible,
      'force-stick-blocks-before': forceStickBlocks === 'before',
      'force-stick-blocks-after': forceStickBlocks === 'after',
      'force-stick-blocks-both': forceStickBlocks === 'both'
    }),
    className
  )
  const customCssProps = {
    ...toScreenCssProps(partialBoundingRect, visibleZone),
    ...toViewportOffsetCssProps({
      top: viewportOffsetTop,
      right: viewportOffsetRight,
      bottom: viewportOffsetBottom,
      left: viewportOffsetLeft
    })
  }
  const visibleZoneRootMargin = toVisibleZoneRootMargin(visibleZone)
  return <div
    ref={rootRef}
    className={rootClss}
    data-current-page-pos={currentPagePos}
    data-current-page-id={pages?.[currentPagePos]?.id}
    style={{ ...customCssProps }}>
    {/* Visible zone probe. Fixed and inset by the four offsets, so its own box is
    the zone — CSS resolves the lengths, the observer reports them back in pixels,
    and any restyling that changes them shows up as a resize. */}
    <ResizeObserverComponent
      className={c('viewport-probe')}
      onResized={handleProbeResized} />

    <ResizeObserverComponent onResized={handleResize}>
      {/* Top bound detection */}
      <div className={c('top-bound')}>
        <IntersectionObserverComponent
          rootMargin={visibleZoneRootMargin}
          onIntersected={handleTopBoundDetect} />
      </div>

      {/* Back blocks */}
      <div className={c('back-blocks')}>
        {lazyLoadedBackBlocks.map(([blockId, block], blockPos) => {
          const isActive = block.displayOnPages.includes(currentPagePos)
          const blockClss = c('back-block', {
            active: isActive,
            'lazy-loaded': !isActive
          })
          return <div
            key={blockId}
            ref={registerWrapper(stickyKey(blockId))}
            className={blockClss}
            style={{ zIndex: blockPos }}>
            {block.children}
          </div>
        })}
      </div>

      {/* Front blocks */}
      <div className={c('front-blocks')}>
        {lazyLoadedFrontBlocks.map(([blockId, block], blockPos) => {
          const isActive = block.displayOnPages.includes(currentPagePos)
          const blockClss = c('front-block', {
            active: isActive,
            'lazy-loaded': !isActive
          })
          return <div
            key={blockId}
            ref={registerWrapper(stickyKey(blockId))}
            className={blockClss}
            style={{ zIndex: blockPos }}>
            {block.children}
          </div>
        })}
      </div>

      {/* Scrolling content */}
      <div className={c('scrolling-content')}>
        <IntersectionObserverComponent
          rootMargin={visibleZoneRootMargin}
          onIntersected={handleCntDetect}>
          <Paginator
            thresholdOffsetPercent={toPaginatorThresholdPercent(visibleZone, thresholdOffsetPercent)}
            onPagesChanged={handlePagesChanged}
            onPageElementsChanged={handlePageElementsChanged}>
            {pages?.map((page, pagePos) => {
              return <>{scrollBlocksOf(page).map((block, blockPos) => <div
                key={blockPos}
                ref={registerWrapper(scrollKey(pagePos, blockPos))}
                className={c('scroll-block')}>
                {block.children}
              </div>)}</>
            })}
          </Paginator>
        </IntersectionObserverComponent>
      </div>

      {/* Bottom bound detection */}
      <div className={c('bottom-bound')}>
        <IntersectionObserverComponent
          rootMargin={visibleZoneRootMargin}
          onIntersected={handleBtmBoundDetect} />
      </div>
    </ResizeObserverComponent>
  </div>
}
