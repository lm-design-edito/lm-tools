import { randomHash } from '../../agnostic/random/uuid/index.js'
import { toCssVars } from '../utils/index.js'
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
 * @returns The blocks to render, stacked by ascending `zIndex`.
 */
export function lazyLoadedBlocks (
  blocks: Map<string, ConsolidatedStickyBlock>,
  depth: 'back' | 'front',
  currentPagePos: number,
  lazyLoadDistance: number
): ConsolidatedStickyBlock[] {
  return Array
    .from(blocks)
    .map(([, block]) => block)
    .filter(block => block.depth === depth
      && block.displayOnPages.some(dispPage => {
        const absDiff = Math.abs(dispPage - currentPagePos)
        return absDiff <= lazyLoadDistance
      }))
    .sort((a, b) => (a.zIndex ?? -Infinity) - (b.zIndex ?? -Infinity))
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
 * @param prefix - Public class name the public variables are namespaced under.
 * @param rect - The measured bounding rect, absent until the first resize lands.
 * @returns The custom properties, keyed by their full name.
 */
export function toScreenCssProps (
  prefix: string,
  rect?: ScreenRect
): Record<string, string> {
  return {
    ...toCssVars(prefix, {
      'screen-left': rect?.left,
      'screen-right': rect?.right,
      'screen-width': rect?.width,
      'screen-height': rect?.height
    }),
    '--PRIVATE-left': toPrivateLength(rect?.left),
    '--PRIVATE-right': toPrivateLength(rect?.right),
    '--PRIVATE-width': toPrivateLength(rect?.width),
    '--PRIVATE-height': toPrivateLength(rect?.height)
  }
}

function toPrivateLength (value?: number): string {
  return value === undefined ? 'initial' : `${value}px`
}
