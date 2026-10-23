import {
  useEffect,
  useRef,
  useState,
  type FunctionComponent,
  type PropsWithChildren
} from 'react'
import { useStateChangeDispatch } from '../../agnostic/@react/effects/use-state-change-dispatch/index.js'
import type { WithClassName } from '../../agnostic/@react/types/index.js'
import { clss } from '../../agnostic/css/clss/index.js'
import { randomHash } from '../../agnostic/random/uuid/index.js'
import { mergeClassNames } from '../../agnostic/css/merge-class-names/index.js'
import { useCommands } from '../utils/commands/index.js'
import {
  compIdAttribute,
  useCompId,
  type WithCompId
} from '../utils/comp-id/index.js'
import { scrollTracker as publicClassName } from '../public-classnames.js'
import {
  getScrollProgress,
  subscribe,
  toScrollCssProps,
  unsubscribe,
  type ScrollState
} from './utils.js'
import cssModule from './styles.module.css'

/**
 * Props for the {@link ScrollTracker} component.
 *
 * @property tracking - Whether the component is measuring, taken over by the consumer.
 * @property defaultTracking - Whether it starts measuring on mount. `true` by default,
 * which is what this component has always done — a starting point and not a setting,
 * hence `default…`.
 * @property onIsTrackingChanged - Called once the effective tracking state changed.
 * @property onScrollStateChanged - Called after the measured {@link ScrollState}
 * changed. Receives `undefined` until the first measurement lands.
 * @property onScrollProgressChanged - Called after the element's vertical outer
 * scroll progress changed: `0` when it is about to enter the viewport, `1` once
 * it has fully left it. Never on mount.
 * @property onScrollDirectionChanged - Called after the document scroll
 * direction changed, with `'up'` or `'down'`. Never on mount.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - React nodes rendered inside the scroll tracker container.
 */
export type Props = WithCompId<PropsWithChildren<WithClassName<{
  tracking?: boolean
  defaultTracking?: boolean
  onIsTrackingChanged?: (isTracking: boolean) => void
  onScrollStateChanged?: (scrollState?: ScrollState) => void
  onScrollProgressChanged?: (progress: number) => void
  onScrollDirectionChanged?: (direction: 'up' | 'down') => void
}>>>

/**
 * Exposes scroll metrics — both the document's and its own — as CSS custom
 * properties on its root element, so scroll-driven styling needs no JavaScript
 * of its own.
 *
 * ### Root element modifiers
 * - `--tracking` — the component is measuring. The state, where `--measured` is its
 *   consequence: a tracker that has stopped keeps its last values, so it can be
 *   measured and no longer tracking.
 * - `--measured` — a first measurement landed, so the properties below are set.
 * - `--scrolling-up` / `--scrolling-down` — the document's last known direction.
 *   Neither is present before the first scroll.
 *
 * ### Commands
 * - `track` / `untrack` — start or stop measuring. Both are ignored while the
 *   `tracking` prop is set, which decides the state on its own.
 *
 * ### CSS custom properties on the root element
 * Each measurement comes as a `px` length under its bare name, and as a `-raw`
 * twin holding the plain number:
 * - `--lm-scroll-tracker-window-width`, `--lm-scroll-tracker-window-height`
 * - `--lm-scroll-tracker-html-width`, `--lm-scroll-tracker-html-height`
 * - `--lm-scroll-tracker-scroll-x`, `--lm-scroll-tracker-scroll-y`
 * - `--lm-scroll-tracker-width`, `--lm-scroll-tracker-height`
 * - `--lm-scroll-tracker-offset-x`, `--lm-scroll-tracker-offset-y`
 *
 * Ratios are unitless and have no twin:
 * - `--lm-scroll-tracker-window-scrolled-x-ratio`,
 *   `--lm-scroll-tracker-window-scrolled-y-ratio` — how far the document is
 *   scrolled.
 * - `--lm-scroll-tracker-self-inner-scrolled-x-ratio`,
 *   `--lm-scroll-tracker-self-inner-scrolled-y-ratio` — `0` when the element's
 *   start edge meets the viewport's start edge, `1` when its end edge meets the
 *   viewport's end edge. The span where it is fully visible.
 * - `--lm-scroll-tracker-self-outer-scrolled-x-ratio`,
 *   `--lm-scroll-tracker-self-outer-scrolled-y-ratio` — `0` when the element is
 *   about to enter the viewport, `1` once it has fully left it. The span where it
 *   overlaps the viewport at all.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A container exposing the metrics, with the children as its own.
 *
 * @remarks
 * **The measurements are published on the root itself.** There is no inner box between
 * this element and the children, and that matters here more than anywhere else in the
 * library: the whole point is a stylesheet animating on the properties this element
 * carries, which it cannot do if what it wants to move sits one level below.
 *
 * All mounted instances share a single pair of `scroll` / `resize` listeners and
 * a single measurement pass per animation frame — the document is measured once
 * for everyone, each element only for itself. The listeners exist only while at
 * least one instance is tracking.
 */
export const ScrollTracker: FunctionComponent<Props> = ({
  compId: givenCompId,
  tracking,
  defaultTracking,
  onIsTrackingChanged,
  onScrollStateChanged,
  onScrollProgressChanged,
  onScrollDirectionChanged,
  className,
  children
}) => {
  const compId = useCompId(givenCompId)

  // State & refs
  const [subscriberId] = useState(() => randomHash(6))
  const [internalTracking, setInternalTracking] = useState(defaultTracking ?? true)
  const [scrollState, setScrollState] = useState<ScrollState>()
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const previousScrollYRef = useRef<number | null>(null)

  const isTracking = tracking ?? internalTracking

  const scrollProgress = scrollState === undefined
    ? undefined
    : getScrollProgress(scrollState).y

  // State dispatch
  useStateChangeDispatch(isTracking, onIsTrackingChanged)
  useStateChangeDispatch(scrollState, onScrollStateChanged)
  useStateChangeDispatch(
    scrollProgress,
    progress => { if (progress !== undefined) onScrollProgressChanged?.(progress) }
  )
  useStateChangeDispatch(
    scrollDirection,
    direction => { if (direction !== null) onScrollDirectionChanged?.(direction) }
  )

  // Commands
  useCommands(compId, {
    track: () => setInternalTracking(true),
    untrack: () => setInternalTracking(false)
  })

  // Fx. dep. `scrollState` - derive the document scroll direction
  useEffect(() => {
    if (scrollState === undefined) return
    const y = scrollState.global.scroll.y
    const previous = previousScrollYRef.current
    previousScrollYRef.current = y
    if (previous === null || y === previous) return
    setScrollDirection(y > previous ? 'down' : 'up')
  }, [scrollState])

  // Fx. dep. `isTracking` - the subscription follows the state, and nothing else opens
  // or closes it. The measurements are left on their last values when it closes: a
  // stylesheet reading `--lm-scroll-tracker-scroll-y` must not see it drop to zero
  // because the element went off screen.
  useEffect(() => {
    if (!isTracking) return
    subscribe(subscriberId, { rootRef, onScrollStateChange: setScrollState })
    return () => unsubscribe(subscriberId)
  }, [isTracking])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(
    c(null, {
      tracking: isTracking,
      measured: scrollState !== undefined,
      'scrolling-up': scrollDirection === 'up',
      'scrolling-down': scrollDirection === 'down'
    }),
    className
  )
  const customProps = scrollState === undefined
    ? {}
    : toScrollCssProps(scrollState)
  return <div
    {...compIdAttribute(compId)}
    className={rootClss}
    ref={rootRef}
    style={{ ...customProps }}>
    {children}
  </div>
}
