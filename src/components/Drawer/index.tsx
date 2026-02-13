import {
  type PropsWithChildren,
  type JSX,
  type FunctionComponent,
  type ReactNode,
  useState
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { drawer as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'
import { ResizeObserverComponent } from '../ResizeObserver/index.js'

/**
 * Props for the Drawer component.
 *
 * @property openerContent - Content rendered inside the opener control.
 * @property closerContent - Content rendered inside the closer control.
 * @property initialIsOpened - Initial open state in uncontrolled mode.
 * Ignored when `isOpened` is provided.
 * @property isOpened - Controlled open state. When defined, the component
 * behaves as a controlled component and internal state is ignored.
 * @property onToggle - Callback invoked when the open state changes due to
 * user interaction (only in uncontrolled mode). Receives the next state.
 * @property className - Additional class name(s) applied to the root element.
 * @property children - Drawer content.
 */
export type Props = PropsWithChildren<WithClassName<{
  openerContent?: ReactNode
  closerContent?: ReactNode
  initialIsOpened?: boolean
  isOpened?: boolean
  onToggle?: (isOpen: boolean) => void
}>>

/**
 * Drawer component with optional controlled and uncontrolled behavior.
 *
 * @remarks
 * - In controlled mode (`isOpened` defined), visibility is fully driven by the prop.
 * - In uncontrolled mode, internal state is initialized from `initialIsOpened`.
 * - The component measures its content using `ResizeObserverComponent`
 *   and exposes the dimensions:
 *   - As CSS custom properties:
 *     --{prefix}-content-height
 *     --{prefix}-content-height-px
 *     --{prefix}-content-width
 *     --{prefix}-content-width-px
 *   - As `data-content-width` and `data-content-height` attributes.
 *
 * CSS modifier classes:
 * - `opened` when open
 * - `closed` when closed
 */
export const Drawer: FunctionComponent<Props> = ({
  openerContent,
  closerContent,
  initialIsOpened = false,
  isOpened: isOpenedProp,
  onToggle,
  className,
  children
}): JSX.Element => {
  // State & handlers
  const [internalIsOpened, setInternalIsOpened] = useState(isOpenedProp ?? initialIsOpened)
  const isOpened = isOpenedProp ?? internalIsOpened
  const [{ width, height }, setContentDimensions] = useState<{
    width?: number
    height?: number
  }>({})
  const handleOpenerClick = (): void => {
    if (isOpenedProp !== undefined) return
    setInternalIsOpened(true)
    onToggle?.(true)
  }
  const handleCloserClick = (): void => {
    if (isOpenedProp !== undefined) return
    setInternalIsOpened(false)
    onToggle?.(false)
  }
  const handleROCompResize = (entry?: ResizeObserverEntry): void => {
    const { width, height } = entry?.contentRect ?? {}
    setContentDimensions({ width, height })
  }

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
    'opened': isOpened,
    'closed': !isOpened
  }), className)
  const openerClss = c('opener')
  const closerClss = c('closer')
  const contentClss = c('content')
  const dimensions = { width, height }
  const customCssProps: Record<string, string> = Object
    .entries(dimensions)
    .reduce((acc, [key, val]) => {
      if (val === undefined) return acc
      return {
        ...acc,
        [`--${publicClassName}-content-${key}`]: `${val}`,
        [`--${publicClassName}-content-${key}px`]: `${val}px`
      }
    }, {})
  const dataAttributes: Record<string, string> = Object
    .entries(dimensions)
    .reduce((acc, [key, val]) => {
      if (val === undefined) return acc
      return { ...acc, [`data-content-${key}`]: `${val}` }
    }, {})
  return <div
    className={rootClss}
    {...dataAttributes}
    style={{ ...customCssProps }}>
    <div className={openerClss} onClick={handleOpenerClick}>{openerContent}</div>
    <div className={closerClss} onClick={handleCloserClick}>{closerContent}</div>
    <div className={contentClss}>
      <ResizeObserverComponent onResize={handleROCompResize}>
        {children}
      </ResizeObserverComponent>
    </div>
  </div>
}
