import { clamp } from '../../agnostic/numbers/clamp/index.js'
import { randomHash } from '../../agnostic/random/uuid/index.js'
import type {
  PropsBlock,
  PropsPage,
  PropsStickyBlock
} from './index.js'

/** The subset of a bounding rect a {@link Scrllgngn} tracks and exposes. */
export type ScreenRect = {
  left: number
  right: number
  width: number
  height: number
}

/** Zero-based positions of the pages a consolidated block is displayed on. */
export type BlockConsolidatedData = {
  displayOnPages: number[]
}

/** A sticky block, merged across every page it appears on. */
export type ConsolidatedStickyBlock = PropsStickyBlock & BlockConsolidatedData

/**
 * Merges the sticky blocks of every page into a single entry per block id.
 *
 * A block repeated across pages under the same `id` becomes one sticky block
 * listing all the pages it shows on, so it stays mounted across them instead of
 * being torn down and rebuilt at every page change. Blocks without an `id` get a
 * random one and are therefore never merged.
 *
 * @param pages - The pages to walk, in order.
 * @returns The sticky blocks, keyed by id. Scroll blocks are left out.
 */
export function consolidateStickyBlocks (pages?: PropsPage[]): Map<string, ConsolidatedStickyBlock> {
  const consolidatedBlocks = new Map<string, PropsBlock & BlockConsolidatedData>()
  for (const page of pages ?? []) {
    const pageIndex = pages?.indexOf(page) ?? -1
    for (const block of page.blocks ?? []) {
      const blockId = block.id ?? randomHash(12)
      const found = consolidatedBlocks.get(blockId)
      if (found !== undefined) consolidatedBlocks.set(blockId, {
        ...found,
        ...block,
        displayOnPages: [
          ...found.displayOnPages,
          pageIndex
        ]
      })
      else consolidatedBlocks.set(blockId, {
        ...block,
        displayOnPages: [pageIndex]
      })
    }
  }
  return new Map(Array
    .from(consolidatedBlocks)
    .filter((e): e is [string, ConsolidatedStickyBlock] => {
      const block = e[1]
      return block.depth === 'back'
        || block.depth === 'front'
    }))
}

/**
 * Picks the sticky blocks of one layer close enough to the current page to be
 * worth mounting.
 *
 * @param blocks - Every consolidated sticky block.
 * @param depth - The layer to pick from.
 * @param currentPagePos - Zero-based position of the page in view.
 * @param lazyLoadDistance - How many pages around the current one still mount
 * their blocks.
 * @returns The blocks to render with the id they were consolidated under, stacked
 * by ascending `zIndex`. The id comes along because it is what identifies the block
 * across renders — its own `id` is optional, a consolidation key never is.
 */
export function lazyLoadedBlocks (
  blocks: Map<string, ConsolidatedStickyBlock>,
  depth: 'back' | 'front',
  currentPagePos: number,
  lazyLoadDistance: number
): Array<[string, ConsolidatedStickyBlock]> {
  return Array
    .from(blocks)
    .filter(([, block]) => block.depth === depth
      && block.displayOnPages.some(dispPage => {
        const absDiff = Math.abs(dispPage - currentPagePos)
        return absDiff <= lazyLoadDistance
      }))
    .sort(([, a], [, b]) => (a.zIndex ?? -Infinity) - (b.zIndex ?? -Infinity))
}

/**
 * Builds the CSS custom properties exposed on a {@link Scrllgngn} root.
 *
 * The public `screen-*` set follows the usual convention and stays absent until
 * the first measurement lands. The `--PRIVATE-*` set is what the component's own
 * stylesheet positions its fixed layers with, and it is emitted from the very
 * first render — as `initial`, the guaranteed-invalid value — so those layers can
 * never inherit the same names from an ancestor component. `initial` leaves them
 * behaving exactly as an unset variable would, without opening the hole.
 *
 * The public set describes the component's own box and nothing else. The private
 * one is narrowed to what the fixed layers may actually occupy — the component's
 * box **intersected** with the visible zone — so a viewport offset pushes them off
 * whatever covers that edge without the stylesheet doing arithmetic.
 *
 * @param rect - The measured bounding rect, absent until the first resize lands.
 * @param zone - The measured visible zone, absent until the probe reports.
 * @returns The custom properties, keyed by their full name.
 */
export function toScreenCssProps (rect?: ScreenRect, zone?: VisibleZoneRect): Record<string, string> {
  const publicProps: Record<string, string> = rect === undefined
    ? {}
    : {
        '--lm-scrllgngn-screen-left': `${rect.left}px`,
        '--lm-scrllgngn-screen-left-raw': `${rect.left}`,
        '--lm-scrllgngn-screen-right': `${rect.right}px`,
        '--lm-scrllgngn-screen-right-raw': `${rect.right}`,
        '--lm-scrllgngn-screen-width': `${rect.width}px`,
        '--lm-scrllgngn-screen-width-raw': `${rect.width}`,
        '--lm-scrllgngn-screen-height': `${rect.height}px`,
        '--lm-scrllgngn-screen-height-raw': `${rect.height}`
      }
  const inZone = toZoneClampedRect(rect, zone)
  return {
    ...publicProps,
    '--PRIVATE-left': toPrivateLength(inZone?.left),
    '--PRIVATE-right': toPrivateLength(inZone?.right),
    '--PRIVATE-width': toPrivateLength(inZone?.width),
    '--PRIVATE-height': toPrivateLength(rect?.height)
  }
}

/** The component's box, cut down to the horizontal span of the visible zone. */
function toZoneClampedRect (rect?: ScreenRect, zone?: VisibleZoneRect): ScreenRect | undefined {
  if (rect === undefined) return undefined
  if (zone === undefined) return rect
  const left = Math.max(rect.left, zone.left)
  const right = Math.min(rect.right, window.innerWidth - zone.right)
  return {
    left,
    right,
    width: Math.max(right - left, 0),
    height: rect.height
  }
}

function toPrivateLength (value?: number): string {
  return value === undefined ? 'initial' : `${value}px`
}

/* * * * * * * * * * * * * * * * *
 *
 * Scroll tracking
 *
 * * * * * * * * * * * * * * * * */

/**
 * Where one tracked block stands in the scroll, as handed to its `onScrolled`.
 *
 * Every progression is a `0`–`1` ratio measured against the threshold line, and
 * weighted **by pixel height**: a zone of unequal pages is not the same as
 * `(indexOfCurrentPage + currentPageProgression) / displayZone.length`.
 *
 * @property currentPage - Zero-based position of the page in view.
 * @property currentPageProgression - `0` when the current page's top meets the
 * threshold, `1` when its bottom does.
 * @property displayZone - Every page the block's `id` appears on. A block without
 * an `id` shows on one page, so its zone holds that page alone and its three
 * progressions are equal.
 * @property indexOfCurrentPageInDisplayZone - Where `currentPage` sits in
 * `displayZone`.
 * @property displayZoneProgression - Progression across the whole zone. On a zone
 * like `[2, 3, 5]` it runs 0 → ~0.66 over pages 2–3, pauses while page 4 shows the
 * block nowhere, then resumes to 1 on page 5.
 * @property contiguousDisplayZone - The unbroken run of `displayZone` containing
 * `currentPage` — `[2, 3]` for the zone above while on page 2 or 3.
 * @property indexOfCurrentPageInContiguousDisplayZone - Where `currentPage` sits in
 * `contiguousDisplayZone`.
 * @property contiguousDisplayZoneProgression - Progression across that run alone,
 * so it always spans a full 0 → 1.
 */
export type TrackedBlockContext = {
  currentPage: number
  currentPageProgression: number
  displayZone: number[]
  indexOfCurrentPageInDisplayZone: number
  displayZoneProgression: number
  contiguousDisplayZone: number[]
  indexOfCurrentPageInContiguousDisplayZone: number
  contiguousDisplayZoneProgression: number
}

/** How far the threshold line has travelled through one page, in pixels. */
export type PageScrollMetrics = {
  scrolled: number
  height: number
}

/**
 * Lists the pages each block id shows on.
 *
 * @param pages - The pages to walk, in order.
 * @returns Zero-based page positions per id, ordered. Blocks without an `id` are
 * left out: they show on their own page and nowhere else.
 */
export function blockDisplayZones (pages?: PropsPage[]): Map<string, number[]> {
  const zones = new Map<string, number[]>()
  ;(pages ?? []).forEach((page, pagePos) => {
    for (const block of page.blocks ?? []) {
      if (block.id === undefined) continue
      const zone = zones.get(block.id) ?? []
      if (!zone.includes(pagePos)) zone.push(pagePos)
      zones.set(block.id, zone)
    }
  })
  return zones
}

/**
 * Isolates the unbroken run of pages around one page.
 *
 * @param zone - The pages a block shows on, in any order.
 * @param page - The page the run must contain.
 * @returns The run holding `page`, ascending, or an empty array when `zone` misses
 * it entirely.
 */
export function contiguousRunContaining (zone: number[], page: number): number[] {
  const ascending = [...zone].sort((a, b) => a - b)
  let run: number[] = []
  for (const pagePos of ascending) {
    const previous = run[run.length - 1]
    if (previous !== undefined && pagePos !== previous + 1) {
      if (run.includes(page)) return run
      run = []
    }
    run.push(pagePos)
  }
  return run.includes(page) ? run : []
}

/**
 * Measures how far the threshold line has travelled through each of the pages
 * asked for.
 *
 * Only those pages are measured, not all of them: a long sequence would otherwise
 * pay for a forced layout per page on every frame, where the tracked blocks rarely
 * span more than a handful.
 *
 * @param pageElements - Every page slot, indexed by position.
 * @param pagePositions - The positions worth measuring.
 * @param thresholdY - The threshold line, in pixels from the viewport top. See
 * {@link toThresholdY}.
 * @returns The metrics of each measurable page, keyed by position.
 */
export function measurePages (
  pageElements: HTMLElement[],
  pagePositions: Iterable<number>,
  thresholdY: number
): Map<number, PageScrollMetrics> {
  const measured = new Map<number, PageScrollMetrics>()
  for (const pagePos of pagePositions) {
    const element = pageElements[pagePos]
    if (element === undefined) continue
    const { top, height } = element.getBoundingClientRect()
    measured.set(pagePos, {
      scrolled: clamp(thresholdY - top, 0, height),
      height
    })
  }
  return measured
}

/** Pixel-weighted progression across a set of pages, `0` when none is measured. */
function zoneProgression (zone: number[], metrics: Map<number, PageScrollMetrics>): number {
  let scrolled = 0
  let height = 0
  for (const pagePos of zone) {
    const pageMetrics = metrics.get(pagePos)
    if (pageMetrics === undefined) continue
    scrolled += pageMetrics.scrolled
    height += pageMetrics.height
  }
  return height === 0 ? 0 : scrolled / height
}

/**
 * Assembles what one tracked block is told about the scroll.
 *
 * @param displayZone - The pages the block shows on.
 * @param currentPage - Zero-based position of the page in view.
 * @param metrics - Measurements covering at least `displayZone`.
 * @returns The context to hand to `onScrolled`.
 */
export function toTrackedBlockContext (
  displayZone: number[],
  currentPage: number,
  metrics: Map<number, PageScrollMetrics>
): TrackedBlockContext {
  const contiguousDisplayZone = contiguousRunContaining(displayZone, currentPage)
  return {
    currentPage,
    currentPageProgression: zoneProgression([currentPage], metrics),
    displayZone,
    indexOfCurrentPageInDisplayZone: displayZone.indexOf(currentPage),
    displayZoneProgression: zoneProgression(displayZone, metrics),
    contiguousDisplayZone,
    indexOfCurrentPageInContiguousDisplayZone: contiguousDisplayZone.indexOf(currentPage),
    contiguousDisplayZoneProgression: zoneProgression(contiguousDisplayZone, metrics)
  }
}

/** The fields that only move when the page does, so they can be written sparingly. */
function discretePart (context: TrackedBlockContext): string {
  return [
    context.currentPage,
    context.indexOfCurrentPageInDisplayZone,
    context.indexOfCurrentPageInContiguousDisplayZone,
    context.displayZone.join(','),
    context.contiguousDisplayZone.join(',')
  ].join('|')
}

/** Whether two contexts hold the same discrete fields, ignoring the progressions. */
export function sameDiscretePart (a: TrackedBlockContext, b?: TrackedBlockContext): boolean {
  return b !== undefined && discretePart(a) === discretePart(b)
}

/** Whether two contexts are equal down to the progressions. */
export function contextsAreEqual (a: TrackedBlockContext, b?: TrackedBlockContext): boolean {
  return sameDiscretePart(a, b)
    && b !== undefined
    && a.currentPageProgression === b.currentPageProgression
    && a.displayZoneProgression === b.displayZoneProgression
    && a.contiguousDisplayZoneProgression === b.contiguousDisplayZoneProgression
}

/**
 * Builds the CSS custom properties carrying a tracked block's progressions.
 *
 * Only the continuous fields land here — the discrete ones are `data-` attributes,
 * written by {@link toTrackedBlockDataAttributes}.
 *
 * @param context - The block's current context.
 * @returns The custom properties, keyed by their full name.
 */
export function toTrackedBlockCssProps (context: TrackedBlockContext): Record<string, string> {
  return {
    '--lm-scrllgngn-block-current-page-progression-ratio': `${context.currentPageProgression}`,
    '--lm-scrllgngn-block-display-zone-progression-ratio': `${context.displayZoneProgression}`,
    '--lm-scrllgngn-block-contiguous-display-zone-progression-ratio': `${context.contiguousDisplayZoneProgression}`
  }
}

/**
 * Builds the `data-` attributes carrying a tracked block's discrete position.
 *
 * @param context - The block's current context.
 * @returns The attributes, keyed by their full name.
 */
export function toTrackedBlockDataAttributes (context: TrackedBlockContext): Record<string, string> {
  return {
    'data-current-page': `${context.currentPage}`,
    'data-display-zone': context.displayZone.join(','),
    'data-index-of-current-page-in-display-zone': `${context.indexOfCurrentPageInDisplayZone}`,
    'data-contiguous-display-zone': context.contiguousDisplayZone.join(','),
    'data-index-of-current-page-in-contiguous-display-zone': `${context.indexOfCurrentPageInContiguousDisplayZone}`
  }
}

/** What the per-frame pass needs to know about one tracked block. */
export type TrackedBlock = {
  displayZone: number[]
  onScrolled: (context: TrackedBlockContext) => void
}

/**
 * Keys a tracked sticky block.
 *
 * Sticky and scroll blocks share one map of wrappers, and a sticky block is one
 * element for the whole sequence where a scroll block is one per page — hence two
 * key shapes rather than a single ambiguous one.
 *
 * @param blockId - The id the block was consolidated under.
 * @returns The key its wrapper is registered as.
 */
export function stickyKey (blockId: string): string {
  return `sticky:${blockId}`
}

/**
 * Keys a tracked scroll block.
 *
 * @param pagePos - Zero-based position of the page it belongs to.
 * @param blockPos - Its position among that page's scroll blocks.
 * @returns The key its wrapper is registered as.
 */
export function scrollKey (pagePos: number, blockPos: number): string {
  return `scroll:${pagePos}:${blockPos}`
}

/**
 * Picks the blocks of a page that scroll with the content.
 *
 * @param page - The page to read.
 * @returns Its scroll blocks, in order. `depth` left out means `'scroll'`.
 */
export function scrollBlocksOf (page: PropsPage): PropsBlock[] {
  return page.blocks?.filter(block => block.depth === 'scroll' || block.depth === undefined) ?? []
}

/* * * * * * * * * * * * * * * * *
 *
 * Visible zone
 *
 * * * * * * * * * * * * * * * * */

/** How much of each viewport edge is covered by something else, in pixels. */
export type VisibleZoneRect = {
  top: number
  right: number
  bottom: number
  left: number
  width: number
  height: number
}

/** A length as authored: a bare number means pixels, a string is CSS's problem. */
export type ViewportOffset = number | string

/** The four edges, as authored on the component. */
export type ViewportOffsets = {
  top?: ViewportOffset
  right?: ViewportOffset
  bottom?: ViewportOffset
  left?: ViewportOffset
}

function toCssLength (offset?: ViewportOffset): string {
  if (offset === undefined) return '0px'
  return typeof offset === 'number' ? `${offset}px` : offset
}

/**
 * Builds the custom properties carrying the visible zone's insets.
 *
 * They are emitted whatever the props hold, `0px` standing in for an edge left
 * unset: the probe and the fixed layers position themselves against them, and an
 * absent name would let an enclosing component's value inherit through.
 *
 * @param offsets - The edges as authored.
 * @returns The custom properties, keyed by their full name.
 */
export function toViewportOffsetCssProps (offsets: ViewportOffsets): Record<string, string> {
  const top = toCssLength(offsets.top)
  const right = toCssLength(offsets.right)
  const bottom = toCssLength(offsets.bottom)
  const left = toCssLength(offsets.left)
  return {
    '--lm-scrllgngn-viewport-offset-top': top,
    '--lm-scrllgngn-viewport-offset-right': right,
    '--lm-scrllgngn-viewport-offset-bottom': bottom,
    '--lm-scrllgngn-viewport-offset-left': left,
    '--PRIVATE-viewport-offset-top': top,
    '--PRIVATE-viewport-offset-right': right,
    '--PRIVATE-viewport-offset-bottom': bottom,
    '--PRIVATE-viewport-offset-left': left
  }
}

/**
 * Reads the visible zone off the probe element.
 *
 * The probe is fixed and inset by the four offsets, so its rect *is* the zone —
 * which is how a `var()`, a `clamp()` or a breakpoint-dependent length reaches
 * JavaScript without anyone parsing a CSS length.
 *
 * @param probeRect - The probe's bounding rect.
 * @returns The zone, as insets from each viewport edge plus its own size.
 */
export function toVisibleZoneRect (probeRect: DOMRect): VisibleZoneRect {
  return {
    top: probeRect.top,
    right: window.innerWidth - probeRect.right,
    bottom: window.innerHeight - probeRect.bottom,
    left: probeRect.left,
    width: probeRect.width,
    height: probeRect.height
  }
}

/**
 * Shrinks an {@link IntersectionObserver} root down to the visible zone.
 *
 * @param zone - The measured zone, absent until the probe reports.
 * @returns A `rootMargin`, or `undefined` to leave the observer on the full
 * viewport.
 */
export function toVisibleZoneRootMargin (zone?: VisibleZoneRect): string | undefined {
  if (zone === undefined) return undefined
  return `${-zone.top}px ${-zone.right}px ${-zone.bottom}px ${-zone.left}px`
}

/**
 * Places the threshold line, in pixels from the viewport top.
 *
 * `thresholdOffsetPercent` reads as a percentage **of the visible zone**, not of
 * the viewport: a threshold at 50% has to sit halfway down what the reader can
 * actually see, or it lands under whatever covers the top of the screen.
 *
 * @param zone - The measured zone, absent until the probe reports.
 * @param thresholdOffsetPercent - The offset as authored.
 * @returns The line's distance from the viewport top.
 */
export function toThresholdY (zone?: VisibleZoneRect, thresholdOffsetPercent?: number): number {
  const percent = thresholdOffsetPercent ?? 0
  if (zone === undefined) return window.innerHeight * percent / 100
  return zone.top + zone.height * percent / 100
}

/**
 * Restates the threshold as the percentage of the **viewport** an
 * {@link IntersectionObserver} needs, since that is the only frame `rootMargin`
 * knows.
 *
 * With no offsets set the zone spans the viewport and the number comes back
 * unchanged, so nothing moves for a component that never asked for any of this.
 *
 * @param zone - The measured zone, absent until the probe reports.
 * @param thresholdOffsetPercent - The offset as authored.
 * @returns The equivalent viewport percentage, to hand to the internal `Paginator`.
 */
export function toPaginatorThresholdPercent (
  zone?: VisibleZoneRect,
  thresholdOffsetPercent?: number
): number | undefined {
  if (zone === undefined) return thresholdOffsetPercent
  const viewportHeight = window.innerHeight
  if (viewportHeight === 0) return thresholdOffsetPercent
  return toThresholdY(zone, thresholdOffsetPercent) / viewportHeight * 100
}

/** How often the visible zone is re-read while the component is on screen, in ms. */
export const visibleZonePollInterval = 100

/** Whether two zones hold the same six measurements. */
export function visibleZonesAreEqual (a?: VisibleZoneRect, b?: VisibleZoneRect): boolean {
  if (a === undefined || b === undefined) return a === b
  return a.top === b.top
    && a.right === b.right
    && a.bottom === b.bottom
    && a.left === b.left
    && a.width === b.width
    && a.height === b.height
}
