import {
  type MouseEventHandler,
  type ReactNode,
  type TouchEventHandler,
  useRef,
  type FunctionComponent
} from 'react'
import { clamp } from '../../agnostic/numbers/clamp/index.js'
import { round } from '../../agnostic/numbers/round/index.js'
import { clss } from '../../agnostic/css/clss/index.js'
import { mergeClassNames } from '../utils/index.js'
import type { WithClassName } from '../utils/types.js'
import { beforeAfter as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Props for the {@link BeforeAfterControlled} component.
 *
 * Extends {@link WithClassName} with layout, content, and interaction configuration.
 *
 * @property mode - Layout orientation of the split. Defaults to `'horizontal'`.
 * @property ratio - Position of the divider as a value between `0` and `1`.
 * Values outside this range are clamped automatically. Defaults to `0`.
 * @property before - Content rendered in the first (before) panel.
 * @property after - Content rendered in the second (after) panel.
 * @property actionHandlers - Optional user action callbacks:
 *   - `dragged` — called on each pointer move while dragging, with the current
 *     x and y ratios relative to the component bounds.
 *   - `clicked` — called on pointer release when no drag occurred, with the
 *     x and y ratios of the release position.
 * @property className - Additional class name(s) applied to the root element.
 */
export type Props = WithClassName<{
  mode?: 'vertical' | 'horizontal'
  ratio?: number
  before?: ReactNode
  after?: ReactNode
  actionHandlers?: {
    dragged?: (xRatio: number, yRatio: number) => void
    clicked?: (xRatio: number, yRatio: number) => void
  }
}>

/**
 * Controlled before/after comparison component.
 *
 * Renders two content panels separated by a draggable divider whose position
 * is expressed as a ratio between `0` and `1`. Supports both mouse and touch
 * interactions, distinguishing clicks from drags.
 *
 * The active ratio is exposed as:
 * - CSS custom properties:
 *   - `--{prefix}-ratio`
 *   - `--{prefix}-ratio-percent`
 * - A `data-ratio` attribute on the root element.
 *
 * ### CSS modifiers
 * - `horizontal` — applied when `mode` is `'horizontal'`.
 * - `vertical` — applied when `mode` is `'vertical'`.
 *
 * ### CSS elements
 * - `before`
 * - `after`
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A split-panel container with pointer interaction handlers and ratio state applied.
 */
export const BeforeAfterControlled: FunctionComponent<Props> = ({
  mode = 'horizontal',
  ratio = 0,
  before,
  after,
  className,
  actionHandlers
}) => {
  ratio = clamp(ratio, 0, 1)

  // State & refs
  const rootRef = useRef<HTMLDivElement>(null)
  const isPointerDown = useRef(false)
  const hasDragged = useRef(false)

  // Utils
  const getRatios = (clientX: number, clientY: number) => {
    const rect = rootRef.current?.getBoundingClientRect()
    if (rect === undefined) return null
    return {
      xRatio: (clientX - rect.left) / rect.width,
      yRatio: (clientY - rect.top) / rect.height
    }
  }

  // Handlers
  const handleMouseDown: MouseEventHandler<HTMLDivElement> = event => {
    isPointerDown.current = true
    hasDragged.current = false
  }
  const handleMouseMove: MouseEventHandler<HTMLDivElement> = event => {
    if (!isPointerDown.current) return
    hasDragged.current = true
    const ratios = getRatios(event.clientX, event.clientY)
    if (ratios !== null) actionHandlers?.dragged?.(ratios.xRatio, ratios.yRatio)
  }
  const handleMouseUp: MouseEventHandler<HTMLDivElement> = event => {
    if (!hasDragged.current) {
      const ratios = getRatios(event.clientX, event.clientY)
      if (ratios !== null) actionHandlers?.clicked?.(ratios.xRatio, ratios.yRatio)
    }
    isPointerDown.current = false
    hasDragged.current = false
  }
  const handleTouchStart: TouchEventHandler<HTMLDivElement> = event => {
    isPointerDown.current = true
    hasDragged.current = false
  }
  const handleTouchMove: TouchEventHandler<HTMLDivElement> = event => {
    const t = event.touches[0]
    if (t === undefined) return
    if (!isPointerDown.current) return
    hasDragged.current = true
    const ratios = getRatios(t.clientX, t.clientY)
    if (ratios !== null) actionHandlers?.dragged?.(ratios.xRatio, ratios.yRatio)
  }
  const handleTouchEnd: TouchEventHandler<HTMLDivElement> = event => {
    if (!hasDragged.current) {
      const t = event.changedTouches[0]
      if (t !== undefined) {
        const ratios = getRatios(t.clientX, t.clientY)
        if (ratios !== null) actionHandlers?.clicked?.(ratios.xRatio, ratios.yRatio)
      }
    }
    isPointerDown.current = false
    hasDragged.current = false
  }

  // Classes & attributes
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
    horizontal: mode === 'horizontal',
    vertical: mode === 'vertical'
  }), className)
  const beforeClass = c('before')
  const afterClass = c('after')
  const separatorClass = c('separator')
  const customProps: Record<string, string> = {
    [`--${publicClassName}-ratio`]: `${round(ratio, 4)}`,
    [`--${publicClassName}-ratio-percent`]: `${round(ratio * 100, 2)}%`
  }
  const dataAttributes: Record<string, string> = {
    'data-ratio': `${round(ratio, 4)}`
  }

  // Rendering
  return <div
    ref={rootRef}
    className={rootClss}
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    style={{ ...customProps }}
    {...dataAttributes}>
    <div className={beforeClass}>{before}</div>
    <div className={afterClass}>{after}</div>
    <div className={separatorClass} />
  </div>
}
