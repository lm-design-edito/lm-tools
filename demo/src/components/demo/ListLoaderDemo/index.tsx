import { type FunctionComponent } from 'react'
import { wait } from '~/agnostic/time/wait/index.js'
import {
  ListLoader,
  type Props as ListLoaderProps
} from '~/components/ListLoader/index.js'
import { listLoader as publicClassName } from '~/components/public-classnames.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'ListLoader'

const description = `
Paginated list abstraction. Fetches the pages it is asked for, keeps them
fresh, and drives a {@link ControlledListLoader} with the result.

@param props - Component properties.
@see {@link Props}
@see {@link ControlledListLoader} for the rendered markup and CSS elements.
@returns A {@link ControlledListLoader} fed with the loaded pages.

@remarks
- In controlled mode (\`pages\` defined), the page set is entirely driven by the
  parent. \`fillGaps\` and \`dropPagesFurtherThan\` are inert, and load buttons only
  report through \`onLoadPageClick\`.
- In uncontrolled mode, internal state is initialized from \`defaultPage\` and load
  buttons extend the set themselves. \`onLoadPageClick\` still fires, after the
  internal state has been updated.
- A page removed from the effective set is dropped from memory, and a request
  still in flight for it is discarded on arrival rather than re-inserted.
- No page outside \`firstPagePos\`–\`lastPagePos\` is ever fetched, whichever mode
  is in use.

### CSS elements
- \`item\` — wraps each rendered item. Carries \`data-page\`.
- \`load\` — a load button. Rendered empty, so its label belongs in CSS.
  Carries \`data-page\` and a \`prev\`, \`next\` or \`gap\` modifier.
- \`load-observer\` — the intersection observer wrapping an auto-loading button.
  Present only when \`autoLoadPrevWhenVisible\` or \`autoLoadNextWhenVisible\` is on.
  Carries a \`prev\` or \`next\` modifier.

### Data attributes on the root element
- \`data-loading-pages\` — comma-separated ascending list of the pages being
  fetched, e.g. \`"1,3,6"\`. Absent entirely when nothing is loading.
`

/* TSX Details */

const tsxDetails = `
/**
 * Props for the {@link ControlledListLoader} component.
 *
 * @template T - The item type carried by each page.
 *
 * @property pages - Page positions the consumer wants rendered. Entries outside
 * \`firstPagePos\`–\`lastPagePos\` are ignored, as are entries absent from \`itemsPages\`.
 * @property firstPagePos - Lowest page position that exists. No load button is
 * ever rendered below it.
 * @property lastPagePos - Highest page position that exists. No load button is
 * ever rendered above it.
 * @property itemsPages - Already-loaded items, keyed by page position. The
 * component holds no data of its own and renders only what this map contains.
 * @property filter - Decides whether an item is rendered. Applied before deduplication.
 * @property display - Renders a single item.
 * @property getIdentifier - Item identity, used as React key and to deduplicate.
 * When two rendered items share an identifier, only the later one in page order
 * survives. Returning \`undefined\` opts an item out of deduplication, and falls
 * back to a positional key.
 * @property loadingPages - Page positions currently being fetched. Exposed on the
 * root element as \`data-loading-pages\`.
 * @property onLoadPageClick - Called with the page position a load button targets,
 * either on click or on viewport entry when auto-loading is enabled.
 * @property autoLoadPrevWhenVisible - Wraps the leading load button in an
 * {@link IntersectionObserverComponent} and fires \`onLoadPageClick\` when it enters the viewport.
 * @property autoLoadNextWhenVisible - Same, for the trailing load button.
 * @property className - Additional class name(s) applied to the root element.
 */
export type ControlledProps<T> = WithClassName<{
  pages: number[]
  firstPagePos: number
  lastPagePos: number
  itemsPages: Map<number, T[]>
  filter: (item: T) => boolean
  display: (item: T) => ReactNode
  getIdentifier?: (item: T) => string | undefined
  loadingPages?: number[]
  onLoadPageClick?: (pagePos: number) => void
  autoLoadPrevWhenVisible?: boolean
  autoLoadNextWhenVisible?: boolean
}>

/**
 * Props for the {@link ListLoader} component.
 *
 * Extends {@link ControlledProps} — minus the data it derives itself — with
 * fetching, staleness and page-set management.
 *
 * @template T - The item type carried by each page.
 *
 * @property pages - Page positions to keep loaded. When provided, the component
 * is fully controlled: load buttons only report clicks and never change the set
 * themselves. When omitted, the set is managed internally.
 * @property defaultPage - Page loaded first in uncontrolled mode. Clamped into
 * \`firstPagePos\`–\`lastPagePos\`, and defaults to \`firstPagePos\`. Ignored when
 * \`pages\` is provided.
 * @property fillGaps - When \`true\` (the default), any page missing between the
 * lowest and highest requested page is requested automatically, so the loaded
 * range stays contiguous. Ignored when \`pages\` is provided.
 * @property dropPagesFurtherThan - Maximum distance, in pages, kept around a page
 * loaded through a load button. Pages further away are dropped from state and
 * from the DOM. Applies to load-button activations only, never to retries or
 * stale reloads. Ignored when \`pages\` is provided.
 * @property fetch - Fetches one page's items. Rejections are reported through
 * \`onFetchError\` and retried according to \`fetchRetriesNb\`.
 * @property staleAfterMs - Delay after which a loaded page is refetched, counted
 * from its own last successful load. When omitted, pages are never refreshed.
 * @property onFetchSuccess - Called after a page's items have been stored. Not
 * called for a page dropped while its request was in flight.
 * @property onFetchError - Called on every failed attempt, not only once retries
 * are exhausted. When omitted, failures are logged with \`console.warn\`.
 * @property fetchRetriesNb - Number of retries after a failed fetch. Defaults to
 * \`Infinity\`, so a page keeps retrying until it succeeds.
 * @property fetchRetriesDelayMs - Delay between two attempts. Defaults to \`1000\`.
 */
export type Props<T> = Omit<ControlledProps<T>, 'itemsPages' | 'loadingPages' | 'pages'> & {
  pages?: number[]
  defaultPage?: number
  fillGaps?: boolean
  dropPagesFurtherThan?: number
  fetch: (page: number) => Promise<T[]>
  staleAfterMs?: number
  onFetchSuccess?: (pagePos: number, items: T[]) => void
  onFetchError?: (pagePos: number, error: Error) => void
  fetchRetriesNb?: number
  fetchRetriesDelayMs?: number
}
`

/* Demo CSS */

const demoStyles = `
.${publicClassName} {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

/* Items are prefixed with the page they came from, to show the flat ordering */
.${publicClassName}__item::before {
  content: 'p' attr(data-page) ' — ';
  opacity: 0.5;
}

/* Load buttons are rendered empty, so the label comes from CSS */
.${publicClassName}__load::before {
  content: 'load page ' attr(data-page);
}

.${publicClassName}__load--gap::before {
  content: 'load missing page ' attr(data-page);
}

/* Reveals data-loading-pages while requests are in flight */
.${publicClassName}[data-loading-pages]::after {
  content: 'loading: ' attr(data-loading-pages);
  opacity: 0.5;
}
`

/* Demo props */

type DemoItem = {
  id: string
  label: string
}

const itemsPerPage = 4
const firstPagePos = 0
const lastPagePos = 8

const fetchPage = async (pagePos: number): Promise<DemoItem[]> => {
  await wait(600)
  return Array.from({ length: itemsPerPage }, (_, itemPos) => ({
    id: `${pagePos}/${itemPos}`,
    label: `item ${itemPos}`
  }))
}

const demoProps: ListLoaderProps<DemoItem> = {
  defaultPage: 4,
  firstPagePos,
  lastPagePos,
  fetch: fetchPage,
  filter: () => true,
  display: item => <span>{item.label}</span>,
  getIdentifier: item => item.id,
  onFetchSuccess: (pagePos, items) => console.log('loaded page', pagePos, items),
  onFetchError: (pagePos, error) => console.log('failed page', pagePos, error)
}

export const ListLoaderDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoProps={demoProps as Record<string, unknown>}
    demoStyles={demoStyles}>
    <ListLoader {...demoProps} />
  </CompDisplayer>
}
