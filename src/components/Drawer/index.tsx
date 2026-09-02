import {
  type PropsWithChildren,
  type FunctionComponent,
  type ReactNode,
  useState
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import {
  ResizeObserverComponent,
  type Props as ResizeObserverProps
} from '../ResizeObserver/index.js'
import type { WithClassName } from '../utils/types.js'
import {
  mergeClassNames,
  useChangeDispatch
} from '../utils/index.js'
import { drawer as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Props for the {@link Drawer} component.
 *
 * @property openerContent - Content rendered inside the opener control.
 * @property closerContent - Content rendered inside the closer control.
 * @property defaultIsOpened - Initial open state in uncontrolled mode.
 * Ignored when `isOpened` is provided. Defaults to `false`.
 * @property isOpened - Controlled open state. When defined, the component
 * behaves as a controlled component and internal state is never updated.
 * @property onOpenerClicked - Called when the opener is clicked, before the
 * drawer reacts, with the open state as it was.
 * @property onCloserClicked - Called when the closer is clicked, before the
 * drawer reacts, with the open state as it was.
 * @property onIsOpenedChanged - Called after the open state changed, with the
 * new value.
 * @property className - Additional class name(s) applied to the root element.
 * @property children - Drawer content.
 */
export type Props = PropsWithChildren<WithClassName<{
  openerContent?: ReactNode
  closerContent?: ReactNode
  defaultIsOpened?: boolean
  isOpened?: boolean
  onOpenerClicked?: (isOpened: boolean) => void
  onCloserClicked?: (isOpened: boolean) => void
  onIsOpenedChanged?: (isOpened: boolean) => void
}>>

/**
 * Drawer component supporting controlled and uncontrolled usage.
 *
 * The content is measured through a {@link ResizeObserverComponent} so its
 * dimensions can drive the open/close transition from CSS alone.
 *
 * ### CSS modifiers
 * - `opened` — the drawer is open.
 * - `closed` — the drawer is closed.
 *
 * ### CSS elements
 * - `opener`
 * - `closer`
 * - `content`
 *
 * ### CSS custom properties on the root element
 * - `--lm-drawer-content-width` / `--lm-drawer-content-width-raw`
 * - `--lm-drawer-content-height` / `--lm-drawer-content-height-raw`
 * Absent until the first measurement lands.
 *
 * ### Data attributes on the root element
 * - `data-content-width`, `data-content-height` — the measured content size.
 * Absent until the first measurement lands.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A root `<div>` holding the opener, the closer and the measured content.
 *
 * @remarks
 * - In controlled mode (`isOpened` defined), the open state is fully driven by
 *   the parent and internal state is never updated.
 * - `onOpenerClicked` and `onCloserClicked` fire in both modes — a controlled
 *   parent needs them to know a click happened at all.
 * - `onIsOpenedChanged` fires in both modes too, and never on mount.
 */
export const Drawer: FunctionComponent<Props> = ({
  openerContent,
  closerContent,
  defaultIsOpened = false,
  isOpened: isOpenedProp,
  onOpenerClicked,
  onCloserClicked,
  onIsOpenedChanged,
  className,
  children
}) => {
  // State
  const [internalIsOpened, setInternalIsOpened] = useState(defaultIsOpened)
  const [contentDimensions, setContentDimensions] = useState<{
    width: number
    height: number
  }>()
  const isControlled = isOpenedProp !== undefined
  const isOpened = isOpenedProp ?? internalIsOpened

  // State dispatch
  useChangeDispatch(isOpened, onIsOpenedChanged)

  // User action handlers
  const handleOpenerClick = (): void => {
    onOpenerClicked?.(isOpened)
    if (isControlled) return
    setInternalIsOpened(true)
  }
  const handleCloserClick = (): void => {
    onCloserClicked?.(isOpened)
    if (isControlled) return
    setInternalIsOpened(false)
  }
  const handleContentResized: ResizeObserverProps['onResized'] = ({ entry }): void => {
    const { width, height } = entry.contentRect
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
  let dataAttributes: Record<string, string> = {}
  let customCssProps: Record<string, string> = {}
  if (contentDimensions !== undefined) {
    const { width, height } = contentDimensions
    dataAttributes = {
      'data-content-width': `${width}`,
      'data-content-height': `${height}`
    }
    customCssProps = {
      '--lm-drawer-content-width': `${width}px`,
      '--lm-drawer-content-width-raw': `${width}`,
      '--lm-drawer-content-height': `${height}px`,
      '--lm-drawer-content-height-raw': `${height}`
    }
  }
  return <div
    className={rootClss}
    {...dataAttributes}
    style={{ ...customCssProps }}>
    <div className={openerClss} onClick={handleOpenerClick}>{openerContent}</div>
    <div className={closerClss} onClick={handleCloserClick}>{closerContent}</div>
    <div className={contentClss}>
      <ResizeObserverComponent onResized={handleContentResized}>
        {children}
      </ResizeObserverComponent>
    </div>
  </div>
}
