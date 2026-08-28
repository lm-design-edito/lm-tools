import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react'
import { toError } from '../../agnostic/misc/cast/index.js'
import { clamp } from '../../agnostic/numbers/clamp/index.js'
import {
  type Props as ControlledProps,
  ListLoaderControlled
} from './index.controlled.js'
import { rangeBetween } from './utils.js'

/** A page's items together with the moment they were last fetched. */
type LoadedPageData<T> = {
  loadedAt: Date
  items: T[]
}

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
 * `firstPagePos`–`lastPagePos`, and defaults to `firstPagePos`. Ignored when
 * `pages` is provided.
 * @property fillGaps - When `true` (the default), any page missing between the
 * lowest and highest requested page is requested automatically, so the loaded
 * range stays contiguous. Ignored when `pages` is provided.
 * @property dropPagesFurtherThan - Maximum distance, in pages, kept around a page
 * loaded through a load button. Pages further away are dropped from state and
 * from the DOM. Applies to load-button activations only, never to retries or
 * stale reloads. Ignored when `pages` is provided.
 * @property fetch - Fetches one page's items. Rejections are reported through
 * `onFetchError` and retried according to `fetchRetriesNb`.
 * @property staleAfterMs - Delay after which a loaded page is refetched, counted
 * from its own last successful load. When omitted, pages are never refreshed.
 * @property onFetchSuccess - Called after a page's items have been stored. Not
 * called for a page dropped while its request was in flight.
 * @property onFetchError - Called on every failed attempt, not only once retries
 * are exhausted. When omitted, failures are logged with `console.warn`.
 * @property fetchRetriesNb - Number of retries after a failed fetch. Defaults to
 * `Infinity`, so a page keeps retrying until it succeeds.
 * @property fetchRetriesDelayMs - Delay between two attempts. Defaults to `1000`.
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

/**
 * Paginated list abstraction. Fetches the pages it is asked for, keeps them
 * fresh, and drives a {@link ListLoaderControlled} with the result.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @see {@link ListLoaderControlled} for the rendered markup and CSS elements.
 * @returns A {@link ListLoaderControlled} fed with the loaded pages.
 *
 * @remarks
 * - In controlled mode (`pages` defined), the page set is entirely driven by the
 *   parent. `fillGaps` and `dropPagesFurtherThan` are inert, and load buttons only
 *   report through `onLoadPageClick`.
 * - In uncontrolled mode, internal state is initialized from `defaultPage` and load
 *   buttons extend the set themselves. `onLoadPageClick` still fires, after the
 *   internal state has been updated.
 * - A page removed from the effective set is dropped from memory, and a request
 *   still in flight for it is discarded on arrival rather than re-inserted.
 * - No page outside `firstPagePos`–`lastPagePos` is ever fetched, whichever mode
 *   is in use.
 */
export const ListLoader = <T,>({
  className,
  pages,
  defaultPage,
  fillGaps = true,
  dropPagesFurtherThan,
  autoLoadPrevWhenVisible,
  autoLoadNextWhenVisible,
  firstPagePos,
  lastPagePos,
  fetch,
  filter,
  display,
  getIdentifier,
  onLoadPageClick,
  staleAfterMs,
  onFetchSuccess,
  onFetchError,
  fetchRetriesNb = Infinity,
  fetchRetriesDelayMs = 1000
}: Props<T>): ReactNode => {
  const [itemsPages, setItemsPages] = useState<Map<number, LoadedPageData<T>>>(new Map())
  const [loadingPages, setLoadingPages] = useState<Set<number>>(new Set())
  const [internalPages, setInternalPages] = useState<number[]>([
    clamp(defaultPage ?? firstPagePos, firstPagePos, lastPagePos)
  ])
  const requestedPages = useRef(new Set<number>())
  // Single source of truth for what should be loaded. Memoized so the effects
  // below keep a stable dependency when the page set has not actually changed.
  const currentPages = useMemo(
    () => (pages ?? internalPages).filter(page => page >= firstPagePos && page <= lastPagePos),
    [pages, internalPages, firstPagePos, lastPagePos]
  )

  const handleLoadClick = (pagePos: number): void => {
    if (pages === undefined) {
      setInternalPages(curr => {
        const next = curr.includes(pagePos) ? curr : [...curr, pagePos]
        if (dropPagesFurtherThan === undefined) return next
        const kept = next.filter(page => Math.abs(page - pagePos) <= dropPagesFurtherThan)
        return kept.length === next.length ? next : kept
      })
    }
    onLoadPageClick?.(pagePos)
  }

  const storePage = (page: number, items: T[]): void => setItemsPages(curr => {
    const next = new Map(curr)
    next.set(page, { loadedAt: new Date(), items })
    return next
  })

  const setPageLoading = (page: number, isLoading: boolean): void => setLoadingPages(curr => {
    const next = new Set(curr)
    if (isLoading) next.add(page)
    else next.delete(page)
    return next
  })

  const reportFetchError = (page: number, err: unknown): void => {
    const error = toError(err)
    if (onFetchError !== undefined) return onFetchError(page, error)
    // eslint-disable-next-line no-console
    console.warn(`ListLoader failed to fetch page ${page}`, error)
  }

  // Guards the whole load path at once: a page dropped meanwhile stops its
  // pending retries and its stale reloads without any further bookkeeping.
  const loadPage = (page: number, retriesLeft = fetchRetriesNb): void => {
    if (!requestedPages.current.has(page)) return
    setPageLoading(page, true)
    void fetch(page)
      .then(items => {
        if (!requestedPages.current.has(page)) return
        storePage(page, items)
        onFetchSuccess?.(page, items)
        setPageLoading(page, false)
      })
      .catch((err: unknown) => {
        reportFetchError(page, err)
        if (retriesLeft <= 0) return setPageLoading(page, false)
        window.setTimeout(() => loadPage(page, retriesLeft - 1), fetchRetriesDelayMs)
      })
  }

  // Fx. dep. `currentPages` - Drops everything held for pages no longer wanted.
  // The updaters return `curr` untouched when nothing was removed, so an unstable
  // `pages` prop cannot spin the render loop.
  useEffect(() => {
    Array.from(requestedPages.current)
      .filter(page => !currentPages.includes(page))
      .forEach(page => { requestedPages.current.delete(page) })
    setItemsPages(curr => {
      const next = new Map(Array.from(curr).filter(([page]) => currentPages.includes(page)))
      return next.size === curr.size ? curr : next
    })
    setLoadingPages(curr => {
      const next = new Set(Array.from(curr).filter(page => currentPages.includes(page)))
      return next.size === curr.size ? curr : next
    })
  }, [currentPages])

  useEffect(() => {
    if (pages !== undefined) return
    if (!fillGaps) return
    setInternalPages(curr => {
      if (curr.length === 0) return curr
      const missing = rangeBetween(Math.min(...curr), Math.max(...curr))
        .filter(page => !curr.includes(page))
      if (missing.length === 0) return curr
      return [...curr, ...missing]
    })
  }, [currentPages, fillGaps, pages])

  useEffect(() => {
    currentPages.forEach(page => {
      if (requestedPages.current.has(page)) return
      requestedPages.current.add(page)
      loadPage(page)
    })
  }, [currentPages, fetch])

  // Fx. dep. `itemsPages` - Reschedules one timeout per page on every store, each
  // due from its own `loadedAt`. A refetch updates `loadedAt`, which re-runs this
  // effect and keeps the cycle going.
  useEffect(() => {
    if (staleAfterMs === undefined) return
    const timeouts = Array.from(itemsPages).map(([page, { loadedAt }]) => {
      const dueInMs = Math.max(0, staleAfterMs - (Date.now() - loadedAt.getTime()))
      return window.setTimeout(() => loadPage(page), dueInMs)
    })
    return () => timeouts.forEach(timeout => window.clearTimeout(timeout))
  }, [itemsPages, staleAfterMs, fetch])

  const controlledItemsPages = new Map(Array
    .from(itemsPages)
    .map(([page, { items }]) => [page, items] as const))

  return <ListLoaderControlled
    className={className}
    pages={currentPages}
    firstPagePos={firstPagePos}
    lastPagePos={lastPagePos}
    itemsPages={controlledItemsPages}
    filter={filter}
    display={display}
    getIdentifier={getIdentifier}
    loadingPages={Array.from(loadingPages)}
    onLoadPageClick={handleLoadClick}
    autoLoadPrevWhenVisible={autoLoadPrevWhenVisible}
    autoLoadNextWhenVisible={autoLoadNextWhenVisible} />
}
