import type { PropsWithChildren } from 'react'

/**
 * The depths that lift a block out of the scroll flow.
 *
 * **Exported because a consumer has to validate what it is handed**, and a type gives a
 * runtime validator nothing to compare against. A block declaring one of these is
 * consolidated across the pages it appears on and rendered in that layer, not inline.
 */
export const SCRLLGNGN_STICKY_DEPTHS = [
  'back',
  'front'
] as const

export type StickyDepth = typeof SCRLLGNGN_STICKY_DEPTHS[number]

/**
 * Which out-of-range sticky blocks are forced into a stuck state.
 *
 * Exported for the same reason as {@link SCRLLGNGN_STICKY_DEPTHS}: the list is what a
 * validator needs, and the day a mode is added is the day a caller writing it would
 * otherwise silently get nothing.
 */
export const SCRLLGNGN_FORCE_STICK_MODES = [
  'before',
  'after',
  'both',
  'none'
] as const

export type ForceStickMode = typeof SCRLLGNGN_FORCE_STICK_MODES[number]

/** A length as authored: a bare number means pixels, a string is CSS's problem. */
export type ViewportOffset = number | string

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
  depth: StickyDepth
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
