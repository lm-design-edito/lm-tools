import type { JSX, ReactNode } from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { IntersectionObserverComponent } from '../IntersectionObserver/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { listLoader as publicClassName } from '../public-classnames.js'
import { rangeBetween } from './utils.js'
import cssModule from './styles.module.css'

/** Which position a load button occupies in the rendered sequence. */
type LoadButtonKind = 'prev' | 'next' | 'gap'

/**
 * Props for the {@link ControlledListLoader} component.
 *
 * @template T - The item type carried by each page.
 *
 * @property pages - Page positions the consumer wants rendered. Entries outside
 * `firstPagePos`–`lastPagePos` are ignored, as are entries absent from `itemsPages`.
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
 * survives. Returning `undefined` opts an item out of deduplication, and falls
 * back to a positional key.
 * @property loadingPages - Page positions currently being fetched. Exposed on the
 * root element as `data-loading-pages`.
 * @property onLoadPageClicked - Called with the page position a load button targets,
 * either on click or on viewport entry when auto-loading is enabled.
 * @property autoLoadPrevWhenVisible - Wraps the leading load button in an
 * {@link IntersectionObserverComponent} and fires `onLoadPageClicked` when it enters the viewport.
 * @property autoLoadNextWhenVisible - Same, for the trailing load button.
 * @property className - Additional class name(s) applied to the root element.
 */
export type Props<T> = WithClassName<{
  pages: number[]
  firstPagePos: number
  lastPagePos: number
  itemsPages: Map<number, T[]>
  filter: (item: T) => boolean
  display: (item: T) => ReactNode
  getIdentifier?: (item: T) => string | undefined
  loadingPages?: number[]
  onLoadPageClicked?: (pagePos: number) => void
  autoLoadPrevWhenVisible?: boolean
  autoLoadNextWhenVisible?: boolean
}>

/**
 * Presentational layer of the paginated list. Renders already-loaded pages as a
 * single flat item list, and interleaves load buttons wherever a page is missing.
 *
 * This component holds no state and performs no fetching. Loaded pages are sorted
 * by position and flattened, so items appear in page order then in item order,
 * with no per-page wrapper element.
 *
 * ### Load buttons
 * One button is rendered per missing page position:
 * - before the first loaded page, unless it is already `firstPagePos`,
 * - in place of each page missing between two loaded pages,
 * - after the last loaded page, unless it is already `lastPagePos`.
 *
 * ### CSS elements
 * - `item` — wraps each rendered item. Carries `data-page`.
 * - `load` — a load button. Rendered empty, so its label belongs in CSS.
 *   Carries `data-page` and a `prev`, `next` or `gap` modifier.
 * - `load-observer` — the intersection observer wrapping an auto-loading button.
 *   Present only when `autoLoadPrevWhenVisible` or `autoLoadNextWhenVisible` is on.
 *   Carries a `prev` or `next` modifier.
 *
 * ### Data attributes on the root element
 * - `data-loading-pages` — comma-separated ascending list of the pages being
 *   fetched, e.g. `"1,3,6"`. Absent entirely when nothing is loading.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A flat list of items with load buttons in place of missing pages.
 *
 * @remarks
 * Deduplication runs after `filter`, so an item hidden by `filter` never evicts
 * an earlier duplicate.
 */
export const ControlledListLoader = <T,>({
  className,
  pages,
  firstPagePos,
  lastPagePos,
  itemsPages,
  filter,
  display,
  getIdentifier,
  loadingPages,
  onLoadPageClicked,
  autoLoadPrevWhenVisible,
  autoLoadNextWhenVisible
}: Props<T>): ReactNode => {
  const inBoundsPages = pages.filter(pagePos => pagePos >= firstPagePos && pagePos <= lastPagePos)

  const filteredItems = Array.from(itemsPages)
    .filter(([pagePos]) => inBoundsPages.includes(pagePos))
    .sort(([pageA], [pageB]) => pageA - pageB)
    .flatMap(([pagePos, items]) => items.map((item, itemPos) => ({ item, pagePos, itemPos })))
    .filter(({ item }) => filter(item))

  const identifiers = filteredItems.map(({ item }) => getIdentifier?.(item))
  const displayedItems = filteredItems.filter((_, pos) => {
    const identifier = identifiers[pos]
    if (identifier === undefined) return true
    return identifiers.lastIndexOf(identifier) === pos
  })

  const loadedPages = Array.from(itemsPages.keys())
    .filter(pagePos => inBoundsPages.includes(pagePos))
    .sort((a, b) => a - b)
  const firstLoadedPage = loadedPages[0]
  const lastLoadedPage = loadedPages[loadedPages.length - 1]

  const gapPages = loadedPages.flatMap((pagePos, pos) => {
    const prevPage = loadedPages[pos - 1]
    if (prevPage === undefined) return []
    return rangeBetween(prevPage + 1, pagePos - 1)
  })

  const slots = [
    ...firstLoadedPage !== undefined && firstLoadedPage > firstPagePos
      ? [{ pagePos: firstLoadedPage - 1, kind: 'prev' as const }]
      : [],
    ...loadedPages.map(pagePos => ({ pagePos, kind: 'items' as const })),
    ...gapPages.map(pagePos => ({ pagePos, kind: 'gap' as const })),
    ...lastLoadedPage !== undefined && lastLoadedPage < lastPagePos
      ? [{ pagePos: lastLoadedPage + 1, kind: 'next' as const }]
      : []
  ].sort((a, b) => a.pagePos - b.pagePos)

  const sortedLoadingPages = [...loadingPages ?? []]
    .filter(pagePos => inBoundsPages.includes(pagePos))
    .sort((a, b) => a - b)
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(), className)

  const renderLoadButton = (pagePos: number, kind: LoadButtonKind): JSX.Element => {
    const button = <button
      className={c('load', kind)}
      key={`load/${pagePos}`}
      data-page={pagePos}
      onClick={() => onLoadPageClicked?.(pagePos)} />
    const autoLoads = (kind === 'prev' && autoLoadPrevWhenVisible === true)
      || (kind === 'next' && autoLoadNextWhenVisible === true)
    if (!autoLoads) return button
    return <IntersectionObserverComponent
      className={c('load-observer', kind)}
      key={`load/${pagePos}`}
      onIntersected={({ ioEntry }) => {
        if (ioEntry?.isIntersecting !== true) return
        onLoadPageClicked?.(pagePos)
      }}>
      {button}
    </IntersectionObserverComponent>
  }

  return <div
    className={rootClss}
    data-loading-pages={sortedLoadingPages.length === 0 ? undefined : sortedLoadingPages.join(',')}>
    {slots.map(({ pagePos, kind }) => kind === 'items'
      ? displayedItems
        .filter(entry => entry.pagePos === pagePos)
        .map(({ item, itemPos }) => <div
          className={c('item')}
          key={getIdentifier?.(item) ?? `${pagePos}/${itemPos}`}
          data-page={pagePos}>
          {display(item)}
        </div>)
      : renderLoadButton(pagePos, kind))}
  </div>
}
