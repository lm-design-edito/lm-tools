import { type FunctionComponent } from 'react'
import {
  Paginator,
  type Props as PaginatorProps
} from '~/components/Paginator/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'Paginator'
const description = `
A scroll-driven pagination component that tracks which child page is currently
visible in the viewport and the direction of scroll.

Each direct child is wrapped in a page slot and observed via
{@link IntersectionObserver}. Page slots receive \`'prev'\`, \`'curr'\`, or \`'next'\`
positional modifier classes based on their visibility.

@param props - Component properties.
@see {@link Props}

@returns A root div containing a pages wrapper, with each child isolated in
its own observed page slot div.

@remarks
- Scroll direction is throttled to one update per 100ms and only dispatched
  when the direction actually changes, using an internal ref to avoid stale
  closure comparisons.
- Page visibility is tracked via a single {@link IntersectionObserver} instance
  that is recreated when \`thresholdOffsetPercent\` or \`children\` change.
- \`currCount\` on each {@link PageState} increments each time a page transitions
  into the \`'curr'\` position, making it useful as a re-entry counter.`

const tsxDetails = `
/**
 * State associated with a single page slot.
 *
 * @property position - The current position of the page relative to the viewport:
 * - \`'prev'\` — the page has been scrolled past.
 * - \`'curr'\` — the page is currently visible in the viewport.
 * - \`'next'\` — the page has not yet been reached.
 * @property currCount - The number of times this page has entered the \`'curr'\` position.
 */
type PageState = {
  position: 'prev' | 'curr' | 'next'
  currCount: number
}

type PagesState = Map<number, PageState>

/**
 * Represents the scroll direction state of the paginator.
 * - \`'forwards'\` — the user is scrolling down.
 * - \`'backwards'\` — the user is scrolling up.
 * - \`null\` — no scroll has been detected yet.
 */
type DirectionState = 'forwards' | 'backwards' | null

/**
 * Props for the {@link Paginator} component.
 *
 * @property thresholdOffsetPercent - Optional percentage offset used to compute
 * the {@link IntersectionObserver} root margin. Determines how far into the viewport
 * a page must be before it is considered \`'curr'\`. Defaults to \`0\`.
 *
 * @property onDirectionChange - Callback invoked when the scroll direction changes.
 * Receives the new {@link DirectionState}. Only fires when the direction actually
 * changes — repeated scrolls in the same direction do not trigger it again.
 *
 * @property onPageChange - Callback invoked whenever any page's {@link PageState}
 * changes. Receives a flat array of all pages' states, ordered by position.
 *
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - Each direct child is treated as an individual page slot.
 */
export type Props = PropsWithChildren<WithClassName<{
  thresholdOffsetPercent?: number
  onDirectionChange?: (direction: DirectionState) => void
  onPageChange?: (pages: PageState[]) => void
}>>`

const demoProps: PaginatorProps = {
  thresholdOffsetPercent: 80,
  children: [
    <div style={{ width: '100%', height: '120vh', backgroundColor: 'darkgrey' }}>Page 1</div>,
    <div style={{ width: '100%', height: '120vh', backgroundColor: 'tan' }}>Page 2</div>,
    <div style={{ width: '100%', height: '120vh', backgroundColor: 'plum' }}>Page 3</div>
  ],
  onDirectionChange: dir => console.log('Direction changed', dir),
  onPageChange: pages => console.log('Page changed', pages),
}

export const PaginatorDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoProps={demoProps}>
    <Paginator {...demoProps} />
  </CompDisplayer>
}
