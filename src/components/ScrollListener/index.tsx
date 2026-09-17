import {
  useEffect,
  useRef,
  useState,
  type FunctionComponent,
  type PropsWithChildren
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { randomHash } from '../../agnostic/random/uuid/index.js'
import type { WithClassName } from '../utils/types.js'
import {
  mergeClassNames,
  useChangeDispatch
} from '../utils/index.js'
import { useViewportBehaviours } from '../utils/viewport-behaviours/index.js'
import type {
  ActionTable,
  ViewportBehaviours
} from '../utils/viewport-behaviours/types.js'
import { scrollListener as publicClassName } from '../public-classnames.js'
import {
  getScrollProgress,
  subscribe,
  toScrollCssProps,
  unsubscribe,
  type ScrollState
} from './utils.js'
import cssModule from './styles.module.css'
import type {
  ScrollListenerAction,
  ScrollListenerDomain,
  ScrollListenerVerb
} from './types.js'

/**
 * Props for the {@link ScrollListener} component.
 *
 * @property tracking - Whether the component is measuring, taken over by the consumer.
 * Provided, it is the whole answer and the instructions no longer reach it.
 * @property defaultTracking - Whether it starts measuring on mount. `true` by default,
 * which is what this component has always done — a starting point and not a setting,
 * hence `default…`. `defaultTracking={false}` with `whenVisible='track'` is the old
 * `startOnVisible`, written in the shared grammar.
 * @property behavioursSuspended - Holds back the instructions that **start** something,
 * and lets through those that stop it. A gate reaches `'track'`: measuring a subtree
 * nobody is being shown is work done for no one.
 * @property onIsTrackingChanged - Called once the effective tracking state changed.
 * @property onScrollStateChanged - Called after the measured {@link ScrollState}
 * changed. Receives `undefined` until the first measurement lands.
 * @property onVisibilityChanged - Called when the component enters or leaves the
 * viewport, on the **settled** state — the `visibility…` delays included, so a consumer
 * watching visibility and a consumer running instructions are told the same story.
 * @property onScrollProgressChanged - Called after the element's vertical outer
 * scroll progress changed: `0` when it is about to enter the viewport, `1` once
 * it has fully left it. Never on mount.
 * @property onScrollDirectionChanged - Called after the document scroll
 * direction changed, with `'up'` or `'down'`. Never on mount.
 * @property visibilityThreshold - How much of the component has to be in view before it
 * counts as visible. See `VisibilityOptions` for this and the four that follow it.
 * @property visibilityRoot - The box visibility is measured against.
 * @property visibilityRootMargin - Grows or shrinks that box before measuring.
 * @property visibilityOnAfterMs - How long it must stay visible to count as visible.
 * @property visibilityOffAfterMs - The same, on the way out.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - React nodes rendered inside the scroll listener container.
 */
export type Props = PropsWithChildren<WithClassName<{
  tracking?: boolean
  defaultTracking?: boolean
  onIsTrackingChanged?: (isTracking: boolean) => void
  onScrollStateChanged?: (scrollState?: ScrollState) => void
  onScrollProgressChanged?: (progress: number) => void
  onScrollDirectionChanged?: (direction: 'up' | 'down') => void
}>>
  & ViewportBehaviours<ScrollListenerAction>
  & { behavioursSuspended?: boolean }

/**
 * Exposes scroll metrics — both the document's and its own — as CSS custom
 * properties on its root element, so scroll-driven styling needs no JavaScript
 * of its own.
 *
 * ### Root element modifiers
 * - `--tracking` — the component is measuring. The state, where `--measured` is its
 *   consequence: a listener that has stopped keeps its last values, so it can be
 *   measured and no longer tracking.
 * - `--measured` — a first measurement landed, so the properties below are set.
 * - `--scrolling-up` / `--scrolling-down` — the document's last known direction.
 *   Neither is present before the first scroll.
 *
 * ### CSS custom properties on the root element
 * Each measurement comes as a `px` length under its bare name, and as a `-raw`
 * twin holding the plain number:
 * - `--lm-scroll-listener-window-width`, `--lm-scroll-listener-window-height`
 * - `--lm-scroll-listener-html-width`, `--lm-scroll-listener-html-height`
 * - `--lm-scroll-listener-scroll-x`, `--lm-scroll-listener-scroll-y`
 * - `--lm-scroll-listener-width`, `--lm-scroll-listener-height`
 * - `--lm-scroll-listener-offset-x`, `--lm-scroll-listener-offset-y`
 *
 * Ratios are unitless and have no twin:
 * - `--lm-scroll-listener-window-scrolled-x-ratio`,
 *   `--lm-scroll-listener-window-scrolled-y-ratio` — how far the document is
 *   scrolled.
 * - `--lm-scroll-listener-self-inner-scrolled-x-ratio`,
 *   `--lm-scroll-listener-self-inner-scrolled-y-ratio` — `0` when the element's
 *   start edge meets the viewport's start edge, `1` when its end edge meets the
 *   viewport's end edge. The span where it is fully visible.
 * - `--lm-scroll-listener-self-outer-scrolled-x-ratio`,
 *   `--lm-scroll-listener-self-outer-scrolled-y-ratio` — `0` when the element is
 *   about to enter the viewport, `1` once it has fully left it. The span where it
 *   overlaps the viewport at all.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A container exposing the metrics, with the children as its own.
 *
 * @remarks
 * **Viewport-driven behaviour is declared, not named by a prop.** `whenVisible` and
 * `whenHidden` take `'track'`, `'untrack'`, or a list, each optionally suffixed by
 * `':once'` and `':force'`. The old `startOnVisible` is `defaultTracking={false}` plus
 * `whenVisible='track'`, and `stopOnHidden` is `whenHidden='untrack'`. See
 * `components/utils/viewport-behaviours` for the grammar, and the `visibility…` props for
 * what « visible » means and how long it has to have been true.
 *
 * **The observer runs on the root itself.** There is no inner box between this element
 * and the children any more, and that matters here more than anywhere else in the
 * library: the whole point is a stylesheet animating on the properties this element
 * carries, which it cannot do if what it wants to move sits one level below.
 *
 * All mounted instances share a single pair of `scroll` / `resize` listeners and
 * a single measurement pass per animation frame — the document is measured once
 * for everyone, each element only for itself. The listeners exist only while at
 * least one instance is tracking.
 */
export const ScrollListener: FunctionComponent<Props> = ({
  tracking,
  defaultTracking,
  behavioursSuspended,
  visibilityThreshold,
  visibilityRoot,
  visibilityRootMargin,
  visibilityOnAfterMs,
  visibilityOffAfterMs,
  whenVisible,
  whenHidden,
  onIsTrackingChanged,
  onScrollStateChanged,
  onVisibilityChanged,
  onScrollProgressChanged,
  onScrollDirectionChanged,
  className,
  children
}) => {
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

  // Viewport behaviours

  // Measuring is the only thing this component does, so starting and stopping it is the
  // whole vocabulary. `track` and `untrack` need no guard against a controlled
  // `tracking`: the effective state reads the prop first, so the internal one they write
  // is simply never consulted.
  const actions: ActionTable<ScrollListenerVerb, ScrollListenerDomain> = {
    track: { kind: 'start', domain: 'tracking', run: () => setInternalTracking(true) },
    untrack: { kind: 'stop', domain: 'tracking', run: () => setInternalTracking(false) }
  }

  // The surrender half of the result is dropped: this component has no control a reader
  // could take over. The observer runs on the root itself — there is no inner box any
  // more, and that matters more here than anywhere: a stylesheet reads the measurements
  // off this element, so its children have to be its children.
  useViewportBehaviours<ScrollListenerAction>(
    rootRef,
    {
      visibilityThreshold,
      visibilityRoot,
      visibilityRootMargin,
      visibilityOnAfterMs,
      visibilityOffAfterMs,
      whenVisible,
      whenHidden,
      onVisibilityChanged
    },
    actions,
    behavioursSuspended === true
  )

  // State dispatch
  useChangeDispatch(isTracking, onIsTrackingChanged)
  useChangeDispatch(scrollState, onScrollStateChanged)
  useChangeDispatch(
    scrollProgress,
    progress => { if (progress !== undefined) onScrollProgressChanged?.(progress) }
  )
  useChangeDispatch(
    scrollDirection,
    direction => { if (direction !== null) onScrollDirectionChanged?.(direction) }
  )

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
  // stylesheet reading `--lm-scroll-listener-scroll-y` must not see it drop to zero
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
    className={rootClss}
    ref={rootRef}
    style={{ ...customProps }}>
    {children}
  </div>
}
