import { type FunctionComponent } from 'react'
import {
  Scrllgngn,
  type Props as ScrllgngnProps
} from '~/components/Scrllgngn/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'Scrllgngn'

const description = `
Scrollytelling engine component. Orchestrates layered sticky blocks (\`back\`
and \`front\`) over a paginated scrolling content area, with lazy loading,
viewport bound detection, and dimension tracking.

### Root element modifiers
The root \`<div>\` receives the public class name defined by \`scrllgngn\` and
the following BEM-style modifier classes when active:
- \`--top-visible\` — the top boundary sentinel is intersecting the viewport.
- \`--content-visible\` — the scrolling content area is intersecting the viewport.
- \`--bottom-visible\` — the bottom boundary sentinel is intersecting the viewport.
- \`--force-stick-blocks-before\` — when \`forceStickBlocks === 'before'\`.
- \`--force-stick-blocks-after\` — when \`forceStickBlocks === 'after'\`.
- \`--force-stick-blocks-both\` — when \`forceStickBlocks === 'both'\`.

### Data attributes
- \`data-current-page-pos\` — zero-based index of the page currently in view,
updated on every page change reported by the internal {@link Paginator}.

### CSS custom properties
Exposed on the root element and updated on resize via the internal
{@link ResizeObserverComponent}:
- \`--scrllgngn-screen-left\` / \`--PRIVATE-left\` — left edge of the bounding rect (px).
- \`--scrllgngn-screen-right\` / \`--PRIVATE-right\` — right edge (px).
- \`--scrllgngn-screen-width\` / \`--PRIVATE-width\` — total width (px).
- \`--scrllgngn-screen-height\` / \`--PRIVATE-height\` — total height (px).

### Sticky block elements
Each lazy-loaded sticky block receives:
- \`--active\` modifier when the block's page range includes the current page.
- \`--lazy-loaded\` modifier when the block is mounted but not on the current page.
- An inline \`z-index\` derived from the block's position in the sorted stack
(overridden by {@link PropsStickyBlock.zIndex} if provided).

@param props - Component properties.
@see {@link Props}
@returns A div wrapping the full scrollytelling structure: top-bound sentinel,
back-blocks layer, front-blocks layer, paginated scrolling content, and
bottom-bound sentinel.`

const tsxDetails = `/**
 * Common properties shared by all block types.
 *
 * @property id - Optional stable identifier for the block. Used to consolidate
 * blocks with the same id across multiple pages into a single sticky block
 * displayed across those pages.
 * @property trackScroll - Whether scroll tracking is enabled for this block.
 * @property children - Content rendered inside the block.
 */
type PropsCommonBlock = PropsWithChildren<{
  id?: string
  trackScroll?: boolean
}>

/**
 * A block that scrolls with the page content.
 *
 * @property depth - When set to \`'scroll'\` or omitted, the block is rendered
 * inline in the scrolling content layer.
 */
type PropsScrollBlock = PropsCommonBlock & {
  depth?: 'scroll'
}

/**
 * A block that sticks to the viewport, rendered outside the scroll flow.
 *
 * @property depth - \`'back'\` renders the block behind the scrolling content;
 * \`'front'\` renders it in front.
 * @property zIndex - Optional explicit z-index. Sticky blocks are otherwise
 * stacked in the order they appear across pages (ascending).
 */
type PropsStickyBlock = PropsCommonBlock & {
  depth: 'back' | 'front'
  zIndex?: number
}

/**
 * Union of all block variants accepted by a {@link PropsPage}.
 *
 * @see {@link PropsScrollBlock}
 * @see {@link PropsStickyBlock}
 */
type PropsBlock = PropsScrollBlock | PropsStickyBlock

/**
 * Describes a single page in the scrollytelling sequence.
 *
 * @property id - Optional identifier for the page.
 * @property blocks - Ordered list of blocks belonging to this page.
 * Scroll blocks are rendered inline; sticky blocks (\`'back'\` / \`'front'\`) are
 * lifted into their respective layer and consolidated with same-id blocks from
 * other pages.
 */
type PropsPage = {
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
 * unmounted to save resources. Defaults to \`2\`.
 * @property forceStickBlocks - Controls which out-of-range sticky blocks are
 * forced into a stuck state regardless of the current page:
 * - \`'before'\` — forces blocks from pages before the current one.
 * - \`'after'\`  — forces blocks from pages after the current one.
 * - \`'both'\`   — forces blocks on both sides.
 * - \`'none'\`   — no forcing (default behaviour).
 * @property className - Optional additional class name(s) applied to the root element.
 */
export type Props = WithClassName<{
  pages?: PropsPage[]
  thresholdOffsetPercent?: number
  stickyBlocksLazyLoadDistance?: number
  forceStickBlocks?: 'before' | 'after' | 'both' | 'none'
}>`

const demoProps: ScrllgngnProps = {
  forceStickBlocks: 'none',
  thresholdOffsetPercent: 80,
  pages: [{
    id: 'premiere-page',
    blocks: [{
      id: 'scr-blk-1',
      depth: 'scroll',
      children: <div style={{
        width: 300,
        height: 2000,
        backgroundColor: 'linen'
      }}>scrl-blk-1</div>
    }, {
      id: 'bk-blk-1',
      depth: 'back',
      zIndex: 1000,
      children: <div style={{ width: 100, height: 200, marginLeft: 200, backgroundColor: 'maroon' }}>back 1</div>
    }, {
      id: 'ft-blk-1',
      depth: 'front',
      children: <div style={{ width: 100, height: 200, marginLeft: 50, backgroundColor: 'darkorange' }}>front 1</div>
    }, {
      depth: 'back',
      children: <div style={{ width: 100, height: 200, marginLeft: 50, marginTop: 200, backgroundColor: 'violet' }}>back 2</div>
    }]
  }, {
    id: 'deuz-page',
    blocks: [{
      id: 'scr-blk-2',
      depth: 'scroll',
      children: <div style={{
        width: 300,
        height: 2000,
        backgroundColor: 'gold'
      }}>scrl-blk-2</div>
    }, {
      id: 'bk-blk-1'
    }]
  }, {
    id: 'troiz-page',
    blocks: [{
      id: 'scr-blk-3',
      depth: 'scroll',
      children: <div style={{
        width: 300,
        height: 2000,
        backgroundColor: 'honeydew'
      }}>scrl-blk-3</div>
    }, {
      id: 'ft-blk-1'
    }]
  }, {
    id: 'quatr-page',
    blocks: [{
      id: 'scr-blk-4',
      depth: 'scroll',
      children: <div style={{
        width: 300,
        height: 2000,
        backgroundColor: 'fuchsia'
      }}>scrl-blk-4</div>
    }]
  }, {
    id: 'cinq-page',
    blocks: [{
      id: 'scr-blk-5',
      depth: 'scroll',
      children: <div style={{
        width: 300,
        height: 2000,
        backgroundColor: 'orangered'
      }}>scrl-blk-5</div>
    }]
  }, {
    id: 'six-page',
    blocks: [{
      id: 'scr-blk-6',
      depth: 'scroll',
      children: <div style={{
        width: 300,
        height: 2000,
        backgroundColor: 'papayawhip'
      }}>scrl-blk-6</div>
    }, {
      id: 'ft-blk-1'
    }]}
  ]
}

export const ScrllgngnDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoProps={demoProps}>
    <Scrllgngn {...demoProps} />
  </CompDisplayer>
}
