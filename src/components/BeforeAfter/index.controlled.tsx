import React, {
  useCallback,
  useRef,
  type FunctionComponent,
  type HTMLAttributes
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { clamp } from '../../agnostic/numbers/clamp/index.js'
import { mergeClassNames } from '../utils/index.js'
import type { WithClassName } from '../utils/types.js'
import { beforeAfter as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'
import { getRelativePointerCoordinates } from './utils.js'

export type Props = WithClassName<{
  content?: React.ReactNode
  beforeContent?: React.ReactNode
  afterContent?: React.ReactNode
  ratio?: number
  actionHandlers?: {
    pointer?: (
      e: PointerEvent,
      targetHRatio: number,
      targetVRatio: number,
      ratio: number | null,
      element: HTMLDivElement
    ) => void
  }
  _modifiers?: {
    horizontal?: boolean
    vertical?: boolean
  }
}> & HTMLAttributes<HTMLDivElement>

/**
 * Props for the {@link BeforeAfterControlled} component.
 *
 * @property beforeContent - Content shown first.
 * @property afterContent - Content shown second.
 * @property ratio - Split ratio (0 to 1). Controlled by parent.
 * @property actionHandlers - Optional pointer (drag) callbacks:
 *   - `pointer` — called on pointer events with ratio and element info.
 * @property _modifiers - Orientation modifiers: `horizontal` or `vertical`.
 * @property className - Custom CSS class.
 *
 * @see {@link BeforeAfter}
 */

/**
 * Controlled before/after slider component. Renders two contents separated by a slider,
 * whose ratio is managed by the parent component. Handles pointer interactions (mouse/touch/pen)
 * to update the ratio via callbacks.
 *
 * ### Forwarded CSS custom properties
 * - `--before-after-ratio` — the current ratio value (0 to 1, fixed to 8 decimals).
 * - `--before-after-ratio-percent` — the current ratio as a percentage (0 to 100).
 *
 * ### Forwarded data attributes
 * - `data-ratio` — the current ratio value.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @see {@link BeforeAfter}
 * @returns A div containing used to render "before/after" content, with pointer event handling for ratio updates.
 */
export const BeforeAfterControlled: FunctionComponent<Props> = ({
  beforeContent,
  afterContent,
  className,
  ratio,
  actionHandlers,
  _modifiers,
  ...intrisicDivHTMLAttributes
}) => {
  // Rendering
  const isPointerDown = useRef(false)
  const onPointerUpRef = useRef<(e: PointerEvent) => unknown | null>(null)
  const onPointerMoveRef = useRef<(e: PointerEvent) => unknown | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const handleOnPointer = useCallback((event: PointerEvent) => {
    if (actionHandlers?.pointer === undefined || rootRef.current === null) return
    const { x, y } = getRelativePointerCoordinates(event, rootRef.current)
    const ratioX = clamp(x / rootRef.current.clientWidth, 0, 1)
    const ratioY = clamp(y / rootRef.current.clientHeight, 0, 1)
    actionHandlers?.pointer?.(event, ratioX, ratioY, ratio ?? null, rootRef.current)
  }, [actionHandlers?.pointer, ratio])

  const removePointerListeners = useCallback(() => {
    if (onPointerUpRef.current !== null) {
      document.removeEventListener('pointerup', onPointerUpRef.current)
    }
    if (onPointerMoveRef.current !== null) {
      document.removeEventListener('pointermove', onPointerMoveRef.current)
    }
    onPointerUpRef.current = null
    onPointerMoveRef.current = null
  }, [])

  const onPointerMove = useCallback((event: PointerEvent) => {
    if (!isPointerDown.current) {
      return
    }
    handleOnPointer(event)
  }, [handleOnPointer])

  const onPointerUp = useCallback((event: PointerEvent) => {
    isPointerDown.current = false
    removePointerListeners()
  }, [removePointerListeners])

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    removePointerListeners()

    isPointerDown.current = true
    handleOnPointer(event.nativeEvent)

    onPointerUpRef.current = onPointerUp
    onPointerMoveRef.current = onPointerMove
    document.addEventListener('pointermove', onPointerMoveRef.current)
    document.addEventListener('pointerup', onPointerUpRef.current)
  }, [handleOnPointer, onPointerUp, onPointerMove, removePointerListeners])

  const outputRatio = ratio !== undefined ? Math.max(0, Math.min(1, ratio)) : 0
  const rootStyles: Record<string, string> = {
    [`--${publicClassName}-ratio`]: outputRatio.toFixed(8),
    [`--${publicClassName}-ratio-percent`]: `${(outputRatio * 100).toString()}%`
  }

  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, _modifiers), className)
  const rootAttributes = {
    'data-ratio': ratio
  }
  const beforeClass = c('before')
  const afterClass = c('after')

  return <div
    className={rootClss}
    style={rootStyles}
    onPointerDown={onPointerDown}
    ref={rootRef}
    {...rootAttributes}
    {...intrisicDivHTMLAttributes}>
      <div className={beforeClass}>{beforeContent}</div>
      <div className={afterClass}>{afterContent}</div>
  </div>
}
