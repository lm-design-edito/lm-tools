import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FunctionComponent,
  type PropsWithChildren
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { randomHash } from '../../agnostic/random/uuid/index.js'
import {
  IntersectionObserverComponent,
  type Props as IOProps
} from '../IntersectionObserver/index.js'
import type { WithClassName } from '../utils/types.js'
import {
  mergeClassNames,
  useChangeDispatch
} from '../utils/index.js'
import { scrollListener as publicClassName } from '../public-classnames.js'
import {
  subscribe,
  toScrollCssProps,
  unsubscribe,
  type ScrollState
} from './utils.js'
import cssModule from './styles.module.css'

/**
 * Props for the {@link ScrollListener} component.
 *
 * @property startOnVisible - When `true`, scroll tracking only starts once the
 * component enters the viewport, instead of on mount.
 * @property stopOnHidden - When `true`, scroll tracking stops when the component
 * leaves the viewport.
 * @property onScrollStateChanged - Called after the measured {@link ScrollState}
 * changed. Receives `undefined` until the first measurement lands.
 * @property onVisibilityChanged - Called on every intersection change, with
 * `true` when the component intersects the viewport.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - React nodes rendered inside the scroll listener container.
 */
export type Props = PropsWithChildren<WithClassName<{
  startOnVisible?: boolean
  stopOnHidden?: boolean
  onScrollStateChanged?: (scrollState?: ScrollState) => void
  onVisibilityChanged?: (isVisible: boolean) => void
}>>

/**
 * Exposes scroll metrics — both the document's and its own — as CSS custom
 * properties on its root element, so scroll-driven styling needs no JavaScript
 * of its own.
 *
 * ### CSS custom properties on the root element
 * Each measurement comes as a bare number and as a `-px` twin:
 * - `--{prefix}-window-width`, `--{prefix}-window-height`
 * - `--{prefix}-html-width`, `--{prefix}-html-height`
 * - `--{prefix}-scroll-x`, `--{prefix}-scroll-y`
 * - `--{prefix}-width`, `--{prefix}-height`
 * - `--{prefix}-offset-x`, `--{prefix}-offset-y`
 *
 * Ratios are unitless and have no twin:
 * - `--{prefix}-window-scrolled-x-ratio`, `--{prefix}-window-scrolled-y-ratio` —
 *   how far the document is scrolled.
 * - `--{prefix}-self-inner-scrolled-x-ratio`, `--{prefix}-self-inner-scrolled-y-ratio` —
 *   `0` when the element's start edge meets the viewport's start edge, `1` when
 *   its end edge meets the viewport's end edge. The span where it is fully visible.
 * - `--{prefix}-self-outer-scrolled-x-ratio`, `--{prefix}-self-outer-scrolled-y-ratio` —
 *   `0` when the element is about to enter the viewport, `1` once it has fully
 *   left it. The span where it overlaps the viewport at all.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A container exposing the metrics, wrapping its children inside an
 * {@link IntersectionObserverComponent}.
 *
 * @remarks
 * All mounted instances share a single pair of `scroll` / `resize` listeners and
 * a single measurement pass per animation frame — the document is measured once
 * for everyone, each element only for itself. The listeners exist only while at
 * least one instance is tracking.
 */
export const ScrollListener: FunctionComponent<Props> = ({
  startOnVisible,
  stopOnHidden,
  onScrollStateChanged,
  onVisibilityChanged,
  className,
  children
}) => {
  // State & refs
  const [subscriberId] = useState(() => randomHash(6))
  const [scrollState, setScrollState] = useState<ScrollState>()
  const rootRef = useRef<HTMLDivElement>(null)

  // State dispatch
  useChangeDispatch(scrollState, onScrollStateChanged)

  // Fx. no dep. - track from mount, unless waiting for the component to show up.
  // The cleanup runs whichever way the subscription was opened.
  useEffect(() => {
    if (startOnVisible !== true) {
      subscribe(subscriberId, { rootRef, onScrollStateChange: setScrollState })
    }
    return () => unsubscribe(subscriberId)
  }, [])

  // User action handlers
  const handleIntersection = useCallback<NonNullable<IOProps['onIntersected']>>(({ ioEntry }) => {
    const isVisible = ioEntry?.isIntersecting ?? false
    onVisibilityChanged?.(isVisible)
    if (isVisible && startOnVisible === true) {
      subscribe(subscriberId, { rootRef, onScrollStateChange: setScrollState })
    }
    if (!isVisible && stopOnHidden === true) unsubscribe(subscriberId)
  }, [startOnVisible, stopOnHidden, onVisibilityChanged])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(), className)
  const customProps = scrollState === undefined
    ? {}
    : toScrollCssProps(publicClassName, scrollState)
  return <div
    className={rootClss}
    ref={rootRef}
    style={{ ...customProps }}>
    <IntersectionObserverComponent onIntersected={handleIntersection}>
      {children}
    </IntersectionObserverComponent>
  </div>
}
