import {
  type PropsWithChildren,
  type FunctionComponent,
  useState,
  useEffect
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
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
import type { WithClassName } from '../utils/types.js'
import {
  mergeClassNames,
  useChangeDispatch
} from '../utils/index.js'
import { scrllgngn as publicClassName } from '../public-classnames.js'
import {
  consolidateStickyBlocks,
  lazyLoadedBlocks,
  toScreenCssProps,
  type ConsolidatedStickyBlock,
  type ScreenRect
} from './utils.js'
import cssModule from './styles.module.css'

/**
 * Common properties shared by all block types.
 *
 * @property id - Optional stable identifier for the block. Used to consolidate
 * blocks with the same id across multiple pages into a single sticky block
 * displayed across those pages.
 * @property trackScroll - Whether scroll tracking is enabled for this block.
 * @property children - Content rendered inside the block.
 */
export type PropsCommonBlock = PropsWithChildren<{
  id?: string
  trackScroll?: boolean
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
 * @property thresholdOffsetPercent - Forwarded to the internal
 * {@link Paginator}. Defines the viewport offset percentage used to determine
 * which page is considered current.
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
 * mount. Receives the zero-based index of the new current page and the
 * corresponding page definition, if available.
 * @property className - Optional additional class name(s) applied to the root
 * element.
 */
export type Props = WithClassName<{
  pages?: PropsPage[]
  thresholdOffsetPercent?: number
  stickyBlocksLazyLoadDistance?: number
  forceStickBlocks?: 'before' | 'after' | 'both' | 'none'
  onPageChanged?: (currentPagePos: number, pageData?: PropsPage) => void
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
 * ### Sticky block elements
 * Each lazy-loaded sticky block receives:
 * - `--active` modifier when the block's page range includes the current page.
 * - `--lazy-loaded` modifier when the block is mounted but not on the current page.
 * - An inline `z-index` derived from the block's position in the sorted stack
 * (overridden by {@link PropsStickyBlock.zIndex} if provided).
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A div wrapping the full scrollytelling structure: top-bound sentinel,
 * back-blocks layer, front-blocks layer, paginated scrolling content, and
 * bottom-bound sentinel.
 */
export const Scrllgngn: FunctionComponent<Props> = ({
  pages,
  thresholdOffsetPercent,
  stickyBlocksLazyLoadDistance = 2,
  forceStickBlocks,
  onPageChanged,
  className
}) => {
  // State
  const [topVisible, setTopVis] = useState(false)
  const [contentVisible, setCntVis] = useState(false)
  const [bottomVisible, setBtmVis] = useState(false)
  const [currentPagePos, setCurrentPagePos] = useState<number>(0)
  const [stickyBlocks, setStickyBlocks] = useState(new Map<string, ConsolidatedStickyBlock>())
  const [partialBoundingRect, setPartialBoundingRect] = useState<ScreenRect>()

  // Sticky blocks calculations
  useEffect(() => {
    setStickyBlocks(consolidateStickyBlocks(pages))
  }, [pages])

  const lazyLoadedBackBlocks = lazyLoadedBlocks(stickyBlocks, 'back', currentPagePos, stickyBlocksLazyLoadDistance)
  const lazyLoadedFrontBlocks = lazyLoadedBlocks(stickyBlocks, 'front', currentPagePos, stickyBlocksLazyLoadDistance)

  // Handlers
  useChangeDispatch(currentPagePos, pagePos => onPageChanged?.(pagePos, pages?.[pagePos]))
  const handleTopBoundDetect: IOCompProps['onIntersected'] = e => setTopVis(e.ioEntry?.isIntersecting ?? false)
  const handleCntDetect: IOCompProps['onIntersected'] = e => setCntVis(e.ioEntry?.isIntersecting ?? false)
  const handleBtmBoundDetect: IOCompProps['onIntersected'] = e => setBtmVis(e.ioEntry?.isIntersecting ?? false)
  const handlePagesChanged: NonNullable<PaginatorProps['onPagesChanged']> = statePages => {
    const curPagePos = statePages.findIndex(page => page.position === 'curr')
    if (curPagePos === -1) return
    setCurrentPagePos(curPagePos)
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
  const customCssProps = toScreenCssProps(partialBoundingRect)
  return <div
    className={rootClss}
    data-current-page-pos={currentPagePos}
    data-current-page-id={pages?.[currentPagePos]?.id}
    style={{ ...customCssProps }}>
    <ResizeObserverComponent onResized={handleResize}>
      {/* Top bound detection */}
      <div className={c('top-bound')}>
        <IntersectionObserverComponent onIntersected={handleTopBoundDetect} />
      </div>

      {/* Back blocks */}
      <div className={c('back-blocks')}>
        {lazyLoadedBackBlocks.map((block, blockPos) => {
          const isActive = block.displayOnPages.includes(currentPagePos)
          const blockClss = c('back-block', {
            active: isActive,
            'lazy-loaded': !isActive
          })
          return <div
            className={blockClss}
            style={{ zIndex: blockPos }}>
            {block.children}
          </div>
        })}
      </div>

      {/* Front blocks */}
      <div className={c('front-blocks')}>
        {lazyLoadedFrontBlocks.map((block, blockPos) => {
          const isActive = block.displayOnPages.includes(currentPagePos)
          const blockClss = c('front-block', {
            active: isActive,
            'lazy-loaded': !isActive
          })
          return <div
            className={blockClss}
            style={{ zIndex: blockPos }}>
            {block.children}
          </div>
        })}
      </div>

      {/* Scrolling content */}
      <div className={c('scrolling-content')}>
        <IntersectionObserverComponent onIntersected={handleCntDetect}>
          <Paginator
            thresholdOffsetPercent={thresholdOffsetPercent}
            onPagesChanged={handlePagesChanged}>
            {pages?.map(page => {
              const scrollBlocks = page.blocks
                ?.filter(b => b.depth === 'scroll' || b.depth === undefined) ?? []
              // eslint-disable-next-line @typescript-eslint/promise-function-async
              return <>{scrollBlocks.map(b => b.children)}</>
            })}
          </Paginator>
        </IntersectionObserverComponent>
      </div>

      {/* Bottom bound detection */}
      <div className={c('bottom-bound')}>
        <IntersectionObserverComponent onIntersected={handleBtmBoundDetect} />
      </div>
    </ResizeObserverComponent>
  </div>
}
