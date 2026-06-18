import {
  type MouseEventHandler,
  type ReactNode,
  type TouchEventHandler,
  useRef,
  type FunctionComponent
} from 'react'
import { clamp } from '../../agnostic/numbers/clamp/index.js'
import { clss } from '../../agnostic/css/clss/index.js'
import { mergeClassNames } from '../utils/index.js'
import type { WithClassName } from '../utils/types.js'
import { beforeAfter as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

export type Props = WithClassName<{
  ratio?: number
  before?: ReactNode
  after?: ReactNode
  actionHandlers?: {
    dragged?: (xRatio: number, yRatio: number) => void
    clicked?: (xRatio: number, yRatio: number) => void
  }
}>

export const BeforeAfterControlled: FunctionComponent<Props> = ({
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
  const rootClss = mergeClassNames(c(), className)
  const beforeClass = c('before')
  const afterClass = c('after')
  const customProps: Record<string, string> = {
    [`--${publicClassName}-ratio`]: `${ratio}`,
    [`--${publicClassName}-ratio-percent`]: `${ratio * 100}%`
  }
  const dataAttributes: Record<string, string> = {
    'data-ratio': `${ratio}`
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
    <div style={{ width: 200, height: 200, background: 'red' }}></div>
    <div className={beforeClass}>{before}</div>
    <div className={afterClass}>{after}</div>
  </div>
}
