import {
  useEffect,
  useRef,
  useState,
  type FunctionComponent,
  type PropsWithChildren,
  useCallback
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { randomHash } from '../../agnostic/random/uuid/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import {
  IntersectionObserverComponent,
  Props as IOProps
} from '../IntersectionObserver/index.js'
import { scrollListener as publicClassName } from '../public-classnames.js'
import { register, unregister, type ScrollState } from './utils.js'
import cssModule from './styles.module.css'

/**
 * Props for the ScrollListener component.
 *
 * @property startOnVisible - When `true`, scroll tracking starts only when the component
 * becomes visible in the viewport. Visibility is detected using an IntersectionObserver.
 * @property stopOnHidden - When `true`, scroll tracking stops when the component leaves
 * the viewport.
 * @property stateHandlers - Optional callbacks invoked when internal state changes.
 * @property stateHandlers.scrollDataChanged - Called whenever the computed scroll data
 * changes. Receives the current {@link ScrollState} or `undefined`.
 * @property stateHandlers.visibilityChanged - Called when the visibility state of the
 * component changes. Receives `true` when the component is intersecting the viewport,
 * otherwise `false`.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - React nodes rendered inside the scroll listener container.
 */
export type Props = PropsWithChildren<WithClassName<{
  stopOnHidden?: boolean
  startOnVisible?: boolean
  stateHandlers?: {
    scrollDataChanged?: (scrollData?: ScrollState) => void
    visibilityChanged?: (isVisible: boolean) => void
  }
}>>

/**
 * Component that listens to global scroll events and exposes scroll-related data
 * through CSS custom properties and optional state callbacks.
 *
 * The component measures both global scroll metrics (window size, document size,
 * scroll offsets) and local metrics relative to the component (dimensions and
 * position within the document).
 *
 * Computed values are exposed as CSS variables on the root element, enabling
 * scroll-driven styling without additional JavaScript.
 *
 * Scroll observation can optionally start only when the component becomes visible
 * and stop when it leaves the viewport.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A container element exposing scroll metrics through CSS variables and
 * wrapping its children inside an IntersectionObserver boundary.
 */
export const ScrollListener: FunctionComponent<Props> = ({
  startOnVisible,
  stopOnHidden,
  stateHandlers,
  className,
  children
}) => {
  const [privateId] = useState(randomHash(6))
  const [scrollData, setScrollData] = useState<ScrollState>()
  const rootRef = useRef<HTMLDivElement>(null)

  // Fx. dep. `scrollData` - State dispatcher
  useEffect(() => {
    stateHandlers?.scrollDataChanged?.(scrollData)
  }, [scrollData])
  
  // Fx. no dep. - register / unregister to scroll listeners
  useEffect(() => {
    register({ id: privateId, rootRef, setData: setScrollData })
    return () => { unregister(privateId) }
  }, [])

  const handleIntersection = useCallback<NonNullable<IOProps['onIntersected']>>(({ ioEntry, observer }) => {
    stateHandlers?.visibilityChanged?.(ioEntry?.isIntersecting ?? false)
    if (startOnVisible !== true && stopOnHidden !== true) return
    if (ioEntry?.isIntersecting === true && startOnVisible === true) register({ id: privateId, rootRef, setData: setScrollData })
    if (ioEntry?.isIntersecting !== true && stopOnHidden === true) unregister(privateId)
  }, [startOnVisible, stopOnHidden])

  // Rendering
  const customProps: Record<string, number | string> = Object.entries(scrollData !== undefined ? {
    // Global
    [`--${publicClassName}-window-width`]: scrollData.global.win.width,
    [`--${publicClassName}-window-height`]: scrollData.global.win.height,
    [`--${publicClassName}-html-width`]: scrollData.global.html.width,
    [`--${publicClassName}-html-height`]: scrollData.global.html.height,
    [`--${publicClassName}-scroll-x`]: scrollData.global.scroll.x,
    [`--${publicClassName}-scroll-y`]: scrollData.global.scroll.y,
    // Local
    [`--${publicClassName}-width`]: scrollData.local.width,
    [`--${publicClassName}-height`]: scrollData.local.height,
    [`--${publicClassName}-offset-x`]: scrollData.local.offsetX,
    [`--${publicClassName}-offset-y`]: scrollData.local.offsetY,
  } : {}).reduce<Record<string, number | string>>((acc, [key, val]) => {
    return {
      ...acc,
      [key]: val,
      [`${key}-px`]: `${val}px`
    }
  }, {})

  if (scrollData !== undefined) {
    customProps[`--${publicClassName}-window-scrolled-x-ratio`] = (scrollData.global.scroll.x) / Math.max((scrollData.global.html.width - scrollData.global.win.width), 1)
    customProps[`--${publicClassName}-window-scrolled-y-ratio`] = (scrollData.global.scroll.y) / Math.max((scrollData.global.html.height - scrollData.global.win.height), 1)
    const topTouchesTop = scrollData.local.offsetY
    const topTouchesBottom = scrollData.local.offsetY - scrollData.global.win.height
    const bottomTouchesTop = scrollData.local.offsetY + scrollData.local.height
    const bottomTouchesBottom = (scrollData.local.offsetY + scrollData.local.height) - scrollData.global.win.height
    const leftTouchesLeft = scrollData.local.offsetX
    const leftTouchesRight = scrollData.local.offsetX - scrollData.global.win.width
    const rightTouchesLeft = scrollData.local.offsetX + scrollData.local.width
    const rightTouchesRight = (scrollData.local.offsetX + scrollData.local.width) - scrollData.global.win.width
    const innerYRange = [bottomTouchesBottom, topTouchesTop] as const
    const outerYRange = [topTouchesBottom, bottomTouchesTop] as const
    const innerXRange = [rightTouchesRight, leftTouchesLeft] as const
    const outerXRange = [leftTouchesRight, rightTouchesLeft] as const
    const innerScrollYRatio = (scrollData.global.scroll.y - innerYRange[0]) / Math.max((innerYRange[1] - innerYRange[0]), 1)
    const outerScrollYRatio = (scrollData.global.scroll.y - outerYRange[0]) / Math.max((outerYRange[1] - outerYRange[0]), 1)
    const innerScrollXRatio = (scrollData.global.scroll.x - innerXRange[0]) / Math.max((innerXRange[1] - innerXRange[0]), 1)
    const outerScrollXRatio = (scrollData.global.scroll.x - outerXRange[0]) / Math.max((outerXRange[1] - outerXRange[0]), 1)
    customProps[`--${publicClassName}-self-inner-scrolled-y-ratio`] = innerScrollYRatio
    customProps[`--${publicClassName}-self-outer-scrolled-y-ratio`] = outerScrollYRatio
    customProps[`--${publicClassName}-self-inner-scrolled-x-ratio`] = innerScrollXRatio
    customProps[`--${publicClassName}-self-outer-scrolled-x-ratio`] = outerScrollXRatio
  }
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(
    c(),
    className
  )

  return <div
    className={rootClss}
    ref={rootRef}
    style={{ ...customProps }}>
    <IntersectionObserverComponent
      onIntersected={handleIntersection}>
      {children}
    </IntersectionObserverComponent>
  </div>
}
