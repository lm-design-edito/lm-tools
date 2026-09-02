import {
  type FunctionComponent,
  type MouseEventHandler,
  type PropsWithChildren,
  type ReactNode,
  type TouchEventHandler,
  useRef
} from 'react'
import { clamp } from '../../agnostic/numbers/clamp/index.js'
import { round } from '../../agnostic/numbers/round/index.js'
import { clss } from '../../agnostic/css/clss/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { beforeAfter as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Props for the {@link ControlledBeforeAfter} component.
 *
 * @property mode - Layout orientation of the split. Defaults to `'horizontal'`.
 * @property ratio - Position of the divider, between `0` and `1`. Values outside
 * that range are clamped. Defaults to `0`.
 * @property before - Content rendered in the first (before) panel.
 * @property after - Content rendered in the second (after) panel.
 * @property onDragged - Called on each pointer move while dragging, with the
 * pointer's x and y ratios relative to the component's bounds.
 * @property onClicked - Called on pointer release when no drag occurred, with
 * the release position's x and y ratios.
 * @property className - Additional class name(s) applied to the root element.
 * @property children - Arbitrary content to inject inside the component.
 */
export type Props = PropsWithChildren<WithClassName<{
  mode?: 'vertical' | 'horizontal'
  ratio?: number
  before?: ReactNode
  after?: ReactNode
  onDragged?: (xRatio: number, yRatio: number) => void
  onClicked?: (xRatio: number, yRatio: number) => void
}>>

/**
 * Controlled before/after comparison component.
 *
 * Renders two content panels separated by a divider whose position is expressed
 * as a ratio between `0` and `1`. Handles both mouse and touch input, telling a
 * click apart from a drag.
 *
 * The active ratio is exposed as:
 * - CSS custom properties `--lm-before-after-ratio` and
 * `--lm-before-after-ratio-percent`,
 * - a `data-ratio` attribute on the root element.
 *
 * ### CSS modifiers
 * - `horizontal` — applied when `mode` is `'horizontal'`.
 * - `vertical` — applied when `mode` is `'vertical'`.
 *
 * ### CSS elements
 * - `before`
 * - `after`
 * - `separator`
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A split-panel container reporting pointer interactions as ratios.
 *
 * @remarks
 * The component holds no ratio state: it only reports where the pointer is, and
 * renders whatever `ratio` it is given. Turning one into the other is the
 * uncontrolled wrapper's job.
 */
export const ControlledBeforeAfter: FunctionComponent<Props> = ({
  mode = 'horizontal',
  ratio = 0,
  before,
  after,
  className,
  children,
  onDragged,
  onClicked
}) => {
  // State & refs
  const rootRef = useRef<HTMLDivElement>(null)
  const isPointerDown = useRef(false)
  const hasDragged = useRef(false)

  // Utils
  const getRatios = (clientX: number, clientY: number): { xRatio: number, yRatio: number } | null => {
    const rect = rootRef.current?.getBoundingClientRect()
    if (rect === undefined) return null
    return {
      xRatio: (clientX - rect.left) / rect.width,
      yRatio: (clientY - rect.top) / rect.height
    }
  }
  const reportDrag = (clientX: number, clientY: number): void => {
    const ratios = getRatios(clientX, clientY)
    if (ratios !== null) onDragged?.(ratios.xRatio, ratios.yRatio)
  }
  const reportClick = (clientX: number, clientY: number): void => {
    const ratios = getRatios(clientX, clientY)
    if (ratios !== null) onClicked?.(ratios.xRatio, ratios.yRatio)
  }

  // User action handlers
  const handlePointerDown = (): void => {
    isPointerDown.current = true
    hasDragged.current = false
  }
  const handlePointerUp = (): void => {
    isPointerDown.current = false
    hasDragged.current = false
  }
  const handleMouseMove: MouseEventHandler<HTMLDivElement> = event => {
    if (!isPointerDown.current) return
    hasDragged.current = true
    reportDrag(event.clientX, event.clientY)
  }
  const handleMouseUp: MouseEventHandler<HTMLDivElement> = event => {
    if (!hasDragged.current) reportClick(event.clientX, event.clientY)
    handlePointerUp()
  }
  const handleTouchMove: TouchEventHandler<HTMLDivElement> = event => {
    const touch = event.touches[0]
    if (touch === undefined) return
    if (!isPointerDown.current) return
    hasDragged.current = true
    reportDrag(touch.clientX, touch.clientY)
  }
  const handleTouchEnd: TouchEventHandler<HTMLDivElement> = event => {
    const touch = event.changedTouches[0]
    if (!hasDragged.current && touch !== undefined) reportClick(touch.clientX, touch.clientY)
    handlePointerUp()
  }

  // Rendering
  const clampedRatio = clamp(ratio, 0, 1)
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
    horizontal: mode === 'horizontal',
    vertical: mode === 'vertical'
  }), className)
  const roundedRatio = round(clampedRatio, 4)
  const customProps: Record<string, string> = {
    '--lm-before-after-ratio': `${roundedRatio}`,
    '--lm-before-after-ratio-percent': `${round(clampedRatio * 100, 2)}%`
  }
  return <div
    ref={rootRef}
    className={rootClss}
    onMouseDown={handlePointerDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onTouchStart={handlePointerDown}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    style={{ ...customProps }}
    data-ratio={roundedRatio}>
    <div className={c('before')}>{before}</div>
    <div className={c('after')}>{after}</div>
    <div className={c('separator')} />
    {children}
  </div>
}
